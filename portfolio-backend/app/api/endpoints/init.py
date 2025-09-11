from fastapi import APIRouter, HTTPException
from app.utils.init_db import init_db

router = APIRouter()


@router.post("/init-db")
def initialize_database():
    """
    初始化資料庫並創建示例數據
    注意：此端點應該只在初次部署時使用
    """
    try:
        init_db()
        return {"message": "Database initialized successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")