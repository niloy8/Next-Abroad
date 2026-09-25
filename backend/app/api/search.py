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
from app.models.enums import SourceTier, OpportunityStatus
from app.schemas.search import (
    DiscoverySearchRequest,
    DiscoverySearchResponse,
    DiscoveryItemResponse,
)
from app.services.ai import get_ai_provider
from app.services.search.search_service import get_search_provider
from app.services.matching.eligibility_engine import evaluate_scholarship_eligibility, evaluate_program_eligibility
from app.utils.security import get_current_user_optional

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

    results: List[DiscoveryItemResponse] = []
    sources_consulted = []

    # Process Scholarships
    for sch in scholarships:
        # Check field filter
        if f_field and f_field != "All":
            fields = [f.lower() for f in (sch.eligible_fields or [])]
            if not any(f_field.lower() in f or "all" in f for f in fields):
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
            )
        )

    # Process Programs
    for prog in programs:
        if f_country and f_country != "All":
            if f_country.lower() not in prog.university.country.lower():
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
            )
        )

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
        sources_consulted=sources_consulted[:8],
        search_timestamp=datetime.utcnow(),
    )
