from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.NewsArticle])
def read_news_articles(
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
    db: Session = Depends(get_db),
):
    """
    獲取新聞文章列表，支持按用戶ID篩選
    """
    if user_id:
        articles = crud.news_article.get_by_user(db=db, user_id=user_id)
    else:
        articles = crud.news_article.get_multi(db, skip=skip, limit=limit)
    return articles


@router.get("/{article_id}", response_model=schemas.NewsArticle)
def read_news_article(
    article_id: int,
    db: Session = Depends(get_db),
):
    """
    根據ID獲取新聞文章詳情
    """
    article = crud.news_article.get(db=db, id=article_id)
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    return article


@router.post("/", response_model=schemas.NewsArticle)
def create_news_article(
    article_in: schemas.NewsArticleCreate,
    db: Session = Depends(get_db),
):
    """
    創建新新聞文章
    """
    # Verify user exists
    user = crud.user.get(db=db, id=article_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return crud.news_article.create(db=db, obj_in=article_in)


@router.put("/{article_id}", response_model=schemas.NewsArticle)
def update_news_article(
    article_id: int,
    article_in: schemas.NewsArticleUpdate,
    db: Session = Depends(get_db),
):
    """
    更新新聞文章信息
    """
    article = crud.news_article.get(db=db, id=article_id)
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    
    return crud.news_article.update(db=db, db_obj=article, obj_in=article_in)


@router.delete("/{article_id}", response_model=schemas.NewsArticle)
def delete_news_article(
    article_id: int,
    db: Session = Depends(get_db),
):
    """
    刪除新聞文章
    """
    article = crud.news_article.get(db=db, id=article_id)
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    
    return crud.news_article.remove(db=db, id=article_id)