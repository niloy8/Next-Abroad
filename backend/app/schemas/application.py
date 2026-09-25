from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import TaskStatus


class SavedOpportunityCreate(BaseModel):
    opportunity_type: str  # "scholarship" or "program" or "university"
    opportunity_id: int
    title: str
    subtitle: Optional[str] = None
    country: Optional[str] = None
    deadline: Optional[str] = None
    notes: Optional[str] = None


class SavedOpportunityResponse(BaseModel):
    id: int
    user_id: int
    opportunity_type: str
    opportunity_id: int
    title: str
    subtitle: Optional[str] = None
    country: Optional[str] = None
    deadline: Optional[str] = None
    notes: Optional[str] = None
    saved_at: datetime

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    opportunity_id: Optional[int] = None
    title: str
    category: str = "Documents"
    description: Optional[str] = None
    deadline: Optional[str] = None
    order_index: int = 0
    is_custom: bool = True


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[TaskStatus] = None
    order_index: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    user_id: int
    opportunity_id: Optional[int] = None
    title: str
    category: str
    description: Optional[str] = None
    deadline: Optional[str] = None
    status: TaskStatus
    order_index: int
    is_custom: bool
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PlanSummaryResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    progress_percentage: int
    saved_opportunities_count: int
    upcoming_deadlines: List[TaskResponse]
    tasks: List[TaskResponse]
