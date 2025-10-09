from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str="mysql+pymyslql://igniteuser:ignitepassword@db:3306/ignitedb"
    JWT_SECRET:str="SECRET_KEY"
    JWT_ALGORITHM:str="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:int=1440 #basically 1 day 60*24

    class Config:
        env_file = ".env"

settings = Settings()
