from app.core.security import hash_password, verify_password


def test_hash_password_produces_different_hash_than_plain():
    hashed = hash_password("StrongP1!")
    assert hashed != "StrongP1!"


def test_verify_password_correct():
    hashed = hash_password("StrongP1!")
    assert verify_password("StrongP1!", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("StrongP1!")
    assert verify_password("WrongPass1!", hashed) is False


def test_verify_password_with_none_hash_returns_false():
    # Login flow passes None when the user doesn't exist, to keep timing constant.
    assert verify_password("anything", None) is False


def test_hash_password_is_salted():
    hash_one = hash_password("StrongP1!")
    hash_two = hash_password("StrongP1!")
    assert hash_one != hash_two
