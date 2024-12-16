from typing import Generator
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from sqlalchemy import create_engine
from app.core.config import get_settings

settings = get_settings()

class Base(DeclarativeBase):
    """Base class para todos os modelos SQLAlchemy"""
    pass

# Criar o engine do banco de dados
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Apenas para SQLite
    pool_pre_ping=True,  # Verifica a conexão antes de usar
    echo=False  # Set to True para debug SQL
)

# Criar a sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency para injeção da sessão do banco de dados
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
