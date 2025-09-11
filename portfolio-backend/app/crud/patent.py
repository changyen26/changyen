from typing import List
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.patent import Patent
from app.schemas.patent import PatentCreate, PatentUpdate


class CRUDPatent(CRUDBase[Patent, PatentCreate, PatentUpdate]):
    def get_by_user(self, db: Session, *, user_id: int) -> List[Patent]:
        return db.query(Patent).filter(Patent.user_id == user_id).all()
    
    def get_by_category(self, db: Session, *, category: str) -> List[Patent]:
        return db.query(Patent).filter(Patent.category == category).all()


patent = CRUDPatent(Patent)