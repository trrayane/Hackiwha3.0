from httpx import AsyncClient

from app.dependencies.services import get_ai_provider
from app.main import app
from tests.conftest import (
    FailingAIProviderService,
    FakeAIProviderService,
    audio_file,
    complete_wizard,
    create_draft,
    generate_variant,
)


async def test_history_generations_lists_completed(client: AsyncClient, auth_headers: dict):
    await generate_variant(client, auth_headers)
    response = await client.get("/api/v1/history/generations", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["status"] == "completed"


async def test_history_recent_activity(client: AsyncClient, auth_headers: dict):
    await generate_variant(client, auth_headers)
    response = await client.get("/api/v1/history/recent-activity", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_history_favorites_only_returns_favorited(client: AsyncClient, auth_headers: dict):
    favorite_draft = await create_draft(client, auth_headers, brand_name="FavBrand")
    await create_draft(client, auth_headers, brand_name="NotFavBrand")

    await client.post(f"/api/v1/jingles/{favorite_draft['id']}/favorite", headers=auth_headers)

    response = await client.get("/api/v1/history/favorites", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["brand_name"] == "FavBrand"


async def test_history_archived_only_returns_archived(client: AsyncClient, auth_headers: dict):
    archived_draft = await create_draft(client, auth_headers, brand_name="ArchivedBrand")
    await create_draft(client, auth_headers, brand_name="ActiveBrand")

    await client.post(f"/api/v1/jingles/{archived_draft['id']}/archive", headers=auth_headers)

    response = await client.get("/api/v1/history/archived", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["brand_name"] == "ArchivedBrand"


async def test_history_favorites_includes_reference_audio_url(
    client: AsyncClient, auth_headers: dict
):
    draft = await create_draft(client, auth_headers, brand_name="FavWithAudio")
    await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=auth_headers
    )
    await client.post(f"/api/v1/jingles/{draft['id']}/favorite", headers=auth_headers)

    response = await client.get("/api/v1/history/favorites", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["reference_audio"] is not None
    assert body[0]["reference_audio"]["url"].startswith("http://test/media/")


async def test_history_archived_includes_reference_audio_url(
    client: AsyncClient, auth_headers: dict
):
    draft = await create_draft(client, auth_headers, brand_name="ArchivedWithAudio")
    await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=auth_headers
    )
    await client.post(f"/api/v1/jingles/{draft['id']}/archive", headers=auth_headers)

    response = await client.get("/api/v1/history/archived", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["reference_audio"] is not None
    assert body[0]["reference_audio"]["url"].startswith("http://test/media/")


async def test_dashboard_summary_counts(client: AsyncClient, auth_headers: dict):
    await generate_variant(client, auth_headers)

    app.dependency_overrides[get_ai_provider] = lambda: FailingAIProviderService()
    try:
        draft = await create_draft(client, auth_headers, brand_name="WillFail")
        await complete_wizard(client, auth_headers, draft["id"])
        await client.post(f"/api/v1/jingles/{draft['id']}/generate", headers=auth_headers)
    finally:
        app.dependency_overrides[get_ai_provider] = lambda: FakeAIProviderService()

    response = await client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["total_projects"] == 2
    assert body["completed_requests"] == 1
    assert body["failed_requests"] == 1
    assert body["total_generated_jingles"] == 1
    assert body["draft_count"] == 1
    assert body["in_review_count"] == 1
    assert body["approved_count"] == 0
    assert body["jingle_quota"] == 5
    assert body["jingles_used"] == 2
    assert body["top_platforms"][0]["platform"] == "instagram_reels"
    assert body["top_platforms"][0]["count"] == 2


async def test_dashboard_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/dashboard/summary")
    assert response.status_code == 401
