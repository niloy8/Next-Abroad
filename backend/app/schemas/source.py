from typing import Optional
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from app.models.enums import SourceTier


class SourceBase(BaseModel):
    url: str
    title: str
    tier: SourceTier = SourceTier.TIER_1
    organization: Optional[str] = None
    domain: Optional[str] = None
    is_verified: bool = True
    verification_notes: Optional[str] = None


class SourceCreate(SourceBase):
    pass


class SourceResponse(SourceBase):
    id: int
    retrieved_at: datetime
    last_verified_at: datetime

    class Config:
        from_attributes = True
