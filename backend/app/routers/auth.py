from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    create_user,
    get_user_by_email,
    get_user_by_username,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Yeni kullanıcı kaydı oluştur ve JWT token döndür."""
    if await get_user_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Bu e-posta zaten kayıtlı.")
    if await get_user_by_username(db, payload.username):
        raise HTTPException(status_code=409, detail="Bu kullanıcı adı zaten alınmış.")

    user = await create_user(db, payload.username, payload.email, payload.password)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """E-posta + şifre ile giriş yap, JWT token döndür."""
    user = await get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı e-posta veya şifre.",
        )
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Mevcut oturumdaki kullanıcının bilgisini döndür (JWT korumalı)."""
    return UserResponse.model_validate(current_user)
