from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.scholarship import Scholarship
from app.models.source import Source
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.scholarship import ScholarshipResponse, ScholarshipCreate
from app.schemas.matching import EligibilityResult
from app.services.matching.eligibility_engine import evaluate_scholarship_eligibility
from app.utils.security import get_current_user_optional

router = APIRouter(prefix="/scholarships", tags=["Scholarships"])


@router.get("", response_model=List[ScholarshipResponse])
async def list_scholarships(
    country: Optional[str] = Query(None),
    degree_level: Optional[str] = Query(None),
    field: Optional[str] = Query(None),
    funding_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    min_cgpa: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Scholarship).options(selectinload(Scholarship.source))

    if country and country != "All":
        query = query.where(Scholarship.country.ilike(f"%{country}%"))
    if degree_level and degree_level != "All":
        query = query.where(Scholarship.degree_level == degree_level)
    if funding_type and funding_type != "All":
        query = query.where(Scholarship.funding_type == funding_type)
    if status and status != "All":
        query = query.where(Scholarship.status == status)

    res = await db.execute(query)
    items = res.scalars().all()

    # In-memory filter for JSON fields or CGPA
    results = []
    for item in items:
        if field and field != "All":
            fields_list = [f.lower() for f in (item.eligible_fields or [])]
            if not any(field.lower() in f or "all" in f for f in fields_list):
                continue
        if min_cgpa is not None and item.min_cgpa > min_cgpa:
            continue
        results.append(item)

    return results


@router.get("/{scholarship_id}", response_model=ScholarshipResponse)
async def get_scholarship(
    scholarship_id: int,
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Scholarship)
        .options(selectinload(Scholarship.source))
        .where(Scholarship.id == scholarship_id)
    )
    sch = res.scalar_one_or_none()
    if not sch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scholarship opportunity not found.",
        )
    return sch


@router.get("/{scholarship_id}/eligibility", response_model=EligibilityResult)
async def check_scholarship_eligibility(
    scholarship_id: int,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    res = await db.execute(select(Scholarship).where(Scholarship.id == scholarship_id))
    sch = res.scalar_one_or_none()
    if not sch:
        raise HTTPException(status_code=404, detail="Scholarship not found.")

    profile = None
    if user:
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        profile = p_res.scalar_one_or_none()

    return evaluate_scholarship_eligibility(sch, profile)
