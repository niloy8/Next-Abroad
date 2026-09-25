from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile
from app.services.extraction.cv_extractor import CVExtractor
from app.utils.security import get_current_user

router = APIRouter(prefix="/cv", tags=["CV Extractor"])


@router.post("/parse")
async def parse_cv(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """
    Accepts an uploaded CV (.pdf, .txt, .docx), extracts structured academic & professional details,
    and returns them for student review.
    Does NOT overwrite the profile automatically.
    """
    content_bytes = await file.read()
    try:
        text = content_bytes.decode("utf-8", errors="ignore")
    except Exception:
        text = str(content_bytes)

    if len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Uploaded CV file appears to be empty or unreadable.")

    extracted_data = await CVExtractor.extract_from_text(text)

    return {
        "filename": file.filename,
        "extracted_data": extracted_data,
        "message": "CV successfully extracted. Please review and edit the details before saving to your profile.",
    }


@router.post("/apply-to-profile")
async def apply_cv_to_profile(
    reviewed_data: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Explicitly applies user-confirmed CV data to their active student profile."""
    res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)

    if "current_degree" in reviewed_data and reviewed_data["current_degree"]:
        profile.current_degree = reviewed_data["current_degree"]
    if "desired_degree" in reviewed_data and reviewed_data["desired_degree"]:
        profile.desired_degree = reviewed_data["desired_degree"]
    if "field_of_study" in reviewed_data and reviewed_data["field_of_study"]:
        profile.field_of_study = reviewed_data["field_of_study"]
    if "institution" in reviewed_data and reviewed_data["institution"]:
        profile.institution = reviewed_data["institution"]
    if "cgpa" in reviewed_data and reviewed_data["cgpa"]:
        profile.cgpa = float(reviewed_data["cgpa"])
    if "graduation_year" in reviewed_data and reviewed_data["graduation_year"]:
        profile.graduation_year = int(reviewed_data["graduation_year"])
    if "english_test" in reviewed_data and reviewed_data["english_test"]:
        profile.english_test = reviewed_data["english_test"]
    if "english_score" in reviewed_data and reviewed_data["english_score"]:
        profile.english_score = float(reviewed_data["english_score"])

    profile.cv_extracted_data = reviewed_data
    db.add(profile)
    await db.commit()
    await db.refresh(profile)

    return {"message": "Profile updated with verified CV data.", "profile": profile}
