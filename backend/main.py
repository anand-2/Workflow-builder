import os
import json
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from database import get_db_connection, init_db
from gemini_service import process_step, process_step_stream_sync, check_health
from models import (
    CreateWorkflowRequest,
    WorkflowResponse,
    RunWorkflowRequest,
    RunWorkflowResponse,
    StepResult,
    HealthResponse
)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Workflow Builder API", version="1.0.0")

# --- Cache Configuration ---
health_cache = {
    "data": None,
    "last_updated": None,
    "ttl_seconds": 300  # 5 minutes
}

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()
    print("🚀 Server started successfully")

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check health of backend, database, and LLM with caching"""
    global health_cache
    
    now = datetime.utcnow()
    
    # Return cached response if it exists and is not expired
    if (health_cache["data"] and health_cache["last_updated"] and 
        (now - health_cache["last_updated"]).total_seconds() < health_cache["ttl_seconds"]):
        return health_cache["data"]

    # Perform actual checks
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1") # Lighter than SELECT NOW()
        db_healthy = bool(cursor.fetchone())
        cursor.close()
        conn.close()
    except Exception as e:
        db_healthy = False
        print(f"Database health check failed: {e}")
    
    llm_healthy = await check_health()
    status = "healthy" if (db_healthy and llm_healthy) else "unhealthy"
    
    new_health_data = HealthResponse(
        status=status,
        database="connected" if db_healthy else "disconnected",
        llm="connected" if llm_healthy else "disconnected",
        timestamp=now.isoformat()
    )
    
    # Update cache
    health_cache["data"] = new_health_data
    health_cache["last_updated"] = now
    
    return new_health_data

# --- Workflow Endpoints ---

@app.get("/api/workflows", response_model=List[WorkflowResponse])
async def get_workflows():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM workflows ORDER BY created_at DESC")
        workflows = cursor.fetchall()
        return workflows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM workflows WHERE id = %s", (workflow_id,))
        workflow = cursor.fetchone()
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return workflow
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post("/api/workflows", response_model=WorkflowResponse, status_code=201)
async def create_workflow(workflow: CreateWorkflowRequest):
    if not workflow.name or not workflow.steps:
        raise HTTPException(status_code=400, detail="Name and steps are required")
    
    if len(workflow.steps) < 1:
        raise HTTPException(status_code=400, detail="At least one step is required")
    
    if len(workflow.steps) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 steps allowed")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        steps_json = json.dumps([step.dict() for step in workflow.steps])
        cursor.execute(
            """
            INSERT INTO workflows (name, description, steps) 
            VALUES (%s, %s, %s) 
            RETURNING *
            """,
            (workflow.name, workflow.description, steps_json)
        )
        new_workflow = cursor.fetchone()
        conn.commit()
        return new_workflow
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.delete("/api/workflows/{workflow_id}")
async def delete_workflow(workflow_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM workflows WHERE id = %s RETURNING *", (workflow_id,))
        deleted = cursor.fetchone()
        if not deleted:
            raise HTTPException(status_code=404, detail="Workflow not found")
        conn.commit()
        return {"message": "Workflow deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def _stream_workflow_run(workflow_id: int, workflow: dict, input_text: str):
    steps = workflow['steps']
    results = []
    current_input = input_text
    try:
        for i, step in enumerate(steps):
            step_number = i + 1
            step_type = step['type']
            step_name = step.get('name', step_type)
            full_output = []
            yield f"data: {json.dumps({'type': 'step_start', 'stepNumber': step_number, 'stepName': step_name, 'stepType': step_type})}\n\n"
            try:
                for chunk in process_step_stream_sync(step_type, current_input):
                    full_output.append(chunk)
                    yield f"data: {json.dumps({'type': 'chunk', 'stepNumber': step_number, 'chunk': chunk})}\n\n"
                output = ''.join(full_output)
                if step_type in ('tag_category', 'sentiment_analysis'):
                    output = output.strip()
                results.append({
                    'stepNumber': step_number,
                    'stepType': step_type,
                    'stepName': step_name,
                    'input': current_input,
                    'output': output,
                    'status': 'success'
                })
                yield f"data: {json.dumps({'type': 'step_done', 'stepNumber': step_number, 'output': output})}\n\n"
                current_input = output
            except Exception as e:
                results.append({
                    'stepNumber': step_number,
                    'stepType': step_type,
                    'stepName': step_name,
                    'input': current_input,
                    'output': None,
                    'status': 'failed',
                    'error': str(e)
                })
                yield f"data: {json.dumps({'type': 'step_error', 'stepNumber': step_number, 'error': str(e)})}\n\n"
                break
        
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            results_json = json.dumps(results)
            cursor.execute(
                "INSERT INTO workflow_runs (workflow_id, input_text, results) VALUES (%s, %s, %s)",
                (workflow_id, input_text, results_json)
            )
            conn.commit()
        finally:
            cursor.close()
            conn.close()
        yield f"data: {json.dumps({'type': 'complete', 'results': results, 'workflowId': workflow_id, 'workflowName': workflow['name']})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

@app.post("/api/workflows/{workflow_id}/run/stream")
async def run_workflow_stream(workflow_id: int, request: RunWorkflowRequest):
    if not request.inputText.strip():
        raise HTTPException(status_code=400, detail="Input text is required")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM workflows WHERE id = %s", (workflow_id,))
        workflow = cursor.fetchone()
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
    finally:
        cursor.close()
        conn.close()
    return StreamingResponse(
        _stream_workflow_run(workflow_id, workflow, request.inputText),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@app.get("/api/runs")
async def get_all_runs():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT wr.*, w.name as workflow_name 
            FROM workflow_runs wr
            JOIN workflows w ON wr.workflow_id = w.id
            ORDER BY wr.created_at DESC 
            LIMIT 5
            """
        )
        runs = cursor.fetchall()
        return runs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/workflows/{workflow_id}/runs")
async def get_workflow_runs(workflow_id: int):
    """Fetch all execution history for a specific workflow"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT wr.*, w.name as workflow_name 
            FROM workflow_runs wr
            JOIN workflows w ON wr.workflow_id = w.id
            WHERE wr.workflow_id = %s
            ORDER BY wr.created_at DESC
            """, 
            (workflow_id,)
        )
        runs = cursor.fetchall()
        
        # Note: If no runs exist, it returns an empty list [], which is correct
        return runs
    except Exception as e:
        print(f"Error fetching runs for workflow {workflow_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        cursor.close()
        conn.close()
        
@app.get("/")
async def root():
    return {
        "message": "Workflow Builder API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))