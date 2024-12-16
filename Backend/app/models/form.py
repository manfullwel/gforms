from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import String, JSON, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class FieldType(str, enum.Enum):
    TEXT = "text"
    NUMBER = "number"
    EMAIL = "email"
    DATE = "date"
    SELECT = "select"
    MULTISELECT = "multiselect"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    TEXTAREA = "textarea"
    FILE = "file"

class ValidationRule(str, enum.Enum):
    REQUIRED = "required"
    MIN_LENGTH = "min_length"
    MAX_LENGTH = "max_length"
    MIN_VALUE = "min_value"
    MAX_VALUE = "max_value"
    PATTERN = "pattern"

class Form(Base):
    """Modelo de formulário"""
    __tablename__ = "forms"

    # Campos principais
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000))
    fields: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    settings: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=lambda: {
            "is_public": False,
            "collect_email": False,
            "one_response_per_user": True,
            "show_progress_bar": True,
            "confirmation_message": "Obrigado por preencher o formulário!"
        }
    )

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
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    is_active: Mapped[bool] = mapped_column(default=True)

    # Relacionamentos
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner: Mapped["User"] = relationship(back_populates="forms")
    responses: Mapped[List["FormResponse"]] = relationship(
        back_populates="form",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Form {self.title}>"
