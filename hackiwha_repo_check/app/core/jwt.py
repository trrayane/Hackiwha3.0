import uuid
from datetime import datetime, timedelta, timezone
from typing import Literal

from jose import JWTError, jwt

from app.core.config import settings

ACCESS_TYPE: Literal["access"] = "access"
REFRESH_TYPE: Literal["refresh"] = "refresh"


def _create_token(subject: str, role: str, token_type: str, expires_delta: timedelta, jti: str | None = None) -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    token_jti = jti or str(uuid.uuid4())
    payload = {
        "sub": subject,
        "role": role,
        "type": token_type,
        "jti": token_jti,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    return token, token_jti


def create_access_token(subject: str, role: str) -> str:
    token, _ = _create_token(
        subject, role, ACCESS_TYPE, timedelta(minutes=settings.access_token_expire_minutes)
    )
    return token


def create_refresh_token(subject: str, role: str) -> tuple[str, str]:
    return _create_token(
        subject, role, REFRESH_TYPE, timedelta(days=settings.refresh_token_expire_days)
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        raise ValueError("invalid or expired token") from exc
