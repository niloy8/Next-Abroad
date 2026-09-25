import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Personal
    nationality = Column(String(100), nullable=True)
    country_of_residence = Column(String(100), nullable=True)

    # Academic
    current_degree = Column(String(100), nullable=True)  # e.g., Bachelor's, High School
    desired_degree = Column(String(100), nullable=True)  # Master's, PhD, Bachelor's
    field_of_study = Column(String(150), nullable=True)
    institution = Column(String(200), nullable=True)
    cgpa = Column(Float, nullable=True)
    grading_scale = Column(Float, default=4.0)  # 4.0, 5.0, 10.0, 100.0
    graduation_year = Column(Integer, nullable=True)

    # English Proficiency
    english_test = Column(String(50), default="Not taken yet")  # IELTS, TOEFL, PTE, Duolingo, Other
    english_score = Column(Float, nullable=True)
    english_subscores = Column(JSON, nullable=True)  # {"reading": 7.0, "writing": 6.5, ...}

    # Budget
    max_annual_tuition = Column(Float, default=0.0)
    max_annual_living = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")

    # Preferences
    preferred_countries = Column(JSON, default=list)  # ["Germany", "Sweden", "Canada"]
    preferred_cities = Column(JSON, default=list)
    scholarship_required = Column(Boolean, default=True)
    fully_funded_preference = Column(Boolean, default=True)
    partial_scholarship_acceptable = Column(Boolean, default=True)
    tuition_waiver_preference = Column(Boolean, default=True)
    part_time_work_preference = Column(Boolean, default=True)
    research_preference = Column(Boolean, default=False)
    public_private_preference = Column(String(50), default="Any")  # "Public", "Private", "Any"
    preferred_intake = Column(String(50), default="Fall 2026")  # e.g. "Fall 2026", "Spring 2027"

    # Status & Completeness
    completeness_score = Column(Integer, default=0)
    cv_extracted_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="profile")
