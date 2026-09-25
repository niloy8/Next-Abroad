import pytest
from app.models.scholarship import Scholarship
from app.models.profile import StudentProfile
from app.models.enums import OpportunityStatus, FundingType, DegreeLevel, EligibilityStatus
from app.services.matching.eligibility_engine import evaluate_scholarship_eligibility, normalize_gpa


def test_normalize_gpa():
    assert normalize_gpa(3.5, 4.0) == 3.5
    assert normalize_gpa(4.5, 5.0) == 3.6
    assert normalize_gpa(8.5, 10.0) == 3.4
    assert normalize_gpa(None, 4.0) is None


def test_eligibility_matching_eligible():
    sch = Scholarship(
        id=1,
        name="Test Full Scholarship",
        provider="Test Provider",
        country="Germany",
        degree_level=DegreeLevel.MASTERS,
        eligible_fields=["Computer Science"],
        funding_type=FundingType.FULLY_FUNDED,
        min_cgpa=3.0,
        grading_scale=4.0,
        min_ielts=6.5,
        eligible_nationalities=["Bangladesh", "All International Candidates"],
        application_deadline="2026-10-15",
        status=OpportunityStatus.OPEN,
        official_application_url="https://example.com/apply",
    )

    profile = StudentProfile(
        cgpa=3.4,
        grading_scale=4.0,
        english_test="IELTS",
        english_score=7.0,
        field_of_study="Computer Science",
        nationality="Bangladesh",
    )

    result = evaluate_scholarship_eligibility(sch, profile)
    assert result.overall_status == EligibilityStatus.ELIGIBLE
    assert any("Academic CGPA" in c.criterion and c.passed for c in result.criteria_checks)


def test_eligibility_matching_not_eligible_low_gpa():
    sch = Scholarship(
        id=2,
        name="High Honors Scholarship",
        provider="Test Provider",
        country="Switzerland",
        degree_level=DegreeLevel.MASTERS,
        eligible_fields=["Computer Science"],
        funding_type=FundingType.FULLY_FUNDED,
        min_cgpa=3.7,
        grading_scale=4.0,
        min_ielts=7.0,
        eligible_nationalities=["All International Candidates"],
        application_deadline="2026-10-15",
        status=OpportunityStatus.OPEN,
        official_application_url="https://example.com/apply",
    )

    profile = StudentProfile(
        cgpa=3.1,
        grading_scale=4.0,
        english_test="IELTS",
        english_score=7.5,
        field_of_study="Computer Science",
        nationality="Bangladesh",
    )

    result = evaluate_scholarship_eligibility(sch, profile)
    assert result.overall_status == EligibilityStatus.NOT_ELIGIBLE
    assert "Minimum CGPA: 3.70/4.0" in result.summary_reason
