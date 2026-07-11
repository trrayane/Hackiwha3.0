import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import settings


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def verify_code_hash(code: str, code_hash: str) -> bool:
    return hmac.compare_digest(hash_code(code), code_hash)


def reset_token_expiry() -> datetime:
    return utcnow() + timedelta(minutes=settings.reset_token_expire_minutes)


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def is_expired(expires_at: datetime | None) -> bool:
    if expires_at is None:
        return True
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return utcnow() > expires_at


def seconds_until_allowed(last_sent_at: datetime | None, cooldown_seconds: int) -> int:
    if last_sent_at is None:
        return 0
    if last_sent_at.tzinfo is None:
        last_sent_at = last_sent_at.replace(tzinfo=timezone.utc)
    elapsed = (utcnow() - last_sent_at).total_seconds()
    return max(0, int(cooldown_seconds - elapsed))
