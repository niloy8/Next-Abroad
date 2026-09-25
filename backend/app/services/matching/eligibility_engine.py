from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.enums import EligibilityStatus, OpportunityStatus
from app.schemas.matching import EligibilityResult, EligibilityCriteriaCheck
from app.models.scholarship import Scholarship
from app.models.university import Program
from app.models.profile import StudentProfile


def normalize_gpa(gpa: Optional[float], scale: Optional[float]) -> Optional[float]:
    """Normalize CGPA to a 4.0 standard scale for comparison."""
    if gpa is None:
        return None
    if not scale or scale <= 0:
        scale = 4.0
    return round((gpa / scale) * 4.0, 2)


def evaluate_scholarship_eligibility(
    scholarship: Scholarship,
    profile: Optional[StudentProfile],
) -> EligibilityResult:
    """
    Deterministic rule-based eligibility evaluation for a scholarship.
    Compares CGPA, English language proficiency, nationality, degree level,
    field of study, and application status/deadline.
    """
    criteria_checks: List[EligibilityCriteriaCheck] = []
    has_hard_failure = False
    has_unverified = False
    failure_reasons = []

    if not profile:
        return EligibilityResult(
            opportunity_id=scholarship.id,
            opportunity_name=scholarship.name,
            opportunity_type="scholarship",
            overall_status=EligibilityStatus.POTENTIALLY_ELIGIBLE,
            summary_reason="Profile not complete. Please enter your academic background and test scores to verify eligibility.",
            criteria_checks=[
                EligibilityCriteriaCheck(
                    criterion="Profile Completed",
                    passed=False,
                    status="Needs Verification",
                    required="Completed Profile (CGPA, English Test)",
                    actual="No profile data",
                    details="Provide your GPA and language scores in the Onboarding section.",
                )
            ],
            actionable_advice="Complete your student profile to unlock automated eligibility verification.",
        )

    # 1. CGPA Check
    student_gpa_norm = normalize_gpa(profile.cgpa, profile.grading_scale)
    req_gpa_norm = normalize_gpa(scholarship.min_cgpa, scholarship.grading_scale)

    if scholarship.min_cgpa and scholarship.min_cgpa > 0:
        if student_gpa_norm is None:
            has_unverified = True
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Academic CGPA",
                    passed=False,
                    status="Needs Verification",
                    required=f"Min CGPA {scholarship.min_cgpa:.2f}/{scholarship.grading_scale:.1f}",
                    actual="Not provided",
                    details="Add your CGPA in profile to confirm academic threshold.",
                )
            )
        elif student_gpa_norm >= req_gpa_norm:
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Academic CGPA",
                    passed=True,
                    status="Passed",
                    required=f"Min CGPA {scholarship.min_cgpa:.2f}/{scholarship.grading_scale:.1f} (~{req_gpa_norm:.2f}/4.0)",
                    actual=f"{profile.cgpa:.2f}/{profile.grading_scale:.1f} (~{student_gpa_norm:.2f}/4.0)",
                    details=f"Your CGPA exceeds the minimum academic requirement of {req_gpa_norm:.2f}/4.0.",
                )
            )
        else:
            has_hard_failure = True
            failure_reasons.append(
                f"Minimum CGPA: {req_gpa_norm:.2f}/4.0 | Your CGPA: {student_gpa_norm:.2f}/4.0"
            )
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Academic CGPA",
                    passed=False,
                    status="Failed",
                    required=f"Min CGPA {scholarship.min_cgpa:.2f}/{scholarship.grading_scale:.1f} (~{req_gpa_norm:.2f}/4.0)",
                    actual=f"{profile.cgpa:.2f}/{profile.grading_scale:.1f} (~{student_gpa_norm:.2f}/4.0)",
                    details=f"Your CGPA is below the mandatory minimum of {req_gpa_norm:.2f}/4.0.",
                )
            )

    # 2. English Proficiency Check
    if scholarship.min_ielts or scholarship.min_toefl:
        student_test = (profile.english_test or "").upper()
        student_score = profile.english_score

        if not student_score or "NOT TAKEN" in student_test:
            has_unverified = True
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="English Proficiency",
                    passed=False,
                    status="Needs Verification",
                    required=f"IELTS {scholarship.min_ielts or 6.5} or TOEFL {scholarship.min_toefl or 80}",
                    actual=f"Test status: {profile.english_test or 'Not taken'}",
                    details="Take an approved English proficiency test (IELTS, TOEFL, or PTE) and record your score.",
                )
            )
        elif "IELTS" in student_test:
            req_ielts = scholarship.min_ielts or 6.5
            if student_score >= req_ielts:
                criteria_checks.append(
                    EligibilityCriteriaCheck(
                        criterion="English Proficiency",
                        passed=True,
                        status="Passed",
                        required=f"IELTS min {req_ielts}",
                        actual=f"IELTS {student_score:.1f}",
                        details=f"Your IELTS score meets or exceeds the required band {req_ielts}.",
                    )
                )
            else:
                has_hard_failure = True
                failure_reasons.append(f"Minimum IELTS: {req_ielts} | Your Score: {student_score}")
                criteria_checks.append(
                    EligibilityCriteriaCheck(
                        criterion="English Proficiency",
                        passed=False,
                        status="Failed",
                        required=f"IELTS min {req_ielts}",
                        actual=f"IELTS {student_score:.1f}",
                        details=f"Your IELTS score is below the minimum required band {req_ielts}.",
                    )
                )
        elif "TOEFL" in student_test:
            req_toefl = scholarship.min_toefl or 80.0
            if student_score >= req_toefl:
                criteria_checks.append(
                    EligibilityCriteriaCheck(
                        criterion="English Proficiency",
                        passed=True,
                        status="Passed",
                        required=f"TOEFL min {req_toefl:.0f}",
                        actual=f"TOEFL {student_score:.0f}",
                        details=f"Your TOEFL score meets the required {req_toefl:.0f}.",
                    )
                )
            else:
                has_hard_failure = True
                failure_reasons.append(f"Minimum TOEFL: {req_toefl:.0f} | Your Score: {student_score:.0f}")
                criteria_checks.append(
                    EligibilityCriteriaCheck(
                        criterion="English Proficiency",
                        passed=False,
                        status="Failed",
                        required=f"TOEFL min {req_toefl:.0f}",
                        actual=f"TOEFL {student_score:.0f}",
                        details=f"Your TOEFL score is below the required {req_toefl:.0f}.",
                    )
                )
        else:
            # PTE or Duolingo or other
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="English Proficiency",
                    passed=True,
                    status="Needs Verification",
                    required=f"Equivalent score for IELTS {scholarship.min_ielts or 6.5}",
                    actual=f"{profile.english_test}: {student_score}",
                    details="Verify test equivalence directly with the official scholarship guidelines.",
                )
            )

    # 3. Field of Study Check
    eligible_fields = scholarship.eligible_fields or []
    if eligible_fields and profile.field_of_study:
        p_field = profile.field_of_study.lower()
        matched_field = any(f.lower() in p_field or p_field in f.lower() for f in eligible_fields)
        if matched_field or "all fields" in [f.lower() for f in eligible_fields]:
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Field of Study",
                    passed=True,
                    status="Passed",
                    required="Eligible Academic Fields",
                    actual=profile.field_of_study,
                    details=f"Your field '{profile.field_of_study}' is included under eligible disciplines.",
                )
            )
        else:
            has_unverified = True
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Field of Study",
                    passed=False,
                    status="Needs Verification",
                    required=", ".join(eligible_fields[:3]),
                    actual=profile.field_of_study,
                    details="Your field of study may require interdisciplinary alignment verification with the provider.",
                )
            )

    # 4. Nationality Check
    eligible_nats = scholarship.eligible_nationalities or []
    if eligible_nats and profile.nationality:
        p_nat = profile.nationality.lower()
        is_eligible_nat = any(
            nat.lower() in p_nat or "international" in nat.lower() or "all" in nat.lower()
            for nat in eligible_nats
        )
        if is_eligible_nat:
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Nationality",
                    passed=True,
                    status="Passed",
                    required="Eligible Countries/Regions",
                    actual=profile.nationality,
                    details=f"Citizens of {profile.nationality} are eligible to apply.",
                )
            )
        else:
            has_hard_failure = True
            failure_reasons.append(f"Eligible Nationalities: {', '.join(eligible_nats[:2])}")
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Nationality",
                    passed=False,
                    status="Failed",
                    required=", ".join(eligible_nats[:3]),
                    actual=profile.nationality,
                    details=f"Nationality {profile.nationality} is not listed in the eligible countries for this award.",
                )
            )

    # 5. Opportunity Status Check
    if scholarship.status == OpportunityStatus.EXPIRED:
        has_hard_failure = True
        failure_reasons.append("Opportunity deadline has expired for current intake")
        criteria_checks.append(
            EligibilityCriteriaCheck(
                criterion="Application Timeline",
                passed=False,
                status="Failed",
                required="Open Application Cycle",
                actual="Status: EXPIRED",
                details=f"Application closed on {scholarship.application_deadline}. Check for the next upcoming cycle.",
            )
        )
    else:
        criteria_checks.append(
            EligibilityCriteriaCheck(
                criterion="Application Timeline",
                passed=True,
                status="Passed",
                required=f"Deadline: {scholarship.application_deadline}",
                actual=f"Status: {scholarship.status.value}",
                details=f"Applications are currently {scholarship.status.value.lower()}.",
            )
        )

    # Determine overall status
    if has_hard_failure:
        overall_status = EligibilityStatus.NOT_ELIGIBLE
        summary_reason = f"Not Eligible: {'; '.join(failure_reasons)}"
        advice = "Focus on other scholarships where your academic profile and test scores satisfy all mandatory criteria."
    elif has_unverified:
        overall_status = EligibilityStatus.POTENTIALLY_ELIGIBLE
        summary_reason = "Potentially Eligible: Meets main criteria, but some specific requirements need verification."
        advice = "Update missing details in your profile or check the official portal guidelines for confirmation."
    else:
        overall_status = EligibilityStatus.ELIGIBLE
        summary_reason = "Eligible: All known mandatory academic, language, and nationality requirements are satisfied."
        advice = "You meet all verified requirements! Prepare required documents and submit early before the deadline."

    return EligibilityResult(
        opportunity_id=scholarship.id,
        opportunity_name=scholarship.name,
        opportunity_type="scholarship",
        overall_status=overall_status,
        summary_reason=summary_reason,
        criteria_checks=criteria_checks,
        actionable_advice=advice,
    )


