from pydantic import AliasChoices, BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    employeeId: Optional[str] = None
    officerId: Optional[str] = None
    department: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str = Field(validation_alias=AliasChoices('name', 'full_name'))
    email: str
    role: str
    employee_id: Optional[str] = None
    department: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    face_registered: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    status: str
    token: str
    user: Any # Will be formatted UserResponse dict to match frontend expectations


# Report Schemas
class ReportCreate(BaseModel):
    user_id: Optional[str] = None
    reporter_name: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = None
    company: Optional[str] = None
    title: str
    location: Optional[str] = None
    narrative: str
    prediction: str
    confidence: float
    hazard_category: Optional[str] = None
    recommended_actions: Optional[List[str]] = []
    execution_time_ms: int
    status: Optional[str] = "Submitted"
    incident_date: Optional[str] = None
    evidence_url: Optional[str] = None

class AiAnalysisResponse(BaseModel):
    hazard_category: Optional[str] = None
    recommended_actions: Optional[List[str]] = None

    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    reporter_name: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = None
    company: Optional[str] = None
    title: str
    location: Optional[str] = None
    narrative: str
    prediction: str
    confidence: float
    execution_time_ms: int
    status: str
    created_at: datetime
    ai_analysis: Optional[AiAnalysisResponse] = None

    class Config:
        from_attributes = True

class ReportStatusUpdate(BaseModel):
    status: str
