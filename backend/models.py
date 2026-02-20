from sqlalchemy.sql import func

from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True)
    password = Column(String(100), nullable=False)
    role = Column(String(50))

    organization = Column(String(100), nullable=False)
    experience = Column(String(50))


    resumes = relationship("Resume", back_populates="user", cascade="all, delete")
    applications = relationship("Application", back_populates="user", cascade="all, delete")


class UserAuth(Base):
    __tablename__ = "user_auth"

    auth_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    password = Column(String(255), nullable=False)


class Resume(Base):
    __tablename__ = "resume"

    resume_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    uploaded_at = Column(TIMESTAMP)

    user = relationship("User", back_populates="resumes")


class PasswordReset(Base):
    __tablename__ = "password_reset"

    reset_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    reset_code = Column(String(10), nullable=False)
    created_code = Column(TIMESTAMP)


class Job(Base):
    __tablename__ = "job"

    job_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    required_skills = Column(Text, nullable=False)
    company = Column(String(150), nullable=False)

    applications = relationship("Application", back_populates="job", cascade="all, delete")


class Application(Base):
    __tablename__ = "application"

    application_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    job_id = Column(Integer, ForeignKey("job.job_id"))
    application_status = Column(Enum("Pending", "Approved", "Rejected"))

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
