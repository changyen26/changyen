from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.Competition])
def read_competitions(
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
    db: Session = Depends(get_db),
):
    """
    獲取競賽列表，支持按用戶ID篩選
    """
    if user_id:
        competitions = crud.competition.get_by_user(db=db, user_id=user_id)
    else:
        competitions = crud.competition.get_multi(db, skip=skip, limit=limit)
    return competitions


@router.get("/{competition_id}", response_model=schemas.Competition)
def read_competition(
    competition_id: int,
    db: Session = Depends(get_db),
):
    """
    根據ID獲取競賽詳情
    """
    competition = crud.competition.get(db=db, id=competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    return competition


@router.post("/", response_model=schemas.Competition)
def create_competition(
    competition_in: schemas.CompetitionCreate,
    db: Session = Depends(get_db),
):
    """
    創建新競賽記錄
    """
    # Verify user exists
    user = crud.user.get(db=db, id=competition_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return crud.competition.create(db=db, obj_in=competition_in)


@router.put("/{competition_id}", response_model=schemas.Competition)
def update_competition(
    competition_id: int,
    competition_in: schemas.CompetitionUpdate,
    db: Session = Depends(get_db),
):
    """
    更新競賽信息
    """
    competition = crud.competition.get(db=db, id=competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    return crud.competition.update(db=db, db_obj=competition, obj_in=competition_in)


@router.delete("/{competition_id}", response_model=schemas.Competition)
def delete_competition(
    competition_id: int,
    db: Session = Depends(get_db),
):
    """
    刪除競賽記錄
    """
    competition = crud.competition.get(db=db, id=competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    return crud.competition.remove(db=db, id=competition_id)