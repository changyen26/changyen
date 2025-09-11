from typing import List
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.competition import Competition
from app.schemas.competition import CompetitionCreate, CompetitionUpdate


class CRUDCompetition(CRUDBase[Competition, CompetitionCreate, CompetitionUpdate]):
    def get_by_user(self, db: Session, *, user_id: int) -> List[Competition]:
        return db.query(Competition).filter(Competition.user_id == user_id).order_by(Competition.date.desc()).all()


competition = CRUDCompetition(Competition)