import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import TaskStatus


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_type = Column(String(50), nullable=False)  # "scholarship", "program", "university"
    opportunity_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=True)
    country = Column(String(100), nullable=True)
    deadline = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="saved_opportunities")


class ApplicationTask(Base):
    __tablename__ = "application_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_id = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Documents")  # "Eligibility", "Documents", "Testing", "Submission", "Visa"
    description = Column(Text, nullable=True)
    deadline = Column(String(50), nullable=True)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    order_index = Column(Integer, default=0)
    is_custom = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="application_tasks")
