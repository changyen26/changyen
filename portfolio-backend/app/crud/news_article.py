from typing import List
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.news_article import NewsArticle
from app.schemas.news_article import NewsArticleCreate, NewsArticleUpdate


class CRUDNewsArticle(CRUDBase[NewsArticle, NewsArticleCreate, NewsArticleUpdate]):
    def get_by_user(self, db: Session, *, user_id: int) -> List[NewsArticle]:
        return db.query(NewsArticle).filter(NewsArticle.user_id == user_id).order_by(NewsArticle.publication_date.desc()).all()


news_article = CRUDNewsArticle(NewsArticle)