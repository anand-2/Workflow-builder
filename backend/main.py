import os
import json
from datetime import datetime
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import get_db_connection, init_db
from gemini_service import process_step, check_health
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

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("🚀 Server started successfully")

# Health check endpoint
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check health of backend, database, and LLM"""
    try:
        # Check database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT NOW()")
        db_healthy = bool(cursor.fetchone())
        cursor.close()
        conn.close()
    except Exception as e:
        db_healthy = False
        print(f"Database health check failed: {e}")
    
    # Check Gemini
    llm_healthy = await check_health()
    
    status = "healthy" if (db_healthy and llm_healthy) else "unhealthy"
    
    return HealthResponse(
        status=status,
        database="connected" if db_healthy else "disconnected",
        llm="connected" if llm_healthy else "disconnected",
        timestamp=datetime.utcnow().isoformat()
    )

# Get all workflows
@app.get("/api/workflows", response_model=List[WorkflowResponse])
async def get_workflows():
    """Get all workflows"""
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

# Get single workflow
@app.get("/api/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(workflow_id: int):
    """Get a single workflow by ID"""
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

# Create workflow
@app.post("/api/workflows", response_model=WorkflowResponse, status_code=201)
async def create_workflow(workflow: CreateWorkflowRequest):
    """Create a new workflow"""
    if not workflow.name or not workflow.steps:
        raise HTTPException(status_code=400, detail="Name and steps are required")
    
    if len(workflow.steps) < 1:
        raise HTTPException(status_code=400, detail="At least one step is required")
    
    if len(workflow.steps) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 steps allowed")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Convert steps to JSON
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

# Delete workflow
@app.delete("/api/workflows/{workflow_id}")
async def delete_workflow(workflow_id: int):
    """Delete a workflow"""
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

# Run workflow
@app.post("/api/workflows/{workflow_id}/run", response_model=RunWorkflowResponse)
async def run_workflow(workflow_id: int, request: RunWorkflowRequest):
    """Run a workflow with input text"""
    if not request.inputText.strip():
        raise HTTPException(status_code=400, detail="Input text is required")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get workflow
        cursor.execute("SELECT * FROM workflows WHERE id = %s", (workflow_id,))
        workflow = cursor.fetchone()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        steps = workflow['steps']
        results = []
        current_input = request.inputText
        
        # Execute each step
        for i, step in enumerate(steps):
            try:
                output = await process_step(step['type'], current_input)
                
                results.append(StepResult(
                    stepNumber=i + 1,
                    stepType=step['type'],
                    stepName=step['name'],
                    input=current_input,
                    output=output,
                    status='success'
                ))
                
                current_input = output  # Output becomes input for next step
            except Exception as e:
                results.append(StepResult(
                    stepNumber=i + 1,
                    stepType=step['type'],
                    stepName=step['name'],
                    input=current_input,
                    output=None,
                    status='failed',
                    error=str(e)
                ))
                break  # Stop on first error
        
        # Save run to database
        results_json = json.dumps([r.dict() for r in results])
        cursor.execute(
            """
            INSERT INTO workflow_runs (workflow_id, input_text, results) 
            VALUES (%s, %s, %s)
            """,
            (workflow_id, request.inputText, results_json)
        )
        conn.commit()
        
        return RunWorkflowResponse(
            workflowId=workflow_id,
            workflowName=workflow['name'],
            results=results
        )
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# Get workflow run history
@app.get("/api/workflows/{workflow_id}/runs")
async def get_workflow_runs(workflow_id: int):
    """Get last 5 runs for a workflow"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            SELECT * FROM workflow_runs 
            WHERE workflow_id = %s 
            ORDER BY created_at DESC 
            LIMIT 5
            """,
            (workflow_id,)
        )
        runs = cursor.fetchall()
        return runs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# Get all recent runs
@app.get("/api/runs")
async def get_all_runs():
    """Get last 5 runs across all workflows"""
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

# Root endpoint
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
