from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ProcessingLogBase(BaseModel):
    action: str
    details: str
    status: str

class ProcessingLogCreate(ProcessingLogBase):
    user_id: int

class ProcessingLogUpdate(ProcessingLogBase):
    pass

class ProcessingLog(ProcessingLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True
