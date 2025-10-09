from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)    
    hashed_password = Column(String(255), nullable=False)
    roles = Column(JSON, nullable=False,default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ideas = relationship("Idea", back_populates="owner")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

class Idea(Base):
    __tablename__ = "ideas"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50),default="Submitted",nullable=False)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="ideas")
    category = relationship("Category")

class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(10), nullable=False)  # 'upvote' or 'downvote'
    created_at = Column(DateTime, default=datetime.utcnow)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    #updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    criteria = Column(String(100), nullable=False) #e.g., "Feasibility ; 9", "Impact;9"
    total_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)



