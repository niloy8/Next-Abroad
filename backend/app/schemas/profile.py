from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class ProfileBase(BaseModel):
    nationality: Optional[str] = None
    country_of_residence: Optional[str] = None
    current_degree: Optional[str] = None
    desired_degree: Optional[str] = None
    field_of_study: Optional[str] = None
    institution: Optional[str] = None
    cgpa: Optional[float] = None
    grading_scale: Optional[float] = 4.0
    graduation_year: Optional[int] = None
    english_test: Optional[str] = "Not taken yet"
    english_score: Optional[float] = None
    english_subscores: Optional[Dict[str, float]] = None
    max_annual_tuition: Optional[float] = 0.0
    max_annual_living: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    preferred_countries: Optional[List[str]] = []
    preferred_cities: Optional[List[str]] = []
    scholarship_required: Optional[bool] = True
    fully_funded_preference: Optional[bool] = True
    partial_scholarship_acceptable: Optional[bool] = True
    tuition_waiver_preference: Optional[bool] = True
    part_time_work_preference: Optional[bool] = True
    research_preference: Optional[bool] = False
    public_private_preference: Optional[str] = "Any"
    preferred_intake: Optional[str] = "Fall 2026"


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    completeness_score: int
    cv_extracted_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompletenessResponse(BaseModel):
    completeness_score: int
    missing_fields: List[str]
    completed_fields: List[str]
