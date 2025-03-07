from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from .database import Base
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    photo = Column(LargeBinary, nullable=False)
    location = Column(Geometry("POINT"), nullable=False)  # Храним геопозицию как точку
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now()) 
    status = Column(String(50), default='На рассмотрении')
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Связь с пользователем

    user = relationship("User", back_populates="applications")  # Связь с пользователем

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Связь с пользователем

    user = relationship("User", back_populates="messages")  # Связь с пользователем

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(255), nullable=False)  # Добавлено поле для имени
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    city = Column(String(255), nullable=False)
    photo_url = Column(String, nullable=True)  # Поле для URL фотографии

    applications = relationship("Application", back_populates="user")  # Связь с заявками
    messages = relationship("Message", back_populates="user")
    email_verifications = relationship("EmailVerification", back_populates="user")
    
    
class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    code = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.datetime.utcnow() + datetime.timedelta(minutes=10))
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Связь с пользователем

    user = relationship("User", back_populates="email_verifications")  # Связь с пользователем

