from httpx import AsyncClient

from tests.conftest import login, register_user, unique_email


async def test_register_success(client: AsyncClient):
    email = unique_email()
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Grug",
            "email": email,
            "password": "StrongP1!",
            "confirm_password": "StrongP1!",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == email
    assert body["role"] == "user"
    assert body["is_active"] is True


async def test_register_weak_password_rejected(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Grug",
            "email": unique_email(),
            "password": "weakpass",
            "confirm_password": "weakpass",
        },
    )
    assert response.status_code == 422


async def test_register_password_mismatch_rejected(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Grug",
            "email": unique_email(),
            "password": "StrongP1!",
            "confirm_password": "Different1!",
        },
    )
    assert response.status_code == 422


async def test_register_duplicate_email_rejected(client: AsyncClient):
    email = unique_email()
    await register_user(client, email)

    response = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Grug",
            "email": email,
            "password": "StrongP1!",
            "confirm_password": "StrongP1!",
        },
    )
    assert response.status_code == 409


async def test_login_success(client: AsyncClient):
    email = unique_email()
    await register_user(client, email)
    tokens = await login(client, email)
    assert "access_token" in tokens
    assert "refresh_token" in tokens


async def test_login_wrong_password_rejected(client: AsyncClient):
    email = unique_email()
    await register_user(client, email)
    response = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "WrongPass1!"}
    )
    assert response.status_code == 401


async def test_login_unknown_email_rejected(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": unique_email("ghost"), "password": "StrongP1!"},
    )
    assert response.status_code == 401


async def test_me_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


async def test_me_returns_current_user(client: AsyncClient):
    email = unique_email()
    await register_user(client, email)
    tokens = await login(client, email)
    response = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == email


async def test_refresh_rotates_token_and_rejects_reuse(client: AsyncClient):
    email = unique_email()
    await register_user(client, email)
    tokens = await login(client, email)

    refresh_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert refresh_response.status_code == 200
    new_tokens = refresh_response.json()
    assert new_tokens["refresh_token"] != tokens["refresh_token"]

    reuse_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert reuse_response.status_code == 401


async def test_logout_revokes_refresh_token(client: AsyncClient):
    email = unique_email()
    await register_user(client, email)
    tokens = await login(client, email)

    logout_response = await client.post(
        "/api/v1/auth/logout", json={"refresh_token": tokens["refresh_token"]}
    )
    assert logout_response.status_code == 200

    reuse_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert reuse_response.status_code == 401


async def test_forgot_and_reset_password_flow(client: AsyncClient, captured_emails):
    email = unique_email()
    await register_user(client, email)

    forgot_response = await client.post(
        "/api/v1/auth/forgot-password", json={"email": email}
    )
    assert forgot_response.status_code == 200

    reset_link = captured_emails["reset"][-1]["reset_link"]
    token = reset_link.split("token=")[1].split("&")[0]

    reset_response = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": email,
            "token": token,
            "new_password": "NewStrongP1!",
            "confirm_new_password": "NewStrongP1!",
        },
    )
    assert reset_response.status_code == 200

    old_password_login = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "StrongP1!"}
    )
    assert old_password_login.status_code == 401

    new_password_login = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "NewStrongP1!"}
    )
    assert new_password_login.status_code == 200


async def test_forgot_password_unknown_email_returns_generic_message(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/forgot-password", json={"email": unique_email("ghost")}
    )
    assert response.status_code == 200
    assert "if an account" in response.json()["message"]


async def test_reset_password_wrong_token_rejected(client: AsyncClient, captured_emails):
    email = unique_email()
    await register_user(client, email)
    await client.post("/api/v1/auth/forgot-password", json={"email": email})

    response = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": email,
            "token": "totally-wrong-token",
            "new_password": "NewStrongP1!",
            "confirm_new_password": "NewStrongP1!",
        },
    )
    assert response.status_code == 400
