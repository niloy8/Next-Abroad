from sqlalchemy import Column, Integer, String, Float, JSON
from app.database import Base


class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(5), unique=True, index=True, nullable=False)  # DE, SE, US, CA, UK, etc.
    name = Column(String(100), unique=True, index=True, nullable=False)
    currency = Column(String(10), default="EUR")
    avg_tuition_min = Column(Float, default=0.0)
    avg_tuition_max = Column(Float, default=15000.0)
    avg_living_annual_min = Column(Float, default=8000.0)
    avg_living_annual_max = Column(Float, default=14000.0)
    visa_work_rights = Column(String(255), default="20 hours per week during term")
    post_study_work_visa = Column(String(255), default="18-month job seeker visa")
    blocked_account_required = Column(Float, default=0.0)  # e.g., 11904 EUR for Germany
    popular_fields = Column(JSON, default=list)
    flag_code = Column(String(10), nullable=True)
    description = Column(String(500), nullable=True)
