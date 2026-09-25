from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import OpportunityStatus, FundingType, DegreeLevel, SourceTier, EligibilityStatus
from app.schemas.matching import EligibilityResult


class SearchFilters(BaseModel):
    country: Optional[str] = None
    degree_level: Optional[str] = None
    field_of_study: Optional[str] = None
    funding_type: Optional[str] = None
    max_budget: Optional[float] = None
    intake: Optional[str] = None
    status: Optional[str] = None
    min_cgpa: Optional[float] = None
    english_test: Optional[str] = None
    min_english_score: Optional[float] = None


class DiscoverySearchRequest(BaseModel):
    query: Optional[str] = None  # Natural language query
    filters: Optional[SearchFilters] = None
    user_profile_id: Optional[int] = None
    include_web_retrieval: bool = True


class DiscoveryItemResponse(BaseModel):
    id: int
    type: str  # "scholarship" or "program"
    title: str
    organization: str
    country: str
    degree_level: str
    field_of_study: str
    funding_type: Optional[str] = None
    status: OpportunityStatus
    deadline: str
    tuition_annual: float
    living_cost_annual: float
    total_estimated_first_year: float
    currency: str
    
    # Source provenance
    source_url: str
    source_title: str
    source_tier: SourceTier
    last_verified_at: datetime
    
    # Eligibility calculation
    eligibility: Optional[EligibilityResult] = None
    match_category: Optional[str] = None
    match_explanation: Optional[str] = None


class DiscoverySearchResponse(BaseModel):
    total_found: int
    parsed_parameters: Optional[dict] = None
    results: List[DiscoveryItemResponse]
    retrieved_from_web: bool
    sources_consulted: List[dict]
    search_timestamp: datetime
