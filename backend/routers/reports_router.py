from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User, Report, AiAnalysis
from schemas import ReportCreate, ReportResponse, ReportStatusUpdate
from auth import get_current_user
import json

router = APIRouter()

@router.post("", response_model=ReportResponse)
def create_report(report_in: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_report = Report(
        user_id=current_user.id,
        title=report_in.title,
        location=report_in.location,
        department=report_in.department,
        narrative=report_in.narrative,
        prediction=report_in.prediction,
        confidence=report_in.confidence,
        execution_time_ms=report_in.execution_time_ms,
        status=report_in.status
    )
    db.add(new_report)
    db.flush() # Flush to get the new_report.id

    new_ai_analysis = AiAnalysis(
        report_id=new_report.id,
        hazard_category=report_in.hazard_category,
        recommended_actions=json.dumps(report_in.recommended_actions) if report_in.recommended_actions else None
    )
    db.add(new_ai_analysis)
    db.commit()
    db.refresh(new_report)
    
    # We need to manually parse the recommended_actions JSON string for the response
    report_dict = {
        "id": new_report.id,
        "user_id": new_report.user_id,
        "title": new_report.title,
        "location": new_report.location,
        "narrative": new_report.narrative,
        "prediction": new_report.prediction,
        "confidence": new_report.confidence,
        "execution_time_ms": new_report.execution_time_ms,
        "status": new_report.status,
        "created_at": new_report.created_at,
        "ai_analysis": {
            "hazard_category": new_ai_analysis.hazard_category,
            "recommended_actions": json.loads(new_ai_analysis.recommended_actions) if new_ai_analysis.recommended_actions else []
        }
    }
    
    return report_dict

@router.get("", response_model=List[ReportResponse])
def get_reports(user_id: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Report)
    
    # Safety Officers and Admins receive all reports from all employees across the organization
    is_officer = current_user.role in ["safety_officer", "admin"]
    if not is_officer:
        query = query.filter(Report.user_id == current_user.id)
    elif user_id:
        query = query.filter(Report.user_id == user_id)
        
    reports = query.order_by(Report.created_at.desc()).all()
    
    response_list = []
    for r in reports:
        ai_data = None
        if r.ai_analysis:
            ai_data = {
                "hazard_category": r.ai_analysis.hazard_category,
                "recommended_actions": json.loads(r.ai_analysis.recommended_actions) if r.ai_analysis.recommended_actions else []
            }
        
        reporter_name = r.user.full_name if r.user and r.user.full_name else "Field Observer"
        emp_id = r.user.employee_id if r.user and r.user.employee_id else "EMP-1001"
        dept = r.department or (r.user.department if r.user else "Operations")
        comp = r.user.company if r.user and r.user.company else "SIF Enterprise"

        response_list.append({
            "id": r.id,
            "user_id": r.user_id,
            "reporter_name": reporter_name,
            "employee_id": emp_id,
            "department": dept,
            "company": comp,
            "title": r.title,
            "location": r.location,
            "narrative": r.narrative,
            "prediction": r.prediction,
            "confidence": r.confidence,
            "execution_time_ms": r.execution_time_ms,
            "status": r.status,
            "created_at": r.created_at,
            "ai_analysis": ai_data
        })
        
    return response_list

@router.patch("/{report_id}/status")
def update_report_status(report_id: str, status_update: ReportStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["safety_officer", "admin"]:
        raise HTTPException(status_code=403, detail="Only safety officers can update status")
        
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.status = status_update.status
    db.commit()
    db.refresh(report)
    return {"status": "success", "new_status": report.status}

@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if current_user.role == "employee" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to delete this report")
        
    db.query(AiAnalysis).filter(AiAnalysis.report_id == report_id).delete()
    db.delete(report)
    db.commit()
    
    return {"status": "success"}
