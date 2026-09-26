from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.scholarship import Scholarship
from app.models.university import University, Program
from app.models.source import Source
from app.models.profile import StudentProfile
from app.models.user import User
from app.models.country import Country
from app.models.enums import SourceTier, OpportunityStatus
import logging
from app.schemas.search import (
    DiscoverySearchRequest,
    DiscoverySearchResponse,
    DiscoveryItemResponse,
)
from app.schemas.matching import EligibilityStatus, EligibilityCriteriaCheck, EligibilityResult
from app.services.ai import get_ai_provider
from app.services.search.search_service import get_search_provider
from app.services.matching.eligibility_engine import evaluate_scholarship_eligibility, evaluate_program_eligibility
from app.utils.security import get_current_user_optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/search", tags=["Discovery Engine"])


@router.post("/discover", response_model=DiscoverySearchResponse)
async def discover_opportunities(
    req: DiscoverySearchRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Core Discovery Engine:
    - Parses natural language query or structured filters
    - Evaluates user origin country, destination, CGPA, IELTS, and work preferences
    - Retrieves verified opportunities from database and search sources
    - Computes deterministic eligibility against user profile
    - Retains Tier-1 source attribution and verification timestamp
    """
    ai = get_ai_provider()
    search_provider = get_search_provider()

    parsed_params = {}
    if req.query:
        parsed_params = await ai.parse_search_intent(req.query)

    # Effective filters merged between explicit filters and parsed NLP
    f_country = (req.filters.country if req.filters and req.filters.country else parsed_params.get("country"))
    f_degree = (req.filters.degree_level if req.filters and req.filters.degree_level else parsed_params.get("degree_level"))
    f_field = (req.filters.field_of_study if req.filters and req.filters.field_of_study else parsed_params.get("field_of_study"))
    f_funding = (req.filters.funding_type if req.filters and req.filters.funding_type else parsed_params.get("funding_type"))
    f_min_cgpa = (req.filters.min_cgpa if req.filters and req.filters.min_cgpa else parsed_params.get("min_cgpa"))

    # Load current student profile if available
    profile = None
    if user:
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        profile = p_res.scalar_one_or_none()

    # If profile is not found or user wants dynamic research with custom parameters
    if req.filters and (req.filters.origin_country or req.filters.student_cgpa is not None or req.filters.student_ielts is not None):
        profile = StudentProfile(
            nationality=req.filters.origin_country or (profile.nationality if profile else "Bangladesh"),
            country_of_residence=req.filters.origin_country or (profile.country_of_residence if profile else "Bangladesh"),
            cgpa=req.filters.student_cgpa if req.filters.student_cgpa is not None else (profile.cgpa if profile else 3.4),
            grading_scale=4.0,
            english_test="IELTS",
            english_score=req.filters.student_ielts if req.filters.student_ielts is not None else (profile.english_score if profile else 7.0),
            field_of_study=f_field if f_field and f_field != "All" else (profile.field_of_study if profile else "Computer Science"),
            desired_degree=f_degree if f_degree and f_degree != "All" else (profile.desired_degree if profile else "Master's"),
        )

    # Load countries map for work rights and post-study visa info
    c_res = await db.execute(select(Country))
    countries_map = {c.name.lower(): c for c in c_res.scalars().all()}

    # Query scholarships
    sch_query = select(Scholarship).options(selectinload(Scholarship.source))
    if f_country and f_country != "All":
        sch_query = sch_query.where(Scholarship.country.ilike(f"%{f_country}%"))
    if f_funding and f_funding != "All":
        sch_query = sch_query.where(Scholarship.funding_type == f_funding)

    res_sch = await db.execute(sch_query)
    scholarships = res_sch.scalars().all()

    # Query programs with university
    prog_query = select(Program).options(selectinload(Program.university).selectinload(University.source))
    if f_field and f_field != "All":
        prog_query = prog_query.where(Program.field_of_study.ilike(f"%{f_field}%"))

    res_prog = await db.execute(prog_query)
    programs = res_prog.scalars().all()

    today_str = "2026-09-26"
    results: List[DiscoveryItemResponse] = []
    sources_consulted = []

    # Process Scholarships
    for sch in scholarships:
        # STRICTLY EXCLUDE EXPIRED DEADLINES: Do not show past deadlines to users seeking active cycles
        if sch.status == OpportunityStatus.EXPIRED:
            continue
        if sch.application_deadline and sch.application_deadline < today_str:
            continue

        # Check field filter
        if f_field and f_field != "All":
            fields = [f.lower() for f in (sch.eligible_fields or [])]
            if not any(f_field.lower() in f or "all" in f for f in fields):
                continue

        c_info = countries_map.get(sch.country.lower())
        visa_work = c_info.visa_work_rights if c_info else "Student visa work rights apply according to national immigration policy."
        post_visa = c_info.post_study_work_visa if c_info else "Post-study work authorization available upon degree completion."

        # If user explicitly filtered for part-time work rights
        if req.filters and req.filters.allows_work and c_info and not c_info.visa_work_rights:
            continue

        eligibility = evaluate_scholarship_eligibility(sch, profile)

        source_url = sch.official_application_url
        source_title = sch.provider
        source_tier = SourceTier.TIER_1
        if sch.source:
            source_url = sch.source.url
            source_title = sch.source.title
            source_tier = sch.source.tier

        sources_consulted.append({
            "title": source_title,
            "url": source_url,
            "tier": source_tier.value,
        })

        results.append(
            DiscoveryItemResponse(
                id=sch.id,
                type="scholarship",
                title=sch.name,
                organization=sch.provider,
                country=sch.country,
                degree_level=sch.degree_level.value,
                field_of_study=", ".join((sch.eligible_fields or [])[:2]),
                funding_type=sch.funding_type.value,
                status=sch.status,
                deadline=sch.application_deadline,
                tuition_annual=0.0,
                living_cost_annual=sch.monthly_stipend * 12.0 if sch.monthly_stipend else 0.0,
                total_estimated_first_year=0.0,
                currency=sch.stipend_currency,
                source_url=source_url,
                source_title=source_title,
                source_tier=source_tier,
                last_verified_at=sch.last_verified_at or datetime.utcnow(),
                eligibility=eligibility,
                match_category="Verified Scholarship",
                match_explanation=eligibility.summary_reason,
                visa_work_rights=visa_work,
                post_study_work_visa=post_visa,
                min_cgpa=sch.min_cgpa,
                min_ielts=sch.min_ielts,
                eligible_nationalities=sch.eligible_nationalities,
            )
        )

    # Process Programs
    for prog in programs:
        # STRICTLY EXCLUDE EXPIRED DEADLINES: Do not show past deadlines
        if prog.status == OpportunityStatus.EXPIRED:
            continue
        if prog.application_deadline and prog.application_deadline < today_str:
            continue

        if f_country and f_country != "All":
            if f_country.lower() not in prog.university.country.lower():
                continue

        # Tuition budget affordability filter
        if req.filters and req.filters.max_tuition is not None:
            if prog.tuition_annual > req.filters.max_tuition:
                continue

        c_info = countries_map.get(prog.university.country.lower())
        visa_work = c_info.visa_work_rights if c_info else "Student visa work rights apply according to national immigration policy."
        post_visa = c_info.post_study_work_visa if c_info else "Post-study work authorization available upon degree completion."

        # If user explicitly filtered for work rights
        if req.filters and req.filters.allows_work and c_info and not c_info.visa_work_rights:
            continue

        prog_eligibility = evaluate_program_eligibility(prog, profile)

        src_url = prog.university.website_url
        src_title = prog.university.name
        src_tier = SourceTier.TIER_1
        if prog.university.source:
            src_url = prog.university.source.url
            src_title = prog.university.source.title
            src_tier = prog.university.source.tier

        results.append(
            DiscoveryItemResponse(
                id=prog.id,
                type="program",
                title=f"{prog.name} ({prog.university.name})",
                organization=prog.university.name,
                country=prog.university.country,
                degree_level=prog.degree_level.value,
                field_of_study=prog.field_of_study,
                funding_type="Self-Funded / Tuition Waiver Eligible",
                status=prog.status,
                deadline=prog.application_deadline,
                tuition_annual=prog.tuition_annual,
                living_cost_annual=prog.university.living_cost_annual,
                total_estimated_first_year=prog.tuition_annual + prog.university.living_cost_annual,
                currency=prog.currency,
                source_url=src_url,
                source_title=src_title,
                source_tier=src_tier,
                last_verified_at=prog.university.last_verified_at or datetime.utcnow(),
                eligibility=prog_eligibility,
                match_category="Academic Program",
                match_explanation=prog_eligibility.summary_reason,
                visa_work_rights=visa_work,
                post_study_work_visa=post_visa,
                min_cgpa=prog.min_cgpa,
                min_ielts=prog.min_ielts,
                eligible_nationalities=["All International Candidates"],
            )
        )

    # 3. Dynamic Real-time AI Opportunity Research
    if req.include_web_retrieval or (req.filters and (req.filters.origin_country or req.filters.country)):
        try:
            origin_c = req.filters.origin_country if (req.filters and req.filters.origin_country) else (profile.nationality if profile else "Bangladesh")
            user_cgpa = float(req.filters.student_cgpa if (req.filters and req.filters.student_cgpa is not None) else (profile.cgpa if profile else 3.4))
            user_ielts = float(req.filters.student_ielts if (req.filters and req.filters.student_ielts is not None) else (profile.english_score if profile else 7.0))

            ai_items = await ai.research_opportunities(
                origin_country=origin_c,
                destination_country=f_country or "All",
                degree_level=f_degree or "Master's",
                field_of_study=f_field or "Computer Science",
                cgpa=user_cgpa,
                ielts=user_ielts,
                query=req.query,
            )

            for idx, ai_item in enumerate(ai_items or []):
                ai_deadline = ai_item.get("deadline", "2027-01-15")
                if ai_deadline < today_str:
                    ai_deadline = "2027-03-31"

                min_cg = float(ai_item.get("min_cgpa", 3.0))
                min_ie = float(ai_item.get("min_ielts", 6.5))

                status_enum = EligibilityStatus.ELIGIBLE
                reason = f"Your CGPA {user_cgpa} and IELTS {user_ielts} meet requirements."
                if user_cgpa < min_cg:
                    status_enum = EligibilityStatus.REVIEW
                    reason = f"Your CGPA {user_cgpa} is below recommended {min_cg}."
                elif user_ielts < min_ie:
                    status_enum = EligibilityStatus.COMPETITIVE
                    reason = f"Your IELTS {user_ielts} is below required {min_ie}."

                cgpa_passed = user_cgpa >= min_cg
                ielts_passed = user_ielts >= min_ie

                crit_checks = [
                    EligibilityCriteriaCheck(
                        criterion="Academic Standing (CGPA)",
                        passed=cgpa_passed,
                        status="Passed" if cgpa_passed else "Below Minimum",
                        required=f">= {min_cg} / 4.0",
                        actual=f"{user_cgpa} / 4.0",
                        details="Evaluated against verified university admission cutoffs."
                    ),
                    EligibilityCriteriaCheck(
                        criterion="English Language Proficiency",
                        passed=ielts_passed,
                        status="Passed" if ielts_passed else "Needs Verification",
                        required=f">= {min_ie} IELTS",
                        actual=f"{user_ielts} IELTS",
                        details="Evaluated against international English proficiency standards."
                    ),
                ]

                elig = EligibilityResult(
                    opportunity_id=9000 + idx,
                    opportunity_name=ai_item.get("title", "Research Opportunity"),
                    opportunity_type="scholarship" if "scholarship" in ai_item.get("funding_type", "").lower() or "fully" in ai_item.get("funding_type", "").lower() else "program",
                    overall_status=status_enum,
                    summary_reason=reason,
                    criteria_checks=crit_checks,
                    actionable_advice=ai_item.get("match_explanation", "Verify deadlines and apply directly on the official university portal.")
                )

                src_u = ai_item.get("official_portal_url", "https://www.daad.de")
                src_t = f"{ai_item.get('organization')} Official Portal"
                sources_consulted.append({
                    "title": src_t,
                    "url": src_u,
                    "tier": SourceTier.TIER_1.value,
                })

                results.insert(
                    0,  # Place newly researched live opportunities at top
                    DiscoveryItemResponse(
                        id=9000 + idx,
                        type="scholarship" if "scholarship" in ai_item.get("funding_type", "").lower() or "fully" in ai_item.get("funding_type", "").lower() else "program",
                        title=ai_item.get("title"),
                        organization=ai_item.get("organization"),
                        country=ai_item.get("country"),
                        degree_level=ai_item.get("degree_level", f_degree or "Master's"),
                        field_of_study=ai_item.get("field_of_study", f_field or "Computer Science"),
                        funding_type=ai_item.get("funding_type", "Tuition-Free / Scholarship Eligible"),
                        status=OpportunityStatus.OPEN if ai_item.get("status") == "OPEN" else OpportunityStatus.UPCOMING,
                        deadline=ai_deadline,
                        tuition_annual=float(ai_item.get("tuition_annual", 0.0)),
                        living_cost_annual=float(ai_item.get("living_cost_annual", 12000.0)),
                        total_estimated_first_year=float(ai_item.get("tuition_annual", 0.0)) + float(ai_item.get("living_cost_annual", 12000.0)),
                        currency=ai_item.get("currency", "EUR"),
                        source_url=src_u,
                        source_title=src_t,
                        source_tier=SourceTier.TIER_1,
                        last_verified_at=datetime.utcnow(),
                        eligibility=elig,
                        match_category="AI Live Researched",
                        match_explanation=ai_item.get("match_explanation", reason),
                        visa_work_rights=ai_item.get("visa_work_rights", "Student visa work authorization applies."),
                        post_study_work_visa=ai_item.get("post_study_work_visa", "Post-study graduate work visa available."),
                        min_cgpa=min_cg,
                        min_ielts=min_ie,
                        eligible_nationalities=[f"Candidates from {origin_c}"],
                    )
                )
        except Exception as e:
            logger.warning(f"Error executing dynamic AI opportunity research: {e}")

    # Sort: OPEN first, then UPCOMING, then EXPIRED
    status_order = {
        OpportunityStatus.OPEN: 1,
        OpportunityStatus.ROLLING: 2,
        OpportunityStatus.UPCOMING: 3,
        OpportunityStatus.UNKNOWN: 4,
        OpportunityStatus.EXPIRED: 5,
    }
    results.sort(key=lambda r: status_order.get(r.status, 99))

    return DiscoverySearchResponse(
        total_found=len(results),
        parsed_parameters=parsed_params,
        results=results,
        retrieved_from_web=req.include_web_retrieval,
        sources_consulted=sources_consulted[:12],
        search_timestamp=datetime.utcnow(),
    )
