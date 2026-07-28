from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "govassist"
    groq_api_key: str = ""
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    google_application_credentials: str = ""
    clerk_secret_key: str = ""
    secret_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    default_admin_email: str = "admin@govassist.ai"
    default_admin_password: str = ""
    default_admin_name: str = "System Administrator"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
