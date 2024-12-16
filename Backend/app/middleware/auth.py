from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
from ..config import get_settings
from ..models.user import User
from sqlalchemy.orm import Session
from ..database import get_db
import ipaddress
from user_agents import parse

security = HTTPBearer()
settings = get_settings()

class AdminAuthMiddleware:
    def __init__(self):
        self.security = HTTPBearer()
        self.settings = get_settings()

    async def __call__(self, credentials: HTTPAuthorizationCredentials = Security(security),
                      db: Session = Depends(get_db)):
        try:
            # Verifica o token JWT
            payload = jwt.decode(credentials.credentials, 
                               self.settings.SECRET_KEY, 
                               algorithms=[self.settings.ALGORITHM])
            
            user_id: int = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Token inválido")

            # Verifica se o usuário existe e é admin
            user = db.query(User).filter(User.id == user_id).first()
            if not user or not user.is_admin:
                raise HTTPException(status_code=403, 
                                  detail="Acesso restrito a administradores")

            # Verifica se o token não está na lista negra
            if self._is_token_blacklisted(credentials.credentials, db):
                raise HTTPException(status_code=401, detail="Token revogado")

            return user
        except JWTError:
            raise HTTPException(status_code=401, 
                              detail="Não foi possível validar as credenciais")

    def _is_token_blacklisted(self, token: str, db: Session) -> bool:
        # Implementar verificação de blacklist
        return False

admin_auth = AdminAuthMiddleware()

def create_admin_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    data = {
        "sub": str(user_id),
        "exp": expire,
        "type": "admin"
    }
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def validate_ip_address(ip: str) -> bool:
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False

def get_client_info(request) -> dict:
    """Extrai informações seguras do cliente"""
    user_agent_string = request.headers.get("user-agent", "")
    user_agent = parse(user_agent_string)
    
    return {
        "ip": request.client.host,
        "user_agent": user_agent_string,
        "browser": user_agent.browser.family,
        "os": user_agent.os.family,
        "device": user_agent.device.family,
        "headers": dict(request.headers),
    }
