from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class PatentStatus(str, enum.Enum):
    pending = "pending"
    granted = "granted"
    expired = "expired"


class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(300), nullable=False)
    patent_number = Column(String(50))
    description = Column(Text)
    filing_date = Column(Date)
    grant_date = Column(Date)
    status = Column(Enum(PatentStatus), default=PatentStatus.pending)
    category = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    user = relationship("User")