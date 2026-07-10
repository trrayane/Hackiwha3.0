from httpx import AsyncClient

from app.core.security import hash_password
from app.dependencies.services import get_ai_provider
from app.main import app
from app.models.enums import UserRole
from app.models.user import User
from tests.conftest import (
    FailingAIProviderService,
    FakeAIProviderService,
    complete_wizard,
    create_draft,
    login,
    unique_email,
)


async def test_create_draft_returns_id(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    assert "id" in draft
    assert draft["brand_name"] == "CaveCola"


async def test_create_draft_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/v1/jingles", json={"brand_name": "CaveCola", "brand_tone": "energetic"}
    )
    assert response.status_code == 401


async def test_update_audience_and_platform(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await complete_wizard(client, auth_headers, draft["id"])

    get_response = await client.get(f"/api/v1/jingles/{draft['id']}", headers=auth_headers)
    body = get_response.json()
    assert body["platform"] == "instagram_reels"
    assert body["target_age_range"] == "25-40"
    assert body["mood_context"] == "focus time"


async def test_generate_requires_all_wizard_fields(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    response = await client.post(f"/api/v1/jingles/{draft['id']}/generate", headers=auth_headers)
    assert response.status_code == 400


async def test_generate_success_with_fake_provider(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await complete_wizard(client, auth_headers, draft["id"])

    response = await client.post(f"/api/v1/jingles/{draft['id']}/generate", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert len(body["variants"]) == 1
    assert body["variants"][0]["provider"] == "fake-test-provider"


async def test_generate_marks_failed_when_provider_errors(client: AsyncClient, auth_headers: dict):
    app.dependency_overrides[get_ai_provider] = lambda: FailingAIProviderService()
    try:
        draft = await create_draft(client, auth_headers)
        await complete_wizard(client, auth_headers, draft["id"])

        response = await client.post(
            f"/api/v1/jingles/{draft['id']}/generate", headers=auth_headers
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "failed"
        assert body["error_message"] == "simulated provider failure"
        assert body["variants"] == []
    finally:
        app.dependency_overrides[get_ai_provider] = lambda: FakeAIProviderService()


async def test_get_jingle_not_found(client: AsyncClient, auth_headers: dict):
    response = await client.get(
        "/api/v1/jingles/00000000-0000-0000-0000-000000000000", headers=auth_headers
    )
    assert response.status_code == 404


async def test_update_jingle_patch(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    response = await client.patch(
        f"/api/v1/jingles/{draft['id']}", json={"brand_name": "Updated"}, headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["brand_name"] == "Updated"


async def test_delete_jingle_soft_deletes(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    delete_response = await client.delete(f"/api/v1/jingles/{draft['id']}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = await client.get(f"/api/v1/jingles/{draft['id']}", headers=auth_headers)
    assert get_response.status_code == 404


async def test_duplicate_jingle(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    response = await client.post(f"/api/v1/jingles/{draft['id']}/duplicate", headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["id"] != draft["id"]
    assert "(copy)" in body["brand_name"]


async def test_favorite_toggle(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    on = await client.post(f"/api/v1/jingles/{draft['id']}/favorite", headers=auth_headers)
    assert on.status_code == 200
    assert on.json()["is_favorite"] is True

    off = await client.post(f"/api/v1/jingles/{draft['id']}/favorite", headers=auth_headers)
    assert off.json()["is_favorite"] is False


async def test_archive_toggle(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    on = await client.post(f"/api/v1/jingles/{draft['id']}/archive", headers=auth_headers)
    assert on.status_code == 200
    assert on.json()["is_archived"] is True


async def test_list_jingles_search_and_pagination(client: AsyncClient, auth_headers: dict):
    await create_draft(client, auth_headers, brand_name="UniqueBrandAlpha")
    await create_draft(client, auth_headers, brand_name="UniqueBrandBeta")

    response = await client.get(
        "/api/v1/jingles?search=UniqueBrandAlpha", headers=auth_headers
    )
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["brand_name"] == "UniqueBrandAlpha"


async def test_user_cannot_access_another_users_jingle(
    client: AsyncClient, auth_headers: dict, db_session
):
    draft = await create_draft(client, auth_headers)

    other_user = User(
        name="Other",
        email=unique_email("other"),
        hashed_password=hash_password("StrongP1!"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(other_user)
    await db_session.commit()

    other_tokens = await login(client, other_user.email)
    other_headers = {"Authorization": f"Bearer {other_tokens['access_token']}"}

    response = await client.get(f"/api/v1/jingles/{draft['id']}", headers=other_headers)
    assert response.status_code == 404
