from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import users, auth, forms, processing_logs
from app.core.config import get_settings
from app.core.database import Base, engine

settings = get_settings()

# Criar a aplicação FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API para gerenciamento de formulários e monitoramento de segurança",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Adicionar middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["users"])
app.include_router(forms.router, prefix=settings.API_V1_STR, tags=["forms"])
app.include_router(processing_logs.router, prefix=settings.API_V1_STR, tags=["logs"])

# Criar tabelas do banco de dados
Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
