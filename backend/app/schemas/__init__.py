from app.schemas.user import UserRegister, UserLogin, UserResponse, Token, TokenData
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse, CompletenessResponse
from app.schemas.source import SourceBase, SourceCreate, SourceResponse
from app.schemas.scholarship import ScholarshipBase, ScholarshipCreate, ScholarshipResponse, ScholarshipFilter
from app.schemas.university import ProgramBase, ProgramCreate, ProgramResponse, UniversityBase, UniversityCreate, UniversityResponse
from app.schemas.matching import EligibilityCriteriaCheck, EligibilityResult, UniversityMatchResult, MatchBreakdown
from app.schemas.search import SearchFilters, DiscoverySearchRequest, DiscoveryItemResponse, DiscoverySearchResponse
from app.schemas.cost import CostBreakdownResponse, CurrencyConvertRequest
from app.schemas.application import (
    SavedOpportunityCreate,
    SavedOpportunityResponse,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    PlanSummaryResponse,
)
from app.schemas.ai import AIChatRequest, AIChatResponse, CitationItem
from app.schemas.admin import (
    IngestionPreviewRequest,
    IngestionPreviewResponse,
    IngestionApprovalRequest,
    IngestionApprovalResponse,
    FreshnessReportResponse,
)
from app.schemas.country import CountryResponse

__all__ = [
    "UserRegister",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenData",
    "ProfileCreate",
    "ProfileUpdate",
    "ProfileResponse",
    "CompletenessResponse",
    "SourceBase",
    "SourceCreate",
    "SourceResponse",
    "ScholarshipBase",
    "ScholarshipCreate",
    "ScholarshipResponse",
    "ScholarshipFilter",
    "ProgramBase",
    "ProgramCreate",
    "ProgramResponse",
    "UniversityBase",
    "UniversityCreate",
    "UniversityResponse",
    "EligibilityCriteriaCheck",
    "EligibilityResult",
    "UniversityMatchResult",
    "MatchBreakdown",
    "SearchFilters",
    "DiscoverySearchRequest",
    "DiscoveryItemResponse",
    "DiscoverySearchResponse",
    "CostBreakdownResponse",
    "CurrencyConvertRequest",
    "SavedOpportunityCreate",
    "SavedOpportunityResponse",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "PlanSummaryResponse",
    "AIChatRequest",
    "AIChatResponse",
    "CitationItem",
    "IngestionPreviewRequest",
    "IngestionPreviewResponse",
    "IngestionApprovalRequest",
    "IngestionApprovalResponse",
    "FreshnessReportResponse",
    "CountryResponse",
]
