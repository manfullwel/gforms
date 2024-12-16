from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.form import Form
from app.models.form_response import FormResponse
from app.schemas.form import FormCreate, FormUpdate
from datetime import datetime
import json

class FormService:
    @staticmethod
    def create_form(db: Session, form_data: FormCreate, owner_id: int) -> Form:
        """Cria um novo formulário."""
        # Validar campos do formulário
        for field in form_data.fields:
            if field.type.value in ['select', 'multiselect', 'radio'] and not field.options:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Field '{field.label}' requires options"
                )

        # Criar o formulário
        db_form = Form(
            title=form_data.title,
            description=form_data.description,
            fields=json.loads(form_data.fields.json()),
            settings=json.loads(form_data.settings.json()),
            owner_id=owner_id
        )
        
        db.add(db_form)
        db.commit()
        db.refresh(db_form)
        return db_form

    @staticmethod
    def get_form(db: Session, form_id: int, user_id: Optional[int] = None) -> Form:
        """Obtém um formulário por ID."""
        form = db.query(Form).filter(Form.id == form_id).first()
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Form not found"
            )
        
        # Verificar permissão
        if not form.settings.get('is_public', False) and (not user_id or form.owner_id != user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this form"
            )
        
        return form

    @staticmethod
    def get_forms(db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[Form]:
        """Lista todos os formulários acessíveis ao usuário."""
        query = db.query(Form)
        
        if user_id:
            # Se o usuário estiver autenticado, retorna seus formulários e os públicos
            query = query.filter(
                (Form.owner_id == user_id) | 
                (Form.settings['is_public'].as_boolean() == True)
            )
        else:
            # Se não estiver autenticado, retorna apenas os formulários públicos
            query = query.filter(Form.settings['is_public'].as_boolean() == True)
        
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_user_forms(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Form]:
        """Lista todos os formulários do usuário."""
        return db.query(Form)\
            .filter(Form.owner_id == user_id)\
            .offset(skip)\
            .limit(limit)\
            .all()

    @staticmethod
    def update_form(db: Session, form_id: int, form_data: FormUpdate, user_id: int) -> Form:
        """Atualiza um formulário existente."""
        form = FormService.get_form(db, form_id, user_id)
        
        # Verificar propriedade
        if form.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this form"
            )

        # Atualizar campos
        for key, value in form_data.dict(exclude_unset=True).items():
            if key == 'fields':
                setattr(form, key, json.loads(value.json()))
            elif key == 'settings':
                setattr(form, key, json.loads(value.json()))
            else:
                setattr(form, key, value)

        form.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(form)
        return form

    @staticmethod
    def delete_form(db: Session, form_id: int, user_id: int) -> bool:
        """Exclui um formulário."""
        form = FormService.get_form(db, form_id, user_id)
        
        if form.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this form"
            )

        db.delete(form)
        db.commit()
        return True

    @staticmethod
    def submit_response(
        db: Session,
        form_id: int,
        answers: dict,
        user_id: Optional[int] = None,
        email: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> FormResponse:
        """Submete uma resposta para um formulário."""
        form = FormService.get_form(db, form_id)

        # Verificar se o formulário está ativo e dentro do prazo
        if not form.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This form is no longer active"
            )

        if form.expires_at and form.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This form has expired"
            )

        # Verificar resposta única por usuário
        if form.settings.get('one_response_per_user', True) and user_id:
            existing_response = db.query(FormResponse)\
                .filter(FormResponse.form_id == form_id)\
                .filter(FormResponse.respondent_id == user_id)\
                .first()
            
            if existing_response:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You have already submitted a response to this form"
                )

        # Validar respostas
        FormService._validate_answers(form, answers)

        # Criar resposta
        response = FormResponse(
            form_id=form_id,
            respondent_id=user_id,
            respondent_email=email,
            answers=answers,
            metadata=metadata or {}
        )

        db.add(response)
        db.commit()
        db.refresh(response)
        return response

    @staticmethod
    def _validate_answers(form: Form, answers: dict):
        """Valida as respostas do formulário."""
        form_fields = {field['id']: field for field in form.fields}
        
        # Verificar campos obrigatórios
        for field_id, field in form_fields.items():
            if field.get('required', False) and field_id not in answers:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Field '{field.get('label')}' is required"
                )

        # Validar tipos e regras
        for field_id, answer in answers.items():
            if field_id not in form_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unknown field '{field_id}'"
                )

            field = form_fields[field_id]
            FormService._validate_field_answer(field, answer)
