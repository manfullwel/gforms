from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Configurações básicas da aplicação
    PROJECT_NAME: str = "Gerador Forms API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Configurações de segurança
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configurações do banco de dados
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # Configurações de CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Frontend
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # Configurações do modelo
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()
