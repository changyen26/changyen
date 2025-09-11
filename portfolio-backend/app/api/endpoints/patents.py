from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.Patent])
def read_patents(
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
    category: str = None,
    db: Session = Depends(get_db),
):
    """
    獲取專利列表，支持按用戶ID和分類篩選
    """
    if user_id:
        patents = crud.patent.get_by_user(db=db, user_id=user_id)
    elif category:
        patents = crud.patent.get_by_category(db=db, category=category)
    else:
        patents = crud.patent.get_multi(db, skip=skip, limit=limit)
    return patents


@router.get("/{patent_id}", response_model=schemas.Patent)
def read_patent(
    patent_id: int,
    db: Session = Depends(get_db),
):
    """
    根據ID獲取專利詳情
    """
    patent = crud.patent.get(db=db, id=patent_id)
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
    return patent


@router.post("/", response_model=schemas.Patent)
def create_patent(
    patent_in: schemas.PatentCreate,
    db: Session = Depends(get_db),
):
    """
    創建新專利
    """
    # Verify user exists
    user = crud.user.get(db=db, id=patent_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return crud.patent.create(db=db, obj_in=patent_in)


@router.put("/{patent_id}", response_model=schemas.Patent)
def update_patent(
    patent_id: int,
    patent_in: schemas.PatentUpdate,
    db: Session = Depends(get_db),
):
    """
    更新專利信息
    """
    patent = crud.patent.get(db=db, id=patent_id)
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
    
    return crud.patent.update(db=db, db_obj=patent, obj_in=patent_in)


@router.delete("/{patent_id}", response_model=schemas.Patent)
def delete_patent(
    patent_id: int,
    db: Session = Depends(get_db),
):
    """
    刪除專利
    """
    patent = crud.patent.get(db=db, id=patent_id)
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
    
    return crud.patent.remove(db=db, id=patent_id)