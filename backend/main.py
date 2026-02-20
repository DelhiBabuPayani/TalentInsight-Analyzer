print(">>> MAIN.PY LOADED <<<")

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import shutil, os
from course_keyword_map import COURSE_KEYWORD_MAP

from database import SessionLocal, engine
import models
from auth import hash_password, verify_password
from resume_parser import extract_text_from_pdf, extract_text_from_docx, extract_entities
from job_api import fetch_jobs_from_api
from course_api import fetch_courses_for_skill
from non_tech_courses import NON_TECH_COURSES
from medical_courses import MEDICAL_COURSES
from commerce_courses import COMMERCE_COURSES
from engineering_courses import ENGINEERING_COURSES
from education_courses import EDUCATION_COURSES
from student_courses import STUDENT_COURSES
from technical_courses import TECHNICAL_COURSES
from fastapi import APIRouter
from database import SessionLocal
from models import PasswordReset
from pydantic import BaseModel
from models import UserAuth

from datetime import datetime, timedelta
import random

from pydantic import BaseModel


from pydantic import BaseModel
from fastapi import HTTPException
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Resume
import os

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: str
class ChangePasswordRequest(BaseModel):
    user_id: int
    current_password: str
    new_password: str
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentInsight Analyzer Backend")

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ========================================

# ================= DB =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

PROFESSION_CATEGORY_MAP = {
    "medical": ["doctor", "mbbs", "nurse", "nursing", "physician", "surgeon", "medical"],
    "commerce": ["bcom", "mcom", "accountant", "finance", "banking", "auditor"],
    "engineering": ["mechanical", "electrical", "electronics", "civil", "automobile"],
    "technical": ["developer", "software", "engineer", "programmer", "data scientist", "ai", "ml", "devops", "it"],
    "management": ["mba", "manager", "hr", "recruiter", "operations", "admin"],
    "education": ["teacher", "professor", "lecturer", "faculty", "trainer"],
    "non-technical": ["bpo", "call center", "customer", "support", "sales", "telecaller", "back office", "data entry"],
    "student": ["student", "10th", "12th", "puc", "intermediate"]
}


def detect_user_category(role: str):
    role = role.lower()
    for category, keywords in PROFESSION_CATEGORY_MAP.items():
        for key in keywords:
            if key in role:
                return category
    return "other"

# ================= SCHEMAS =================
class RegisterSchema(BaseModel):
    name: str
    email: str
    password: str
    role: str
    organization: str
    experience: str

class LoginSchema(BaseModel):
    email: str
    password: str

class ForgotPasswordSchema(BaseModel):
    email: str
class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

