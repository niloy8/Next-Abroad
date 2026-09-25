from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import OpportunityStatus, FundingType, DegreeLevel, SourceTier
from app.schemas.source import SourceResponse


class ScholarshipBase(BaseModel):
    name: str
    provider: str
    country: str
    university_id: Optional[int] = None
    degree_level: DegreeLevel = DegreeLevel.MASTERS
    eligible_fields: List[str] = []
    funding_type: FundingType = FundingType.FULLY_FUNDED
    tuition_coverage_pct: float = 100.0
    monthly_stipend: float = 934.0
    stipend_currency: str = "EUR"
    travel_support: bool = True
    travel_allowance_amount: float = 1000.0
    accommodation_support: bool = True
    health_insurance: bool = True
    min_cgpa: float = 3.0
    grading_scale: float = 4.0
    min_ielts: float = 6.5
    min_toefl: float = 80.0
    eligible_nationalities: List[str] = []
    work_experience_years_required: float = 0.0
    required_documents: List[str] = []
    application_steps: List[str] = []
    application_open_date: Optional[str] = None
    application_deadline: str
    status: OpportunityStatus = OpportunityStatus.OPEN
    status_reason: Optional[str] = None
    official_application_url: str
    overview: Optional[str] = None


class ScholarshipCreate(ScholarshipBase):
    source_url: Optional[str] = None
    source_tier: Optional[SourceTier] = SourceTier.TIER_1


class ScholarshipResponse(ScholarshipBase):
    id: int
    source_id: Optional[int] = None
    source: Optional[SourceResponse] = None
    last_verified_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ScholarshipFilter(BaseModel):
    country: Optional[str] = None
    degree_level: Optional[str] = None
    field: Optional[str] = None
    funding_type: Optional[str] = None
    status: Optional[str] = None
    min_cgpa: Optional[float] = None
    max_budget: Optional[float] = None
