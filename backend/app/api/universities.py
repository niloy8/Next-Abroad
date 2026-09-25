from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.university import University, Program
from app.models.source import Source
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.university import UniversityResponse
from app.schemas.matching import UniversityMatchResult
from app.services.matching.university_matching import match_university
from app.utils.security import get_current_user_optional

router = APIRouter(prefix="/universities", tags=["Universities"])


@router.get("", response_model=List[UniversityResponse])
async def list_universities(
    country: Optional[str] = Query(None),
    max_tuition: Optional[float] = Query(None),
    type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(University)
        .options(selectinload(University.source), selectinload(University.programs))
    )

    if country and country != "All":
        query = query.where(University.country.ilike(f"%{country}%"))
    if type and type != "All":
        query = query.where(University.type == type)

    res = await db.execute(query)
    unis = res.scalars().all()

    if max_tuition is not None:
        unis = [
            u for u in unis
            if not u.programs or any(p.tuition_annual <= max_tuition for p in u.programs)
        ]

    return unis


@router.get("/{university_id}", response_model=UniversityResponse)
async def get_university(
    university_id: int,
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(University)
        .options(selectinload(University.source), selectinload(University.programs))
        .where(University.id == university_id)
    )
    uni = res.scalar_one_or_none()
    if not uni:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found.",
        )
    return uni


@router.get("/{university_id}/match", response_model=UniversityMatchResult)
async def get_university_match(
    university_id: int,
    program_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    res = await db.execute(
        select(University)
        .options(selectinload(University.programs))
        .where(University.id == university_id)
    )
    uni = res.scalar_one_or_none()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found.")

    selected_program = None
    if program_id:
        p_res = await db.execute(select(Program).where(Program.id == program_id))
        selected_program = p_res.scalar_one_or_none()
    elif uni.programs:
        selected_program = uni.programs[0]

    profile = None
    if user:
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        profile = p_res.scalar_one_or_none()

    return match_university(uni, selected_program, profile)
