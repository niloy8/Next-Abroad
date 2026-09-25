from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile
from app.schemas.profile import ProfileUpdate, ProfileResponse, CompletenessResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/profiles", tags=["Student Profiles"])


def compute_completeness(p: StudentProfile) -> CompletenessResponse:
    fields = [
        ("nationality", "Nationality"),
        ("country_of_residence", "Country of Residence"),
        ("current_degree", "Current Academic Degree"),
        ("desired_degree", "Target Degree Level"),
        ("field_of_study", "Field of Study"),
        ("cgpa", "Academic CGPA"),
        ("english_test", "English Test Information"),
        ("max_annual_tuition", "Annual Tuition Budget"),
        ("preferred_countries", "Preferred Target Countries"),
        ("preferred_intake", "Target Intake"),
    ]

    completed = []
    missing = []

    for attr, label in fields:
        val = getattr(p, attr, None)
        if attr == "preferred_countries":
            if val and len(val) > 0:
                completed.append(label)
            else:
                missing.append(label)
        elif attr == "english_test":
            if val and val != "Not taken yet" and p.english_score:
                completed.append(label)
            else:
                missing.append(label)
        elif val is not None and val != "":
            completed.append(label)
        else:
            missing.append(label)

    score = int((len(completed) / len(fields)) * 100)
    return CompletenessResponse(
        completeness_score=score,
        missing_fields=missing,
        completed_fields=completed,
    )


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_in: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    # Re-calculate completeness score
    completeness = compute_completeness(profile)
    profile.completeness_score = completeness.completeness_score

    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/me/completeness", response_model=CompletenessResponse)
async def get_profile_completeness(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        return CompletenessResponse(completeness_score=0, missing_fields=["All Profile Fields"], completed_fields=[])
    return compute_completeness(profile)
