# backend/app/routers/ideas.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import ValidationError, parse_obj_as
import logging

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user

router = APIRouter(prefix="/ideas", tags=["ideas"])

# Public categories endpoint
@router.get("/categories/", response_model=List[schemas.CategoryOut])
def public_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name.asc()).all()


# Create idea (authenticated)
@router.post("/", response_model=schemas.IdeaOut, status_code=201)
def create_idea(payload: schemas.IdeaCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    idea = models.Idea(
        title=payload.title,
        description=payload.description,
        category_id=payload.category_id,
        owner_id=current_user.id,
        status="Submitted",
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)

    # compute counts
    votes_count = db.query(models.Vote).filter(models.Vote.idea_id == idea.id).count()
    comments_count = db.query(models.Comment).filter(models.Comment.idea_id == idea.id).count()
    owner = db.get(models.User, idea.owner_id)
    owner_name = owner.name if owner else None

    item = {
        "id": int(idea.id),
        "title": idea.title or "",
        "description": idea.description or "",
        "category_id": int(idea.category_id) if idea.category_id is not None else None,
        "owner_id": int(idea.owner_id) if idea.owner_id is not None else None,
        "owner_name": owner_name,
        "status": idea.status or "Submitted",
        "score": float(idea.score) if getattr(idea, "score", None) is not None else 0.0,
        "created_at": getattr(idea, "created_at", None),
        "votes": int(votes_count),
        "comments_count": int(comments_count),
    }

    try:
        return schemas.IdeaOut(**item)
    except ValidationError as e:
        logging.exception("Failed to validate created idea against schema: %s", e)
        return item


# List ideas (supports category filtering & owner filtering & status)
@router.get("/", response_model=List[schemas.IdeaOut])
def list_ideas(
    owner_id: Optional[int] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    q = db.query(models.Idea)
    if owner_id is not None:
        q = q.filter(models.Idea.owner_id == owner_id)
    if category_id is not None:
        q = q.filter(models.Idea.category_id == category_id)
    if status:
        q = q.filter(models.Idea.status == status)

    rows = q.order_by(models.Idea.created_at.desc()).offset(skip).limit(limit).all()

    out = []
    for r in rows:
        votes_count = int(db.query(models.Vote).filter(models.Vote.idea_id == r.id).count())
        comments_count = int(db.query(models.Comment).filter(models.Comment.idea_id == r.id).count())

        owner_name = None
        if r.owner_id:
            owner = db.get(models.User, r.owner_id)
            owner_name = owner.name if owner else None

        # populate category_name safely
        category_name = None
        if getattr(r, "category_id", None) is not None:
            cat = db.get(models.Category, r.category_id)
            category_name = cat.name if cat else None

        item = {
            "id": int(r.id),
            "title": r.title or "",
            "description": r.description or "",
            "category_id": int(r.category_id) if r.category_id is not None else None,
            "category_name": category_name,
            "owner_id": int(r.owner_id) if r.owner_id is not None else None,
            "owner_name": owner_name,
            "status": r.status or "Submitted",
            "score": float(r.score) if getattr(r, "score", None) is not None else 0.0,
            "created_at": getattr(r, "created_at", None),
            "votes": int(votes_count),
            "comments_count": int(comments_count),
        }
        out.append(item)

    try:
        validated = parse_obj_as(List[schemas.IdeaOut], out)
        return validated
    except ValidationError as ve:
        logging.exception("Idea list response failed validation: %s", ve)
        # return raw list on dev if validation fails
        return out


@router.get("/{idea_id}", response_model=schemas.IdeaOut)
def get_idea(idea_id: int, db: Session = Depends(get_db)):
    r = db.get(models.Idea, idea_id)
    if not r:
        raise HTTPException(status_code=404, detail="Idea not found")

    votes_count = int(db.query(models.Vote).filter(models.Vote.idea_id == r.id).count())
    comments_count = int(db.query(models.Comment).filter(models.Comment.idea_id == r.id).count())

    owner_name = None
    if r.owner_id:
        owner = db.get(models.User, r.owner_id)
        owner_name = owner.name if owner else None

    category_name = None
    if getattr(r, "category_id", None) is not None:
        cat = db.get(models.Category, r.category_id)
        category_name = cat.name if cat else None

    item = {
        "id": int(r.id),
        "title": r.title or "",
        "description": r.description or "",
        "category_id": int(r.category_id) if r.category_id is not None else None,
        "category_name": category_name,
        "owner_id": int(r.owner_id) if r.owner_id is not None else None,
        "owner_name": owner_name,
        "status": r.status or "Submitted",
        "score": float(r.score) if getattr(r, "score", None) is not None else 0.0,
        "created_at": getattr(r, "created_at", None),
        "votes": int(votes_count),
        "comments_count": int(comments_count),
    }

    try:
        return schemas.IdeaOut(**item)
    except ValidationError as e:
        logging.exception("Get idea validation failed: %s", e)
        return item


@router.get("/{idea_id}/comments", response_model=List[schemas.CommentOut])
def list_comments(idea_id: int, db: Session = Depends(get_db)):
    rows = db.query(models.Comment).filter(models.Comment.idea_id == idea_id).order_by(models.Comment.created_at.asc()).all()
    out = []
    for r in rows:
        user = db.get(models.User, r.user_id)
        out.append({
            "id": int(r.id),
            "idea_id": int(r.idea_id),
            "user_id": int(r.user_id) if r.user_id is not None else None,
            "user_name": user.name if user else None,
            "content": r.content,
            "created_at": getattr(r, "created_at", None),
        })
    return out


@router.post("/{idea_id}/comments", response_model=schemas.CommentOut, status_code=201)
def create_comment(
    idea_id: int,
    payload: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    idea = db.get(models.Idea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    comment = models.Comment(
        idea_id=idea_id,
        user_id=current_user.id,
        content=payload.content,
    )

    try:
        db.add(comment)
        db.flush()   # helps catch DB errors early
        db.commit()
        db.refresh(comment)
    except Exception as e:
        db.rollback()
        logging.exception("Error saving comment to DB: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save comment")

    user = db.get(models.User, comment.user_id)
    out = {
        "id": int(comment.id),
        "idea_id": int(comment.idea_id),
        "user_id": int(comment.user_id) if comment.user_id is not None else None,
        "user_name": user.name if user else None,
        "content": comment.content,
        "created_at": getattr(comment, "created_at", None),
    }

    try:
        return schemas.CommentOut(**out)
    except ValidationError as e:
        logging.exception("Create comment validation failed: %s", e)
        return out
    
@router.post("/{idea_id}/vote", status_code=200)
def vote(idea_id: int, payload: schemas.VoteIn, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if payload.type not in ("up", "down"):
        raise HTTPException(status_code=400, detail="Invalid vote type")
    idea = db.get(models.Idea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    existing = db.query(models.Vote).filter(models.Vote.idea_id == idea_id, models.Vote.user_id == current_user.id).first()
    if existing:
        existing.type = payload.type
    else:
        v = models.Vote(idea_id=idea_id, user_id=current_user.id, type=payload.type)
        db.add(v)
    db.commit()

    up_count = db.query(models.Vote).filter(models.Vote.idea_id == idea_id, models.Vote.type == "up").count()
    down_count = db.query(models.Vote).filter(models.Vote.idea_id == idea_id, models.Vote.type == "down").count()
    idea.score = float(up_count - down_count)
    db.add(idea)
    db.commit()

    return {"votes": int(up_count), "downs": int(down_count), "score": float(idea.score)}
