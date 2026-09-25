import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "NextAbroad AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./nextabroad.db"

    # JWT
    JWT_SECRET: str = "development-secret-key-study-path-abroad-2026-secure"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # AI Providers
    AI_PROVIDER: str = "gemini"  # "gemini", "openai", "mock"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-3.8-flash"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Search Providers
    SEARCH_PROVIDER: str = "mock"  # "tavily", "serpapi", "brave", "mock"
    SEARCH_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        return []

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
