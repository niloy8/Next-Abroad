from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import OpportunityStatus, DegreeLevel
from app.schemas.source import SourceResponse


class ProgramBase(BaseModel):
    name: str
    degree_level: DegreeLevel = DegreeLevel.MASTERS
    field_of_study: str
    duration_months: int = 24
    tuition_annual: float = 0.0
    currency: str = "EUR"
    language: str = "English"
    min_cgpa: float = 3.0
    grading_scale: float = 4.0
    min_ielts: float = 6.5
    min_toefl: float = 85.0
    gre_required: bool = False
    intake: str = "Fall 2026"
    application_deadline: str = "2026-07-15"
    status: OpportunityStatus = OpportunityStatus.OPEN
    application_url: Optional[str] = None
    overview: Optional[str] = None


class ProgramCreate(ProgramBase):
    pass


class ProgramResponse(ProgramBase):
    id: int
    university_id: int

    class Config:
        from_attributes = True


class UniversityBase(BaseModel):
    name: str
    country: str
    city: str
    global_rank: Optional[int] = None
    type: str = "Public"
    website_url: str
    admissions_url: Optional[str] = None
    living_cost_annual: float = 10000.0
    currency: str = "EUR"
    acceptance_rate: Optional[float] = None
    overview: Optional[str] = None


class UniversityCreate(UniversityBase):
    source_url: Optional[str] = None


class UniversityResponse(UniversityBase):
    id: int
    source_id: Optional[int] = None
    source: Optional[SourceResponse] = None
    programs: List[ProgramResponse] = []
    last_verified_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
