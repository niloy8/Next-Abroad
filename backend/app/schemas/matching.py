from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.enums import EligibilityStatus


class EligibilityCriteriaCheck(BaseModel):
    criterion: str  # "CGPA", "English Proficiency", "Nationality", "Field of Study", "Deadline"
    passed: bool
    status: str  # "Passed", "Failed", "Needs Verification"
    required: str
    actual: str
    details: str


class EligibilityResult(BaseModel):
    opportunity_id: int
    opportunity_name: str
    opportunity_type: str  # "scholarship" or "program"
    overall_status: EligibilityStatus
    summary_reason: str
    criteria_checks: List[EligibilityCriteriaCheck]
    actionable_advice: Optional[str] = None


class MatchBreakdown(BaseModel):
    academic_score: int  # 0-100
    financial_score: int
    language_score: int
    preference_score: int


class UniversityMatchResult(BaseModel):
    university_id: int
    university_name: str
    country: str
    program_name: Optional[str] = None
    match_category: str  # "Strong match", "Possible match", "Requirement mismatch", "Needs verification"
    match_score: int  # 0 - 100
    match_breakdown: MatchBreakdown
    reasons: List[str]
    missing_requirements: List[str]
    estimated_annual_cost: float
    currency: str
