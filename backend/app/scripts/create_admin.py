import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.core.security import hash_password
from app.database import SessionLocal, engine
from app import models

def create_admin():
    db = SessionLocal()
    admin = db.query(models.User).filter(models.User.email == "admin@ignite.com").first()
    if admin:
        print("Admin user already exists.")
        return
    admin = models.User(
        name="Admin",
        email="admin@ignite.com",
        hashed_password=hash_password("adminpassword"),
        roles=["admin"]
    )
    db.add(admin)
    db.commit()
    print("Admin user created with email : admin@ignite.com / password : adminpassword")

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=engine)
    create_admin()