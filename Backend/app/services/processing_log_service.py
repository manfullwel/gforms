from sqlalchemy.orm import Session
from app.models.processing_log import ProcessingLog
from app.schemas.processing_log import ProcessingLogCreate
from typing import List

class ProcessingLogService:
    @staticmethod
    def create_log(db: Session, log: ProcessingLogCreate) -> ProcessingLog:
        db_log = ProcessingLog(
            user_id=log.user_id,
            action=log.action,
            details=log.details,
            status=log.status
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log

    @staticmethod
    def get_logs_by_user(db: Session, user_id: int) -> List[ProcessingLog]:
        return db.query(ProcessingLog).filter(ProcessingLog.user_id == user_id).all()

    @staticmethod
    def get_all_logs(db: Session, skip: int = 0, limit: int = 100) -> List[ProcessingLog]:
        return db.query(ProcessingLog).offset(skip).limit(limit).all()
