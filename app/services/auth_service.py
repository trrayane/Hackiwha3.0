from dataclasses import dataclass
from datetime import datetime, timezone

from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    BadRequestError,
    ConflictError,
    ForbiddenError,
    TooManyRequestsError,
    UnauthorizedError,
)
from app.core.jwt import REFRESH_TYPE, create_access_token, create_refresh_token, decode_token
from app.core.security import hash_password, verify_password
from app.core.tokens import (
    generate_reset_token,
    hash_code,
    is_expired,
    reset_token_expiry,
    seconds_until_allowed,
    utcnow,
    verify_code_hash,
)
from app.models.enums import UserRole
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.services.email_service import send_password_reset_email


@dataclass
class TokenPair:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.users = UserRepository(session)
        self.refresh_tokens = RefreshTokenRepository(session)

    async def register(self, name: str, email: str, password: str) -> User:
        existing = await self.users.get_by_email(email)
        if existing:
            raise ConflictError("email already registered")

        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.USER,
        )
        return await self.users.add(user)

    async def login(self, email: str, password: str) -> TokenPair:
        user = await self.users.get_by_email(email)
        password_ok = verify_password(password, user.hashed_password if user else None)

        if not user or not password_ok:
            raise UnauthorizedError("invalid email or password")
        if not user.is_active:
            raise ForbiddenError("user is inactive")

        return await self._issue_token_pair(user)

    async def refresh(self, refresh_token: str) -> TokenPair:
        invalid = UnauthorizedError("invalid or expired refresh token")

        try:
            decoded = decode_token(refresh_token)
        except ValueError:
            raise invalid

        if decoded.get("type") != REFRESH_TYPE:
            raise invalid

        jti = decoded.get("jti")
        stored = await self.refresh_tokens.get_by_jti(jti) if jti else None
        if not stored or stored.revoked_at is not None or is_expired(stored.expires_at):
            raise invalid
        if stored.token_hash != hash_code(refresh_token):
            raise invalid

        user = await self.users.get_by_id(stored.user_id)
        if not user or not user.is_active:
            raise invalid

        stored.revoked_at = utcnow()
        await self.session.commit()

        return await self._issue_token_pair(user)

    async def logout(self, refresh_token: str) -> None:
        try:
            decoded = decode_token(refresh_token)
        except ValueError:
            return

        jti = decoded.get("jti")
        if not jti:
            return

        stored = await self.refresh_tokens.get_by_jti(jti)
        if stored and stored.revoked_at is None:
            stored.revoked_at = utcnow()
            await self.session.commit()

    async def delete_account(self, user: User, password: str) -> None:
        if not verify_password(password, user.hashed_password):
            raise UnauthorizedError("incorrect password")

        user.deleted_at = utcnow()
        user.is_active = False
        await self.refresh_tokens.revoke_all_for_user(user.id)
        await self.session.commit()

    async def forgot_password(self, email: str, background_tasks: BackgroundTasks) -> None:
        user = await self.users.get_by_email(email)
        if user:
            wait_seconds = seconds_until_allowed(
                user.reset_last_sent_at, settings.reset_resend_cooldown_seconds
            )
            if wait_seconds > 0:
                raise TooManyRequestsError(
                    f"please wait {wait_seconds} seconds before requesting a new reset link"
                )

            token = generate_reset_token()
            user.reset_token_hash = hash_code(token)
            user.reset_token_expires_at = reset_token_expiry()
            user.reset_last_sent_at = utcnow()
            await self.session.commit()

            reset_link = f"https://app.jingle-engine.example/reset-password?token={token}&email={user.email}"
            background_tasks.add_task(send_password_reset_email, user.email, user.name, reset_link)

    async def reset_password(self, email: str, token: str, new_password: str) -> None:
        invalid = BadRequestError("invalid or expired reset token")

        user = await self.users.get_by_email(email)
        if not user or user.reset_token_hash is None or is_expired(user.reset_token_expires_at):
            raise invalid
        if not verify_code_hash(token, user.reset_token_hash):
            raise invalid

        user.hashed_password = hash_password(new_password)
        user.reset_token_hash = None
        user.reset_token_expires_at = None
        await self.session.commit()

    async def _issue_token_pair(self, user: User) -> TokenPair:
        access_token = create_access_token(str(user.id), user.role.value)
        refresh_token, jti = create_refresh_token(str(user.id), user.role.value)

        decoded = decode_token(refresh_token)
        record = RefreshToken(
            user_id=user.id,
            jti=jti,
            token_hash=hash_code(refresh_token),
            expires_at=datetime.fromtimestamp(decoded["exp"], tz=timezone.utc),
        )
        await self.refresh_tokens.add(record)

        return TokenPair(access_token=access_token, refresh_token=refresh_token)
