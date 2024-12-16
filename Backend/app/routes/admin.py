from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User, UserSession
from ..schemas.user import AdminUserView
from ..schemas.security import SecurityAlert, UserSecurityProfile, SecurityAuditLog
from datetime import datetime
import json

router = APIRouter(prefix="/admin", tags=["admin"])

def get_client_info(request: Request) -> dict:
    """Extract client information from request"""
    return {
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent", ""),
        "headers": dict(request.headers)
    }

def log_admin_action(db: Session, admin_id: int, action: str, details: dict):
    """Log administrative actions"""
    log = SecurityAuditLog(
        timestamp=datetime.utcnow(),
        action=action,
        admin_id=admin_id,
        details=details,
        ip_address=details.get("ip", "unknown"),
        geolocation={}  # You would normally get this from a geolocation service
    )
    # In a real application, you would save this to the database
    print(f"Admin Action Log: {log.model_dump_json()}")

@router.get("/users", response_model=List[AdminUserView])
async def get_all_users(request: Request, db: Session = Depends(get_db)):
    """Lista todos os usuários com informações detalhadas de segurança"""
    # Note: Removed admin auth temporarily for testing
    users = db.query(User).all()
    return users

@router.get("/users/{user_id}", response_model=AdminUserView)
async def get_user_details(user_id: int, request: Request, db: Session = Depends(get_db)):
    """Obtém detalhes completos de um usuário específico"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@router.post("/users/{user_id}/block")
async def block_user(
    user_id: int,
    reason: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Bloqueia um usuário"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.is_active = False
    user.blocked_reason = reason
    
    # Log da ação administrativa
    log_admin_action(db, 1, "block_user", {
        **get_client_info(request),
        "target_user_id": user_id,
        "reason": reason
    })
    
    db.commit()
    return {"message": "Usuário bloqueado com sucesso"}

@router.get("/security/alerts", response_model=List[SecurityAlert])
async def get_security_alerts(db: Session = Depends(get_db)):
    """Lista todos os alertas de segurança não resolvidos"""
    # For testing, return mock data
    return [
        SecurityAlert(
            user_id=1,
            alert_type="suspicious_login",
            severity="high",
            details={"location": "Unknown", "ip": "1.1.1.1"},
            timestamp=datetime.utcnow(),
            resolved=False
        )
    ]

@router.get("/security/audit-logs", response_model=List[SecurityAuditLog])
async def get_audit_logs(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
):
    """Obtém logs de auditoria de segurança"""
    # For testing, return mock data
    return [
        SecurityAuditLog(
            timestamp=datetime.utcnow(),
            action="user_view",
            admin_id=1,
            target_user_id=2,
            details={"page": "user_details"},
            ip_address="127.0.0.1",
            geolocation={"city": "Test City", "country": "Test Country"}
        )
    ]

@router.get("/security/suspicious-activities")
async def get_suspicious_activities(
    db: Session = Depends(get_db)
):
    """Lista todas as atividades suspeitas detectadas"""
    # Implementar lógica de busca de atividades suspeitas
    return []

@router.post("/security/investigate/{user_id}")
async def investigate_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Inicia uma investigação detalhada de um usuário"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Coleta informações detalhadas do usuário
    sessions = db.query(UserSession).filter(UserSession.user_id == user_id).all()
    
    investigation_data = {
        "user_id": user_id,
        "sessions": [
            {
                "ip": session.ip_address,
                "location": session.location,
                "user_agent": session.user_agent,
                "timestamp": session.created_at.isoformat()
            }
            for session in sessions
        ],
        "risk_score": user.risk_score,
        "suspicious_activities": user.suspicious_activities
    }
    
    # Log da investigação
    log_admin_action(db, 1, "investigate_user", {
        **get_client_info(request),
        "target_user_id": user_id,
        "investigation_data": investigation_data
    })
    
    return investigation_data

admin_router = APIRouter(prefix="/admin", tags=["admin"])

@admin_router.get("/users", response_model=List[User])
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Retorna todos os usuários do sistema"""
    return db.query(User).all()

@admin_router.get("/users/{user_id}", response_model=User)
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Retorna detalhes de um usuário específico"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return user

@admin_router.put("/users/{user_id}/toggle-status", response_model=User)
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Alterna o status ativo/inativo de um usuário"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível desativar seu próprio usuário"
        )
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
