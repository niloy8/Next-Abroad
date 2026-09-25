from enum import Enum


class SourceTier(str, Enum):
    TIER_1 = "TIER_1"  # Official university, government, official scholarship org
    TIER_2 = "TIER_2"  # Recognized educational organizations, accredited portals
    TIER_3 = "TIER_3"  # Aggregator, blog, other sources


class OpportunityStatus(str, Enum):
    OPEN = "OPEN"
    UPCOMING = "UPCOMING"
    EXPIRED = "EXPIRED"
    ROLLING = "ROLLING"
    UNKNOWN = "UNKNOWN"


class EligibilityStatus(str, Enum):
    ELIGIBLE = "Eligible"
    POTENTIALLY_ELIGIBLE = "Potentially Eligible"
    NOT_ELIGIBLE = "Not Eligible"


class FundingType(str, Enum):
    FULLY_FUNDED = "Fully Funded"
    PARTIAL = "Partial Scholarship"
    TUITION_WAIVER = "Tuition Waiver"
    STIPEND_ONLY = "Monthly Stipend Only"


class DegreeLevel(str, Enum):
    BACHELORS = "Bachelor's"
    MASTERS = "Master's"
    PHD = "PhD"
    POSTDOC = "Postdoctoral"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
