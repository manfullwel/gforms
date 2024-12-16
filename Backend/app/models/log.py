from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from . import Base

class ProcessingLog(Base):
    __tablename__ = "processing_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    input_text = Column(Text)
    output_json = Column(Text)
    processing_time = Column(Float)
    status = Column(String)  # success, error, pending
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    language = Column(String)  # pt, en, es, fr
    form_url = Column(String, nullable=True)  # URL do formulário gerado

    # Relacionamento com o usuário
    user = relationship("User", back_populates="logs")

    def __repr__(self):
        return f"<ProcessingLog {self.id} - User {self.user_id}>"
