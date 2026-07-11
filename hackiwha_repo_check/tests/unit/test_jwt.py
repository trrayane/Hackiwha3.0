import pytest

from app.core.jwt import (
    ACCESS_TYPE,
    REFRESH_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
)


def test_create_and_decode_access_token():
    token = create_access_token("user-123", "user")
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["role"] == "user"
    assert payload["type"] == ACCESS_TYPE


def test_create_and_decode_refresh_token():
    token, jti = create_refresh_token("user-123", "admin")
    payload = decode_token(token)
    assert payload["type"] == REFRESH_TYPE
    assert payload["jti"] == jti


def test_refresh_tokens_have_unique_jti():
    _, jti_one = create_refresh_token("user-123", "user")
    _, jti_two = create_refresh_token("user-123", "user")
    assert jti_one != jti_two


def test_decode_token_rejects_garbage():
    with pytest.raises(ValueError):
        decode_token("not-a-real-token")


def test_decode_token_rejects_tampered_token():
    token = create_access_token("user-123", "user")
    tampered = token[:-2] + ("aa" if not token.endswith("aa") else "bb")
    with pytest.raises(ValueError):
        decode_token(tampered)
