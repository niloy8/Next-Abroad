from typing import Optional, Dict
from pydantic import BaseModel


class CostItem(BaseModel):
    category: str
    amount: float
    currency: str
    is_estimate: bool = True
    source_reference: Optional[str] = None
    notes: Optional[str] = None


class CostBreakdownResponse(BaseModel):
    country: str
    city: Optional[str] = None
    university_name: Optional[str] = None
    program_name: Optional[str] = None
    base_currency: str
    target_currency: str
    exchange_rate: float
    
    # Categorized costs in target currency
    tuition_annual: float
    living_annual: float
    health_insurance_annual: float
    visa_residence_permit: float
    application_fees: float
    other_documented_costs: float
    
    # Summary totals
    estimated_first_year_total: float
    estimated_recurring_annual_total: float
    
    # Financial aid / scholarship offset if applicable
    scholarship_offset_annual: float = 0.0
    net_first_year_out_of_pocket: float
    net_recurring_annual_out_of_pocket: float
    
    source_attribution: str
    last_verified: str


class CurrencyConvertRequest(BaseModel):
    amount: float
    from_currency: str
    to_currency: str
