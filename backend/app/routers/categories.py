from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db


router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.CategoryOut])
def public_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name.asc()).all()