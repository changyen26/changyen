from fastapi import APIRouter
from app.api.endpoints import users, patents, competitions, news_articles

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(patents.router, prefix="/patents", tags=["patents"])
api_router.include_router(competitions.router, prefix="/competitions", tags=["competitions"])
api_router.include_router(news_articles.router, prefix="/news", tags=["news"])