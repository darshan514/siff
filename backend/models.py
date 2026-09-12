import uuid
from sqlalchemy import Column, String, Boolean, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="employee")
    employee_id = Column(String)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    company = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    face_registered = Column(Boolean, default=False)
    face_embeddings = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reports = relationship("Report", back_populates="user")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String)
    department = Column(String, nullable=True)
    location = Column(String, nullable=True)
    narrative = Column(String)
    prediction = Column(String)
    confidence = Column(Float)
    execution_time_ms = Column(Integer)
    status = Column(String, default="Submitted")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reports")
    ai_analysis = relationship("AiAnalysis", back_populates="report", uselist=False)


class AiAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    report_id = Column(String, ForeignKey("reports.id"))
    hazard_category = Column(String, nullable=True)
    iogp_rule = Column(String, nullable=True)
    recommended_actions = Column(String, nullable=True) # Stored as JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="ai_analysis")
