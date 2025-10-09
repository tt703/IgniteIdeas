from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any,Dict

class Token(BaseModel):
    access_token: str
    token_type: str="bearer"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    roles: List[str] = []
    class Config:
        from_attributes = True

class IdeaCreate(BaseModel):
    title: str
    description: str
    category_id: int
    tags: List[str] = []

class IdeaOut(BaseModel):
    id: int
    title: str
    description: str
    category_id: Optional[int] 
    category_name: Optional[str] 
    owner_id: Optional[int]
    owner_name: Optional[str]
    status: str
    score: float
    votes: Optional[int] = 0
    comments_count: Optional[int] = 0
    created_at: Any
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content:str

class CommentOut(BaseModel):
    id: int
    idea_id:int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    content: str
    created_at:Any
    class Config:
        from_attributes = True

class VoteIn(BaseModel):
    type: str #likes-up dislike-down

class EvalIn(BaseModel):
    criteria_scores: Dict[str, int]

class StatusIn(BaseModel):
    status: str

class CategoryIn(BaseModel):
    name:str

class CategoryOut(BaseModel):
    id:int
    name: str
    class config:
        from_attributes =True