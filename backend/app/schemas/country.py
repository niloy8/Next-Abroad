from typing import Optional, List
from pydantic import BaseModel


class CountryResponse(BaseModel):
    id: int
    code: str
    name: str
    currency: str
    avg_tuition_min: float
    avg_tuition_max: float
    avg_living_annual_min: float
    avg_living_annual_max: float
    visa_work_rights: str
    post_study_work_visa: str
    blocked_account_required: float
    popular_fields: List[str] = []
    flag_code: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