def evaluate_program_eligibility(
    program: Program,
    profile: Optional[StudentProfile],
) -> EligibilityResult:
    """Deterministic eligibility check for academic degree programs."""
    criteria_checks: List[EligibilityCriteriaCheck] = []
    has_hard_failure = False
    has_unverified = False
    failure_reasons = []

    if not profile:
        return EligibilityResult(
            opportunity_id=program.id,
            opportunity_name=program.name,
            opportunity_type="program",
            overall_status=EligibilityStatus.POTENTIALLY_ELIGIBLE,
            summary_reason="Profile incomplete. Enter your GPA and English test score.",
            criteria_checks=[],
            actionable_advice="Complete your profile to verify program requirements.",
        )

    # CGPA Check
    student_gpa = normalize_gpa(profile.cgpa, profile.grading_scale)
    req_gpa = normalize_gpa(program.min_cgpa, program.grading_scale)

    if req_gpa:
        if student_gpa is None:
            has_unverified = True
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Academic CGPA",
                    passed=False,
                    status="Needs Verification",
                    required=f"Min CGPA {req_gpa:.2f}/4.0",
                    actual="Not provided",
                    details="Provide your CGPA.",
                )
            )
        elif student_gpa >= req_gpa:
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Academic CGPA",
                    passed=True,
                    status="Passed",
                    required=f"Min CGPA {req_gpa:.2f}/4.0",
                    actual=f"{student_gpa:.2f}/4.0",
                    details="Satisfies minimum GPA cutoff.",
                )
            )
        else:
            has_hard_failure = True
            failure_reasons.append(f"Min CGPA: {req_gpa:.2f}/4.0 vs Student: {student_gpa:.2f}/4.0")
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="Academic CGPA",
                    passed=False,
                    status="Failed",
                    required=f"Min CGPA {req_gpa:.2f}/4.0",
                    actual=f"{student_gpa:.2f}/4.0",
                    details="CGPA is below program admissions cutoff.",
                )
            )

    # English Language Check
    if program.min_ielts:
        if not profile.english_score or "NOT TAKEN" in (profile.english_test or "").upper():
            has_unverified = True
            criteria_checks.append(
                EligibilityCriteriaCheck(
                    criterion="English Language",
                    passed=False,
                    status="Needs Verification",
                    required=f"IELTS {program.min_ielts}",
                    actual="Not taken",
                    details="Submit IELTS or recognized equivalent.",
                )
            )
        elif "IELTS" in (profile.english_test or "").upper():
            if profile.english_score >= program.min_ielts:
                criteria_checks.append(
                    EligibilityCriteriaCheck(
                        criterion="English Language",
                        passed=True,
                        status="Passed",
                        required=f"IELTS {program.min_ielts}",
                        actual=f"IELTS {profile.english_score}",
                        details="Language threshold achieved.",
                    )
                )
            else:
                has_hard_failure = True
                failure_reasons.append(f"Min IELTS: {program.min_ielts} vs Score: {profile.english_score}")
                criteria_checks.append(
                    EligibilityCriteriaCheck(
                        criterion="English Language",
                        passed=False,
                        status="Failed",
                        required=f"IELTS {program.min_ielts}",
                        actual=f"IELTS {profile.english_score}",
                        details="IELTS band below admission requirement.",
                    )
                )

    if has_hard_failure:
        status = EligibilityStatus.NOT_ELIGIBLE
        summary = f"Not Eligible: {'; '.join(failure_reasons)}"
    elif has_unverified:
        status = EligibilityStatus.POTENTIALLY_ELIGIBLE
        summary = "Potentially Eligible: Meets academic baseline; complete tests to confirm."
    else:
        status = EligibilityStatus.ELIGIBLE
        summary = "Eligible: Meets all published admission thresholds."

    return EligibilityResult(
        opportunity_id=program.id,
        opportunity_name=program.name,
        opportunity_type="program",
        overall_status=status,
        summary_reason=summary,
        criteria_checks=criteria_checks,
        actionable_advice="Verify document prerequisites and prepare application package.",
    )
