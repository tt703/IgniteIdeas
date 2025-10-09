from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.deps import require_roles

router = APIRouter(prefix="/admin", tags=["admin"])

# CATEGORY ENDPOINTS (mounted under /api by main)
@router.post("/categories/", response_model=schemas.CategoryOut, dependencies=[Depends(require_roles("admin"))], status_code=201)
def create_category(payload: schemas.CategoryIn, db: Session = Depends(get_db)):
    cat = models.Category(name=payload.name.strip())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.get("/categories/", response_model=List[schemas.CategoryOut], dependencies=[Depends(require_roles("admin"))])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name.asc()).all()

@router.get("/categories/{category_id}", response_model=schemas.CategoryOut, dependencies=[Depends(require_roles("admin"))])
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.get(models.Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat

@router.patch("/categories/{category_id}", response_model=schemas.CategoryOut, dependencies=[Depends(require_roles("admin"))])
def update_category(category_id: int, payload: dict, db: Session = Depends(get_db)):
    cat = db.get(models.Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if "name" in payload:
        new_name = str(payload["name"]).strip()
        if new_name == "":
            raise HTTPException(status_code=400, detail="name cannot be empty")
        cat.name = new_name
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/categories/{category_id}", dependencies=[Depends(require_roles("admin"))], status_code=200)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.get(models.Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"detail": "deleted"}

# USER MANAGEMENT (unchanged behavior)
@router.get("/users", response_model=List[schemas.UserOut], dependencies=[Depends(require_roles("admin"))])
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    for u in users:
        if u.roles is None:
            u.roles = []
    return users

@router.get("/users/{user_id}", response_model=schemas.UserOut, dependencies=[Depends(require_roles("admin"))])
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.roles is None:
        user.roles = []
    return user

@router.patch("/users/{user_id}", dependencies=[Depends(require_roles("admin"))])
def update_user(user_id: int, payload: dict, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if 'name' in payload:
        user.name = payload['name']
    if 'roles' in payload:
        if not isinstance(payload['roles'], list):
            raise HTTPException(status_code=400, detail="roles must be a list")
        user.roles = payload['roles']
    if 'email' in payload:
        user.email = payload['email']
    if 'active' in payload:
        try:
            user.active = bool(payload['active'])
        except Exception:
            pass
    db.add(user)
    db.commit()
    db.refresh(user)
    if user.roles is None:
        user.roles = []
    return {"id": user.id, "name": user.name, "email": user.email, "roles": user.roles}

@router.delete("/users/{user_id}", dependencies=[Depends(require_roles("admin"))])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "deleted"}
