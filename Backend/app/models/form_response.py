from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy import String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

class FormResponse(Base):
    """Modelo de resposta do formulário"""
    __tablename__ = "form_responses"

    # Campos principais
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id"), nullable=False)
    respondent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )
    respondent_email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    responses: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    
    # Campos de controle
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    
    # Campos de segurança
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    browser_fingerprint: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Relacionamentos
    form: Mapped["Form"] = relationship(back_populates="responses")
    respondent: Mapped[Optional["User"]] = relationship()

    def __repr__(self) -> str:
        return f"<FormResponse form_id={self.form_id}>"
