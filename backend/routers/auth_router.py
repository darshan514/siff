from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token, UserResponse
from auth import get_password_hash, verify_password, create_access_token, get_current_user
import json
from datetime import datetime

router = APIRouter()

def normalize_role(role: str) -> str:
    if not role:
        return "employee"
    r = role.lower().strip()
    if r in ["admin", "safety_officer", "safety officer", "officer"]:
        return "safety_officer"
    return "employee"

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=409, detail="Email is already registered")

    hashed_password = get_password_hash(user_in.password)
    norm_role = normalize_role(user_in.role)
    
    new_user = User(
        full_name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password,
        role=norm_role,
        employee_id=user_in.employeeId or user_in.officerId,
        department=user_in.department,
        designation=user_in.designation,
        company=user_in.company,
        phone=user_in.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    user_resp = UserResponse.model_validate(new_user)
    return {"status": "success", "token": access_token, "user": user_resp}

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if user_credentials.role and normalize_role(user.role) != normalize_role(user_credentials.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is registered as a {user.role}, not as a {user_credentials.role}",
        )
        
    access_token = create_access_token(data={"sub": str(user.id)})
    
    user_resp = UserResponse.model_validate(user)
    return {"status": "success", "token": access_token, "user": user_resp}

@router.post("/logout")
def logout():
    return {"status": "success"}

@router.get("/me", response_model=dict)
def get_me(current_user: User = Depends(get_current_user)):
    user_resp = UserResponse.model_validate(current_user)
    return {"status": "success", "user": user_resp}

