from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.models.patent import PatentStatus


class PatentBase(BaseModel):
    title: str
    patent_number: Optional[str] = None
    description: Optional[str] = None
    filing_date: Optional[date] = None
    grant_date: Optional[date] = None
    status: PatentStatus = PatentStatus.pending
    category: Optional[str] = None


class PatentCreate(PatentBase):
    user_id: int


class PatentUpdate(BaseModel):
    title: Optional[str] = None
    patent_number: Optional[str] = None
    description: Optional[str] = None
    filing_date: Optional[date] = None
    grant_date: Optional[date] = None
    status: Optional[PatentStatus] = None
    category: Optional[str] = None


class Patent(PatentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True