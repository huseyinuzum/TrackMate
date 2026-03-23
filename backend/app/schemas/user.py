import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ── İstek (Request) Şemaları ────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Yanıt (Response) Şemaları ───────────────────────────────────────────────

class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
