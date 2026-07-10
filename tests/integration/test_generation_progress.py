from httpx import AsyncClient

from tests.conftest import complete_creative_direction, complete_wizard, create_draft


async def test_get_generation_by_id(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await complete_wizard(client, auth_headers, draft["id"])
    await complete_creative_direction(client, auth_headers, draft["id"])

    generate_response = await client.post(
        f"/api/v1/jingles/{draft['id']}/generate", headers=auth_headers
    )
    request_id = generate_response.json()["id"]

    response = await client.get(
        f"/api/v1/jingles/{draft['id']}/generations/{request_id}", headers=auth_headers
    )
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == request_id
    assert body["progress_percent"] == 100
    assert body["status"] == "completed"


async def test_get_unknown_generation_returns_404(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    fake_id = "00000000-0000-0000-0000-000000000000"

    response = await client.get(
        f"/api/v1/jingles/{draft['id']}/generations/{fake_id}", headers=auth_headers
    )
    assert response.status_code == 404


async def test_cancel_completed_generation_conflicts(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await complete_wizard(client, auth_headers, draft["id"])
    await complete_creative_direction(client, auth_headers, draft["id"])

    generate_response = await client.post(
        f"/api/v1/jingles/{draft['id']}/generate", headers=auth_headers
    )
    request_id = generate_response.json()["id"]

    response = await client.post(
        f"/api/v1/jingles/{draft['id']}/generations/{request_id}/cancel", headers=auth_headers
    )
    assert response.status_code == 409


async def test_cancel_unknown_generation_returns_404(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    fake_id = "00000000-0000-0000-0000-000000000000"

    response = await client.post(
        f"/api/v1/jingles/{draft['id']}/generations/{fake_id}/cancel", headers=auth_headers
    )
    assert response.status_code == 404
