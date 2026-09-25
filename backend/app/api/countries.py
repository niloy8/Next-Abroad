from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.country import Country
from app.schemas.country import CountryResponse

router = APIRouter(prefix="/countries", tags=["Countries"])


@router.get("", response_model=List[CountryResponse])
async def list_countries(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Country).order_by(Country.name))
    return res.scalars().all()


@router.get("/{code}", response_model=CountryResponse)
async def get_country(code: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Country).where(Country.code.ilike(code)))
    country = res.scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Country profile not found.")
    return country
