from typing import List, Optional
from app.models.university import University, Program
from app.models.profile import StudentProfile
from app.schemas.matching import UniversityMatchResult, MatchBreakdown
from app.services.matching.eligibility_engine import normalize_gpa


def match_university(
    university: University,
    program: Optional[Program],
    profile: Optional[StudentProfile],
) -> UniversityMatchResult:
    """
    Computes a balanced, neutral match assessment between a student profile
    and a university program.
    Uses neutral match classifications:
    - Strong match
    - Possible match
    - Requirement mismatch
    - Needs verification
    """
    if not profile:
        return UniversityMatchResult(
            university_id=university.id,
            university_name=university.name,
            country=university.country,
            program_name=program.name if program else None,
            match_category="Needs verification",
            match_score=50,
            match_breakdown=MatchBreakdown(
                academic_score=50,
                financial_score=50,
                language_score=50,
                preference_score=50,
            ),
            reasons=["General university profile matching baseline."],
            missing_requirements=["Student profile incomplete."],
            estimated_annual_cost=university.living_cost_annual + (program.tuition_annual if program else 0.0),
            currency=university.currency,
        )

    academic_score = 70
    financial_score = 70
    language_score = 70
    preference_score = 70
    reasons = []
    missing_requirements = []

    # 1. Academic Matching
    student_gpa = normalize_gpa(profile.cgpa, profile.grading_scale)
    req_gpa = normalize_gpa(program.min_cgpa, program.grading_scale) if program else 3.0

    if student_gpa is not None and req_gpa is not None:
        if student_gpa >= req_gpa + 0.3:
            academic_score = 95
            reasons.append(f"Academic CGPA ({student_gpa:.2f}) comfortably exceeds program threshold ({req_gpa:.2f}).")
        elif student_gpa >= req_gpa:
            academic_score = 85
            reasons.append(f"Academic CGPA ({student_gpa:.2f}) meets program minimum ({req_gpa:.2f}).")
        else:
            academic_score = 40
            missing_requirements.append(f"CGPA ({student_gpa:.2f}) is below target threshold ({req_gpa:.2f}).")
    else:
        academic_score = 60
        missing_requirements.append("Academic GPA not recorded in profile.")

    # 2. Financial & Budget Matching
    annual_tuition = program.tuition_annual if program else 0.0
    annual_living = university.living_cost_annual
    total_annual = annual_tuition + annual_living

    if profile.max_annual_tuition is not None and profile.max_annual_tuition > 0:
        if annual_tuition <= profile.max_annual_tuition:
            financial_score = 95
            reasons.append(f"Tuition fee ({annual_tuition:,.0f} {university.currency}) falls within your stated budget.")
        else:
            financial_score = 45
            missing_requirements.append(
                f"Tuition ({annual_tuition:,.0f} {university.currency}) exceeds current budget ({profile.max_annual_tuition:,.0f}). Requires scholarship."
            )
    else:
        if annual_tuition == 0:
            financial_score = 95
            reasons.append("Zero or negligible tuition fee structure at public institution.")
        else:
            financial_score = 70

    # 3. Language Requirement Matching
    req_ielts = program.min_ielts if program else 6.5
    if profile.english_score and "IELTS" in (profile.english_test or "").upper():
        if profile.english_score >= req_ielts:
            language_score = 95
            reasons.append(f"English proficiency (IELTS {profile.english_score}) satisfies admissions requirement ({req_ielts}).")
        else:
            language_score = 40
            missing_requirements.append(f"IELTS score ({profile.english_score}) below program requirement ({req_ielts}).")
    else:
        language_score = 60
        missing_requirements.append("English test scores not yet verified.")

    # 4. Country & Field Preference Matching
    pref_countries = [c.lower() for c in (profile.preferred_countries or [])]
    if university.country.lower() in pref_countries:
        preference_score += 20
        reasons.append(f"Located in one of your target destinations: {university.country}.")

    if program and profile.field_of_study:
        if profile.field_of_study.lower() in program.field_of_study.lower() or program.field_of_study.lower() in profile.field_of_study.lower():
            preference_score += 15
            reasons.append(f"Program aligned with your target discipline ({program.field_of_study}).")

    preference_score = min(100, preference_score)

    # Weighted Total Score
    total_score = int(
        (academic_score * 0.35)
        + (financial_score * 0.25)
        + (language_score * 0.20)
        + (preference_score * 0.20)
    )

    # Neutral Classification
    if missing_requirements and any("CGPA" in m or "IELTS" in m for m in missing_requirements):
        match_category = "Requirement mismatch"
    elif any("not recorded" in m or "not yet verified" in m for m in missing_requirements):
        match_category = "Needs verification"
    elif total_score >= 82:
        match_category = "Strong match"
    else:
        match_category = "Possible match"

    return UniversityMatchResult(
        university_id=university.id,
        university_name=university.name,
        country=university.country,
        program_name=program.name if program else None,
        match_category=match_category,
        match_score=total_score,
        match_breakdown=MatchBreakdown(
            academic_score=academic_score,
            financial_score=financial_score,
            language_score=language_score,
            preference_score=preference_score,
        ),
        reasons=reasons,
        missing_requirements=missing_requirements,
        estimated_annual_cost=total_annual,
        currency=university.currency,
    )
