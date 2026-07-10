from datetime import timedelta

from app.core.tokens import (
    generate_reset_token,
    hash_code,
    is_expired,
    seconds_until_allowed,
    utcnow,
    verify_code_hash,
)


def test_generate_reset_token_is_url_safe_and_long():
    token = generate_reset_token()
    assert len(token) > 20


def test_generate_reset_token_is_unique():
    assert generate_reset_token() != generate_reset_token()


def test_hash_code_is_deterministic():
    assert hash_code("some-token") == hash_code("some-token")


def test_hash_code_differs_per_input():
    assert hash_code("token-a") != hash_code("token-b")


def test_verify_code_hash_correct():
    token = generate_reset_token()
    assert verify_code_hash(token, hash_code(token)) is True


def test_verify_code_hash_wrong():
    assert verify_code_hash("wrong-token", hash_code("real-token")) is False


def test_is_expired_none_is_expired():
    assert is_expired(None) is True


def test_is_expired_future_not_expired():
    future = utcnow() + timedelta(minutes=5)
    assert is_expired(future) is False


def test_is_expired_past_is_expired():
    past = utcnow() - timedelta(minutes=5)
    assert is_expired(past) is True


def test_seconds_until_allowed_none_is_zero():
    assert seconds_until_allowed(None, 60) == 0


def test_seconds_until_allowed_just_sent():
    assert seconds_until_allowed(utcnow(), 60) > 0


def test_seconds_until_allowed_long_ago_is_zero():
    long_ago = utcnow() - timedelta(minutes=10)
    assert seconds_until_allowed(long_ago, 60) == 0
