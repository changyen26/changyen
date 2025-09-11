from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class NewsArticleBase(BaseModel):
    headline: str
    media_outlet: Optional[str] = None
    publication_date: Optional[date] = None
    article_url: Optional[str] = None
    summary: Optional[str] = None
    image_url: Optional[str] = None


class NewsArticleCreate(NewsArticleBase):
    user_id: int


class NewsArticleUpdate(BaseModel):
    headline: Optional[str] = None
    media_outlet: Optional[str] = None
    publication_date: Optional[date] = None
    article_url: Optional[str] = None
    summary: Optional[str] = None
    image_url: Optional[str] = None


class NewsArticle(NewsArticleBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True