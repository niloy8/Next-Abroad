import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import OpportunityStatus, FundingType, DegreeLevel


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    provider = Column(String(255), nullable=False)  # e.g., DAAD, Fulbright, Swedish Institute
    country = Column(String(100), index=True, nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    
    degree_level = Column(SQLEnum(DegreeLevel), default=DegreeLevel.MASTERS, nullable=False)
    eligible_fields = Column(JSON, default=list)  # ["Computer Science", "Engineering", "Data Science"]
    funding_type = Column(SQLEnum(FundingType), default=FundingType.FULLY_FUNDED, nullable=False)
    
    # Financial coverage details
    tuition_coverage_pct = Column(Float, default=100.0)  # 100% = full tuition waiver
    monthly_stipend = Column(Float, default=934.0)
    stipend_currency = Column(String(10), default="EUR")
    travel_support = Column(Boolean, default=True)
    travel_allowance_amount = Column(Float, default=1000.0)
    accommodation_support = Column(Boolean, default=True)
    health_insurance = Column(Boolean, default=True)

    # Deterministic Eligibility criteria
    min_cgpa = Column(Float, default=3.0)
    grading_scale = Column(Float, default=4.0)
    min_ielts = Column(Float, default=6.5)
    min_toefl = Column(Float, default=80.0)
    eligible_nationalities = Column(JSON, default=list)  # ["All International", "Developing Countries", ...]
    work_experience_years_required = Column(Float, default=0.0)
    required_documents = Column(JSON, default=list)  # ["Transcripts", "CV", "Letter of Motivation", "2 LORs"]
    application_steps = Column(JSON, default=list)

    # Dates & Status
    application_open_date = Column(String(50), nullable=True)
    application_deadline = Column(String(50), nullable=False)
    status = Column(SQLEnum(OpportunityStatus), default=OpportunityStatus.OPEN, nullable=False)
    status_reason = Column(String(255), nullable=True)

    # Provenance
    official_application_url = Column(String(500), nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)
    last_verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    overview = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    source = relationship("Source", back_populates="scholarships")
    university = relationship("University", back_populates="scholarships")
