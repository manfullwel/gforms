from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.form import FieldType, ValidationRule

class FormFieldValidation(BaseModel):
    rule: ValidationRule
    value: Any
    message: Optional[str] = None

class FormField(BaseModel):
    id: str
    type: FieldType
    label: str
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    required: bool = False
    validation: Optional[List[FormFieldValidation]] = None
    options: Optional[List[Dict[str, str]]] = None
    default_value: Optional[Any] = None
    order: int

    @validator('options')
    def validate_options(cls, v, values):
        if values.get('type') in [FieldType.SELECT, FieldType.MULTISELECT, FieldType.RADIO] and not v:
            raise ValueError('Options are required for select, multiselect, and radio fields')
        return v

class FormSettings(BaseModel):
    is_public: bool = False
    collect_email: bool = False
    one_response_per_user: bool = True
    show_progress_bar: bool = True
    confirmation_message: str = "Obrigado por preencher o formulário!"
    notification_email: Optional[str] = None
    custom_theme: Optional[Dict[str, Any]] = None

class FormBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    fields: List[FormField]
    settings: FormSettings

class FormCreate(FormBase):
    pass

class FormUpdate(FormBase):
    is_active: Optional[bool] = None
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class Form(FormBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    expires_at: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True

class FormResponse(BaseModel):
    id: int
    form_id: int
    respondent_id: Optional[int]
    respondent_email: Optional[str]
    answers: Dict[str, Any]
    metadata: Dict[str, Any]
    submitted_at: datetime

    class Config:
        from_attributes = True
