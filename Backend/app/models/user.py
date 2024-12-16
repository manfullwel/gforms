from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """Modelo de usuário"""
    __tablename__ = "users"

    # Campos principais
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)
    is_admin: Mapped[bool] = mapped_column(default=False)
    
    # Campos de auditoria
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Relacionamentos
    sessions: Mapped[List["UserSession"]] = relationship(
        "UserSession", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    forms: Mapped[List["Form"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan"
    )
    processing_logs: Mapped[List["ProcessingLog"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

class UserSession(Base):
    """Modelo de sessão do usuário"""
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    session_id: Mapped[str] = mapped_column(String(255), unique=True)
    user_agent: Mapped[str] = mapped_column(String(255))
    ip_address: Mapped[str] = mapped_column(String(45))
    location: Mapped[Optional[dict]] = mapped_column(JSON)
    browser_fingerprint: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    last_activity: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    is_suspicious: Mapped[bool] = mapped_column(default=False)
    
    # Relacionamentos
    user: Mapped["User"] = relationship("User", back_populates="sessions")