@app.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest):
    db = SessionLocal()

    record = db.query(PasswordReset).filter(
        PasswordReset.email == data.email,
        PasswordReset.reset_code == data.otp
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    return {"message": "OTP verified"}
class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

@app.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    db = SessionLocal()

    # find user
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # update password
    hashed = hash_password(data.new_password)
    user.password = hashed
    db.commit()

    return {"message": "Password reset successful"}

# ================= REGISTER =================
@app.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(data.password)

    user = models.User(
        name=data.name,
        email=data.email,
        password=hashed,
        role=data.role,
        organization=data.organization,
        experience=data.experience
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User registered successfully"}

# ================= LOGIN =================
@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid password")

    return {
        "message": "Login successful",
        "user_id": user.user_id,
        "name": user.name,
        "role": user.role
    }

class ChangePasswordRequest(BaseModel):
    user_id: int
    current_password: str
    new_password: str


@app.post("/change-password")
def change_password(data: ChangePasswordRequest):
    db = SessionLocal()

    auth = db.query(UserAuth).filter(UserAuth.user_id == data.user_id).first()

    if not auth:
        raise HTTPException(status_code=404, detail="Auth record not found")

    # check current password
    if auth.password != data.current_password:
        raise HTTPException(status_code=400, detail="Current password incorrect")

    # update password
    auth.password = data.new_password
    db.commit()

    return {"message": "Password updated successfully"}
# ===== FORGOT PASSWORD API =====
@app.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    db = SessionLocal()

    # find user by email
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = str(random.randint(100000, 999999))

    # delete old otp if exists
    db.query(PasswordReset).filter(PasswordReset.email == data.email).delete()

    reset = PasswordReset(
        user_id=user.user_id,          # ✅ FIXED
        email=data.email,
        reset_code=otp,
        created_code=datetime.utcnow()
    )

    db.add(reset)
    db.commit()

    return {
        "message": "OTP sent",
        "otp": otp
    }



# ================= DELETE ACCOUNT =================
@app.delete("/delete-account/{user_id}")
def delete_account(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(models.Resume).filter(models.Resume.user_id == user_id).delete()
    db.delete(user)
    db.commit()

    return {"message": "Account deleted successfully"}

# ================= RESUME HISTORY =================
@router.get("/resume/history/{user_id}")
def get_resume_history(user_id: int, db: Session = Depends(get_db)):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )

    return [
        {
            "resume_id": r.resume_id,
            "file_name": r.file_name,
            "file_path": r.file_path,
            "uploaded_at": r.uploaded_at
        }
        for r in resumes
    ]

# ================= CLEAR RESUME HISTORY =================
@router.delete("/resume/clear/{user_id}")
def clear_resume_history(user_id: int, db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == user_id).all()

    for r in resumes:
        if r.file_path and os.path.exists(r.file_path):
            os.remove(r.file_path)

    db.query(Resume).filter(Resume.user_id == user_id).delete()
    db.commit()

    return {"message": "Resume history cleared successfully"}

# ================= DELETE SINGLE RESUME =================
@router.delete("/resume/{resume_id}")
def delete_single_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.resume_id == resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if resume.file_path and os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.delete(resume)
    db.commit()

    return {"message": "Resume deleted successfully"}

# ================= APPLY JOB =================
@app.post("/apply-job")
def apply_job(data: dict, db: Session = Depends(get_db)):
    user_id = data.get("user_id")
    title = data.get("title")
    company = data.get("company")
    required_skills = data.get("required_skills", "")

    if not user_id or not title or not company:
        raise HTTPException(status_code=400, detail="Missing required fields")

    job = db.query(models.Job).filter(
        models.Job.title == title,
        models.Job.company == company
    ).first()

    if not job:
        job = models.Job(title=title, company=company, required_skills=required_skills)
        db.add(job)
        db.commit()
        db.refresh(job)

    existing = db.query(models.Application).filter(
        models.Application.user_id == user_id,
        models.Application.job_id == job.job_id
    ).first()

    if existing:
        return {"message": "Already applied"}

    application = models.Application(
        user_id=user_id,
        job_id=job.job_id,
        application_status="Pending"
    )

    db.add(application)
    db.commit()

    return {"message": "Job applied successfully"}

# ================= GET APPLIED JOBS =================
@app.get("/applied-jobs/{user_id}")
def get_applied_jobs(user_id: int, db: Session = Depends(get_db)):
    results = (
        db.query(models.Application, models.Job)
        .join(models.Job, models.Application.job_id == models.Job.job_id)
        .filter(models.Application.user_id == user_id)
        .all()
    )

    applied = []
    for app, job in results:
        applied.append({
            "application_id": app.application_id,
            "status": app.application_status,
            "title": job.title,
            "company": job.company,
            "required_skills": job.required_skills
        })

    return applied

# ================= WITHDRAW JOB APPLICATION =================
@app.delete("/withdraw-application/{application_id}")
def withdraw_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(models.Application).filter(
        models.Application.application_id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()

    return {"message": "Application withdrawn successfully"}

# ================= UPLOAD + JOB MATCH + SKILL GAP =================
@app.post("/upload/{user_id}")
async def upload_resume(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    print("UPLOAD HIT ✅")
    print("USER ID:", user_id)
    print("FILENAME:", file.filename)

    if not file:
        raise HTTPException(status_code=400, detail="File not received")

    os.makedirs("uploads", exist_ok=True)
    path = os.path.join("uploads", file.filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    resume = models.Resume(
        user_id=user_id,
        file_name=file.filename,
        file_path=path
    )
    app.include_router(router)
    db.add(resume)
    db.commit()

    # -------- Extract Text --------
    if file.filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(path)
    elif file.filename.lower().endswith(".docx"):
        text = extract_text_from_docx(path)
    else:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX supported")

    extracted = extract_entities(text)
    user_skills = [s.lower() for s in extracted.get("skills", [])]

    print("EXTRACTED SKILLS:", user_skills)

    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    user_role = user.role.lower() if user and user.role else ""
    user_category = detect_user_category(user_role)

    # ================= CASE 1: NO SKILLS =================
    if not user_skills:
        return {
            "status": "NO_SKILLS",
            "redirect": "skill-gap",
            "missing_skills": ["basic computer skills", "communication"],
            "recommended_courses": {
                "basic computer skills": NON_TECH_COURSES.get("basic computer skills", []),
                "communication": NON_TECH_COURSES.get("communication", [])
            }
        }

    # ================= JOB MATCHING =================
    api_jobs = fetch_jobs_from_api(" ".join(user_skills))
    matched_jobs = []
    non_technical_jobs = []

    for job in api_jobs:
        title = job.get("title", "")
        company = job.get("company", "")
        description = (job.get("job_description") or job.get("description") or "").lower()

        apply_link = job.get("apply_link", "")

        match_count = 0
        for skill in user_skills:
            if skill in description:
                match_count += 1

        percent = (match_count / len(user_skills)) * 100 if user_skills else 0

        job_data = {
            "title": title,
            "company": company,
            "match": round(percent, 2),
            "apply_link": apply_link,
            "category": user_category
        }

        if percent >= 25:
            matched_jobs.append(job_data)

        if user_category in ["student", "non-technical"]:
             if any(x in title.lower() for x in ["bpo", "call center", "support", "sales", "telecaller", "back office"]):
                     non_technical_jobs.append(job_data)


    # ================= CASE 2: JOBS FOUND =================
    if matched_jobs or non_technical_jobs:
        return {
            "status": "MATCH_FOUND",
            "redirect": "jobs",
            "user_category": user_category,
            "technical_jobs": matched_jobs,
            "non_technical_jobs": non_technical_jobs
        }

    # ================= CASE 3: NO JOBS → COURSES =================
# ================= CASE 3: NO JOBS → COURSES =================
    recommended_courses = {}

    for skill in user_skills:
        skill_lower = skill.lower().strip()
        search_query = COURSE_KEYWORD_MAP.get(skill_lower, skill_lower)

        print("CHECKING SKILL:", skill_lower, "-> API QUERY:", search_query)

        courses = fetch_courses_for_skill(search_query)

        if courses and isinstance(courses, list) and len(courses) > 0:
            recommended_courses[skill_lower] = courses[:3]
            print("API COURSES FOUND FOR:", skill_lower)

        elif skill_lower in MEDICAL_COURSES:
            recommended_courses[skill_lower] = MEDICAL_COURSES[skill_lower]

        elif skill_lower in ENGINEERING_COURSES:
            recommended_courses[skill_lower] = ENGINEERING_COURSES[skill_lower]

        elif skill_lower in COMMERCE_COURSES:
            recommended_courses[skill_lower] = COMMERCE_COURSES[skill_lower]

        elif skill_lower in EDUCATION_COURSES:
            recommended_courses[skill_lower] = EDUCATION_COURSES[skill_lower]

        elif skill_lower in STUDENT_COURSES:
            recommended_courses[skill_lower] = STUDENT_COURSES[skill_lower]

        elif skill_lower in NON_TECH_COURSES:
            recommended_courses[skill_lower] = NON_TECH_COURSES[skill_lower]

    return {
        "status": "NO_MATCH",
        "redirect": "skill-gap",
        "missing_skills": user_skills,
        "recommended_courses": recommended_courses
}
