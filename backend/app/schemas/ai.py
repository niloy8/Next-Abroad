from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class CitationItem(BaseModel):
    title: str
    url: str
    tier: str = "TIER_1"
    last_verified: Optional[str] = None


class MessageItem(BaseModel):
    id: Optional[int] = None
    role: str  # "user" or "assistant"
    content: str
    citations: Optional[List[CitationItem]] = []
    created_at: Optional[datetime] = None


class AIChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    context_type: Optional[str] = None  # "general", "scholarship", "university", "eligibility"
    context_id: Optional[int] = None


class AIChatResponse(BaseModel):
    conversation_id: int
    reply: str
    citations: List[CitationItem]
    verified_data: bool = True
    suggested_follow_ups: List[str] = []
    created_at: datetime
