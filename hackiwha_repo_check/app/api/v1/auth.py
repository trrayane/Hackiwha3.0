from fastapi import APIRouter, BackgroundTasks, Depends, status

from app.dependencies.auth import get_current_user
from app.dependencies.services import get_auth_service
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LogoutRequest,
    ResetPasswordRequest,
    Token,
    TokenRefreshRequest,
    UserLogin,
    UserOut,
    UserRegister,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

_GENERIC_RESET_SENT_MESSAGE = "if an account with this email exists, a reset link has been sent"


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister, auth_service: AuthService = Depends(get_auth_service)
) -> User:
    return await auth_service.register(payload.name, payload.email, payload.password)


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin, auth_service: AuthService = Depends(get_auth_service)
) -> Token:
    pair = await auth_service.login(credentials.email, credentials.password)
    return Token(access_token=pair.access_token, refresh_token=pair.refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh(
    payload: TokenRefreshRequest, auth_service: AuthService = Depends(get_auth_service)
) -> Token:
    pair = await auth_service.refresh(payload.refresh_token)
    return Token(access_token=pair.access_token, refresh_token=pair.refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    payload: LogoutRequest, auth_service: AuthService = Depends(get_auth_service)
) -> MessageResponse:
    await auth_service.logout(payload.refresh_token)
    return MessageResponse(message="logged out")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    auth_service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    await auth_service.forgot_password(payload.email, background_tasks)
    return MessageResponse(message=_GENERIC_RESET_SENT_MESSAGE)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest, auth_service: AuthService = Depends(get_auth_service)
) -> MessageResponse:
    await auth_service.reset_password(payload.email, payload.token, payload.new_password)
    return MessageResponse(message="password reset successfully")


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
