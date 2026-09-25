from app.services.cost.cost_service import calculate_cost_breakdown, convert_currency


def test_currency_conversion():
    # 100 EUR should convert to 108 USD with rate 1.08
    converted = convert_currency(100.0, "EUR", "USD")
    assert converted == 108.0

    # Same currency conversion
    assert convert_currency(500.0, "EUR", "EUR") == 500.0


def test_cost_breakdown_first_year_vs_recurring():
    breakdown = calculate_cost_breakdown(
        country="Germany",
        city="Munich",
        tuition_annual=0.0,
        living_annual=11500.0,
        currency="EUR",
        target_currency="EUR",
        scholarship_offset_annual=0.0,
    )

    # First year must include one-time fees (visa, settling in, app fee)
    # Recurring is tuition + living + insurance
    assert breakdown.estimated_first_year_total > breakdown.estimated_recurring_annual_total
    assert breakdown.tuition_annual == 0.0
    assert breakdown.living_annual == 11500.0
