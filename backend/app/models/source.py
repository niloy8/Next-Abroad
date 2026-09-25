import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import SourceTier


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(500), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    tier = Column(SQLEnum(SourceTier), default=SourceTier.TIER_1, nullable=False)
    organization = Column(String(255), nullable=True)
    domain = Column(String(100), index=True, nullable=True)
    retrieved_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_verified = Column(Boolean, default=True)
    verification_notes = Column(Text, nullable=True)

    # Relationships
    universities = relationship("University", back_populates="source")
    scholarships = relationship("Scholarship", back_populates="source")
