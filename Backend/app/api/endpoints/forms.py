from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.form_service import FormService
from app.schemas.form import Form, FormCreate, FormUpdate, FormResponse
from app.middleware.auth_middleware import verify_token

router = APIRouter()

@router.post("/", response_model=Form)
async def create_form(
    form_data: FormCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token)
):
    """Cria um novo formulário."""
    return FormService.create_form(db, form_data, current_user["id"])

@router.get("/", response_model=List[Form])
async def list_forms(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(verify_token)
):
    """Lista todos os formulários acessíveis ao usuário."""
    user_id = current_user["id"] if current_user else None
    return FormService.get_forms(db, user_id, skip, limit)

@router.get("/{form_id}", response_model=Form)
async def get_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(verify_token)
):
    """Obtém um formulário específico."""
    user_id = current_user["id"] if current_user else None
    return FormService.get_form(db, form_id, user_id)

@router.get("/user/forms", response_model=List[Form])
async def get_user_forms(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token)
):
    """Lista todos os formulários do usuário."""
    return FormService.get_user_forms(db, current_user["id"], skip, limit)

@router.put("/{form_id}", response_model=Form)
async def update_form(
    form_id: int,
    form_data: FormUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token)
):
    """Atualiza um formulário existente."""
    return FormService.update_form(db, form_id, form_data, current_user["id"])

@router.delete("/{form_id}")
async def delete_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token)
):
    """Exclui um formulário."""
    await FormService.delete_form(db, form_id, current_user["id"])
    return {"message": "Form deleted successfully"}

@router.post("/{form_id}/submit", response_model=FormResponse)
async def submit_form_response(
    form_id: int,
    answers: dict,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(verify_token),
    email: Optional[str] = None,
    metadata: Optional[dict] = None
):
    """Submete uma resposta para um formulário."""
    user_id = current_user["id"] if current_user else None
    return await FormService.submit_form_response(
        db,
        form_id,
        answers,
        user_id,
        email,
        metadata
    )

@router.get("/{form_id}/responses", response_model=List[FormResponse])
async def get_form_responses(
    form_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token)
):
    """Obtém todas as respostas de um formulário."""
    return await FormService.get_form_responses(
        db,
        form_id,
        current_user["id"],
        skip,
        limit
    )
