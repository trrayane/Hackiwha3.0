from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

_password_hasher = PasswordHasher()

# Constant-time fallback so a login with an unknown email takes the same
# time as one with a wrong password (avoids leaking which emails exist).
_DUMMY_HASH = _password_hasher.hash("dummy-password-for-timing-safety")


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    target_hash = hashed_password if hashed_password is not None else _DUMMY_HASH
    try:
        _password_hasher.verify(target_hash, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        return False
    return hashed_password is not None
