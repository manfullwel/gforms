from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import AuthService
from app.core.database import SessionLocal

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = security) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authorization code."
        )

    db = SessionLocal()
    try:
        user = AuthService.get_current_user(db, credentials.credentials)
        return {"user": user}
    except HTTPException as e:
        raise e
    finally:
        db.close()

class AuthMiddleware:
    async def __call__(self, request: Request, call_next):
        if request.url.path in ["/api/auth/login", "/api/auth/refresh"]:
            response = await call_next(request)
            return response

        try:
            auth = await security(request)
            request.state.user = await verify_token(auth)
            response = await call_next(request)
            return response
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": str(e.detail)}
            )
