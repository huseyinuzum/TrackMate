from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "TrackMate"
    app_version: str = "0.1.0"
    debug: bool = True

    # Veritabanı
    database_url: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # NLP Servisleri (Gemini)
    gemini_api_key: str | None = None

    # Harita Servisleri (Geoapify)
    geoapify_api_key: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
