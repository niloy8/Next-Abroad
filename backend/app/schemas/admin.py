from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import SourceTier, OpportunityStatus


class IngestionPreviewRequest(BaseModel):
    source_url: str
    source_type: str = "scholarship"  # "scholarship", "university", "program"
    custom_notes: Optional[str] = None


class ExtractedField(BaseModel):
    field_name: str
    extracted_value: Any
    confidence: float
    verified_by_rule: bool


class IngestionPreviewResponse(BaseModel):
    source_url: str
    source_title: str
    source_tier: SourceTier
    detected_entity_type: str
    extracted_data: Dict[str, Any]
    validation_status: str  # "Ready for Approval", "Needs Manual Review", "Incomplete"
    validation_warnings: List[str]
    detected_deadline: Optional[str] = None
    detected_status: OpportunityStatus


class IngestionApprovalRequest(BaseModel):
    source_url: str
    source_title: str
    source_tier: SourceTier = SourceTier.TIER_1
    entity_type: str
    approved_data: Dict[str, Any]
    admin_notes: Optional[str] = None


class IngestionApprovalResponse(BaseModel):
    success: bool
    entity_id: int
    entity_type: str
    message: str
    source_id: int
    verified_at: datetime


class FreshnessAuditItem(BaseModel):
    id: int
    type: str
    name: str
    source_url: str
    last_verified_at: datetime
    days_since_verification: int
    status: OpportunityStatus
    needs_recheck: bool


class FreshnessReportResponse(BaseModel):
    total_records: int
    fresh_count: int
    stale_count: int  # > 30 days
    expired_count: int
    items_needing_review: List[FreshnessAuditItem]
