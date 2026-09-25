import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base


class DataVerification(Base):
    __tablename__ = "data_verifications"

    id = Column(Integer, primary_key=True, index=True)
    source_url = Column(String(500), nullable=False)
    entity_type = Column(String(50), nullable=False)  # "scholarship", "university", "program"
    entity_id = Column(Integer, nullable=True)
    entity_name = Column(String(255), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    verification_method = Column(String(50), default="Automated Re-check")  # "Automated Re-check", "Admin Review"
    verified_by = Column(String(100), default="System")
    verification_notes = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)
