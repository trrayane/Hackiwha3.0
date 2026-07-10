from httpx import AsyncClient

from tests.conftest import generate_variant


def _feedback_url(generation: dict) -> str:
    jingle_id = generation["jingle_id"]
    variant_id = generation["variants"][0]["id"]
    return f"/api/v1/jingles/{jingle_id}/variants/{variant_id}/feedback"


async def test_create_feedback_success(client: AsyncClient, auth_headers: dict):
    generation = await generate_variant(client, auth_headers)
    url = _feedback_url(generation)

    response = await client.post(
        url,
        json={"rating": 5, "comment": "nice"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["rating"] == 5
    assert body["comment"] == "nice"


async def test_create_feedback_out_of_range_rejected(client: AsyncClient, auth_headers: dict):
    generation = await generate_variant(client, auth_headers)
    url = _feedback_url(generation)

    response = await client.post(
        url,
        json={"rating": 6},
        headers=auth_headers,
    )
    assert response.status_code == 422


async def test_list_feedback_for_variant(client: AsyncClient, auth_headers: dict):
    generation = await generate_variant(client, auth_headers)
    url = _feedback_url(generation)

    await client.post(url, json={"rating": 3}, headers=auth_headers)
    response = await client.get(url, headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


async def test_feedback_on_unknown_variant_returns_404(client: AsyncClient, auth_headers: dict):
    generation = await generate_variant(client, auth_headers)
    jingle_id = generation["jingle_id"]
    fake_variant_id = "00000000-0000-0000-0000-000000000000"

    response = await client.post(
        f"/api/v1/jingles/{jingle_id}/variants/{fake_variant_id}/feedback",
        json={"rating": 3},
        headers=auth_headers,
    )
    assert response.status_code == 404


async def test_feedback_requires_auth(client: AsyncClient, auth_headers: dict):
    generation = await generate_variant(client, auth_headers)
    url = _feedback_url(generation)

    response = await client.post(url, json={"rating": 3})
    assert response.status_code == 401


async def test_feedback_score_appears_on_jingle(client: AsyncClient, auth_headers: dict):
    generation = await generate_variant(client, auth_headers)
    url = _feedback_url(generation)
    jingle_id = generation["jingle_id"]

    await client.post(url, json={"rating": 4}, headers=auth_headers)

    response = await client.get(f"/api/v1/jingles/{jingle_id}", headers=auth_headers)
    assert response.json()["feedback_score"] == 4.0
