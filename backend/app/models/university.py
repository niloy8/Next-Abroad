import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import OpportunityStatus, DegreeLevel


class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    country = Column(String(100), index=True, nullable=False)
    city = Column(String(100), nullable=False)
    global_rank = Column(Integer, nullable=True)
    type = Column(String(50), default="Public")  # Public, Private
    website_url = Column(String(500), nullable=False)
    admissions_url = Column(String(500), nullable=True)
    living_cost_annual = Column(Float, default=10000.0)
    currency = Column(String(10), default="EUR")
    acceptance_rate = Column(Float, nullable=True)
    overview = Column(Text, nullable=True)
    
    # Source provenance
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)
    last_verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    source = relationship("Source", back_populates="universities")
    programs = relationship("Program", back_populates="university", cascade="all, delete-orphan")
    scholarships = relationship("Scholarship", back_populates="university")


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    name = Column(String(255), index=True, nullable=False)
    degree_level = Column(SQLEnum(DegreeLevel), default=DegreeLevel.MASTERS, nullable=False)
    field_of_study = Column(String(150), index=True, nullable=False)
    duration_months = Column(Integer, default=24)
    tuition_annual = Column(Float, default=0.0)
    currency = Column(String(10), default="EUR")
    language = Column(String(50), default="English")
    
    # Academic & Language requirements
    min_cgpa = Column(Float, default=3.0)
    grading_scale = Column(Float, default=4.0)
    min_ielts = Column(Float, default=6.5)
    min_toefl = Column(Float, default=85.0)
    gre_required = Column(Boolean, default=False)

    # Deadlines & Intake
    intake = Column(String(50), default="Fall 2026")
    application_deadline = Column(String(100), default="2026-07-15")
    status = Column(SQLEnum(OpportunityStatus), default=OpportunityStatus.OPEN)
    application_url = Column(String(500), nullable=True)
    overview = Column(Text, nullable=True)

    # Relationship
    university = relationship("University", back_populates="programs")
