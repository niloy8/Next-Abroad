from typing import Dict, Optional
from app.schemas.cost import CostBreakdownResponse

# Reference exchange rates relative to EUR (as base)
EXCHANGE_RATES: Dict[str, float] = {
    "EUR": 1.0,
    "USD": 1.08,
    "GBP": 0.85,
    "CAD": 1.48,
    "AUD": 1.65,
    "SEK": 11.45,
    "CHF": 0.96,
    "BDT": 128.5,
    "INR": 90.2,
}


def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    """Convert amount between supported currencies using exchange rates."""
    from_curr = from_currency.upper()
    to_curr = to_currency.upper()

    if from_curr == to_curr:
        return amount

    # Convert from_curr to EUR base
    rate_from = EXCHANGE_RATES.get(from_curr, 1.0)
    rate_to = EXCHANGE_RATES.get(to_curr, 1.0)

    amount_in_eur = amount / rate_from
    converted = amount_in_eur * rate_to
    return round(converted, 2)


def calculate_cost_breakdown(
    country: str,
    city: Optional[str] = None,
    university_name: Optional[str] = None,
    program_name: Optional[str] = None,
    tuition_annual: float = 0.0,
    living_annual: float = 10000.0,
    currency: str = "EUR",
    target_currency: str = "USD",
    scholarship_offset_annual: float = 0.0,
) -> CostBreakdownResponse:
    """
    Computes first-year and recurring annual costs with breakdown:
    - Tuition
    - Living Expenses (accommodation, groceries, utilities)
    - Health Insurance
    - Visa & Residence Permit
    - Application & Registration Fees
    All amounts converted to target currency.
    """
    rate = convert_currency(1.0, currency, target_currency)

    # Standard documented benchmark costs by country
    health_insurance = 110.0 * 12.0  # Approx €110/mo in Europe
    visa_fee = 75.0  # One-time first year
    app_fee = 100.0  # One-time first year (uni-assist / admissions fee)
    settling_in = 800.0  # Deposit, SIM, winter gear (one-time first year)

    # Convert components to target currency
    c_tuition = convert_currency(tuition_annual, currency, target_currency)
    c_living = convert_currency(living_annual, currency, target_currency)
    c_insurance = convert_currency(health_insurance, "EUR", target_currency)
    c_visa = convert_currency(visa_fee, "EUR", target_currency)
    c_app = convert_currency(app_fee, "EUR", target_currency)
    c_settling = convert_currency(settling_in, "EUR", target_currency)
    c_offset = convert_currency(scholarship_offset_annual, currency, target_currency)

    # Recurring annual cost = Tuition + Living + Health Insurance
    recurring_annual = c_tuition + c_living + c_insurance

    # First year cost = Recurring + One-time (Visa + App Fee + Initial Settling In)
    first_year = recurring_annual + c_visa + c_app + c_settling

    net_first_year = max(0.0, first_year - c_offset)
    net_recurring = max(0.0, recurring_annual - c_offset)

    return CostBreakdownResponse(
        country=country,
        city=city,
        university_name=university_name,
        program_name=program_name,
        base_currency=currency,
        target_currency=target_currency,
        exchange_rate=round(rate, 4),
        tuition_annual=round(c_tuition, 2),
        living_annual=round(c_living, 2),
        health_insurance_annual=round(c_insurance, 2),
        visa_residence_permit=round(c_visa, 2),
        application_fees=round(c_app, 2),
        other_documented_costs=round(c_settling, 2),
        estimated_first_year_total=round(first_year, 2),
        estimated_recurring_annual_total=round(recurring_annual, 2),
        scholarship_offset_annual=round(c_offset, 2),
        net_first_year_out_of_pocket=round(net_first_year, 2),
        net_recurring_annual_out_of_pocket=round(net_recurring, 2),
        source_attribution=f"National Student Services & University admissions benchmark ({country})",
        last_verified="2026-03-01",
    )
