from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ProcessingLog(Base):
    """Modelo de log de processamento"""
    __tablename__ = "processing_logs"

    # Campos principais
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(50))
    details: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20))
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Campos de auditoria
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    
    # Relacionamentos
    user: Mapped["User"] = relationship(back_populates="processing_logs")

    def __repr__(self) -> str:
        return f"<ProcessingLog {self.action}>"
