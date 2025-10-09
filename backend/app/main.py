from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.database import engine
import app.models as models
from app.routers import auth, ideas, admin, categories


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="IgniteIdeas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(ideas.router, prefix="/api", tags=["ideas"] )
app.include_router(admin.router, prefix="/api", tags=["admin"])
app.include_router(categories.router, prefix="/api", tags=["categories"])