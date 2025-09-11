from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class CompetitionBase(BaseModel):
    competition_name: str
    award_title: Optional[str] = None
    rank_position: Optional[str] = None
    date: Optional[date] = None
    description: Optional[str] = None
    certificate_url: Optional[str] = None


class CompetitionCreate(CompetitionBase):
    user_id: int


class CompetitionUpdate(BaseModel):
    competition_name: Optional[str] = None
    award_title: Optional[str] = None
    rank_position: Optional[str] = None
    date: Optional[date] = None
    description: Optional[str] = None
    certificate_url: Optional[str] = None


class Competition(CompetitionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True