from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class WorkflowStep(BaseModel):
    type: str
    name: str

class CreateWorkflowRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    steps: List[WorkflowStep]

class WorkflowResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    steps: List[dict]
    created_at: datetime

class RunWorkflowRequest(BaseModel):
    inputText: str = Field(..., min_length=1)

class StepResult(BaseModel):
    stepNumber: int
    stepType: str
    stepName: str
    input: str
    output: Optional[str]
    status: str
    error: Optional[str] = None

class RunWorkflowResponse(BaseModel):
    workflowId: int
    workflowName: str
    results: List[StepResult]

class HealthResponse(BaseModel):
    status: str
    database: str
    llm: str
    timestamp: str
