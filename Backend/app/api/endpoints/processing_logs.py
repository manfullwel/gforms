from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.schemas.processing_log import ProcessingLog, ProcessingLogCreate
from app.services.processing_log_service import ProcessingLogService
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ProcessingLog)
def create_processing_log(
    log: ProcessingLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ProcessingLogService.create_log(db=db, log=log)

@router.get("/user/{user_id}", response_model=List[ProcessingLog])
def get_user_logs(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access these logs")
    return ProcessingLogService.get_logs_by_user(db=db, user_id=user_id)

@router.get("/", response_model=List[ProcessingLog])
def get_all_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view all logs")
    return ProcessingLogService.get_all_logs(db=db, skip=skip, limit=limit)
