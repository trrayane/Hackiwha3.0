from httpx import AsyncClient

from tests.conftest import audio_file, auth_headers_for, create_draft, unique_email


async def test_upload_reference_audio_success(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)

    response = await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio",
        files=audio_file(),
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["original_filename"] == "sample.mp3"
    assert body["content_type"] == "audio/mpeg"
    assert body["size_bytes"] == 1024
    assert body["url"].startswith("http://test/media/")


async def test_upload_reference_audio_requires_auth(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    response = await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file()
    )
    assert response.status_code == 401


async def test_upload_reference_audio_unsupported_format_rejected(
    client: AsyncClient, auth_headers: dict
):
    draft = await create_draft(client, auth_headers)
    response = await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio",
        files=audio_file(filename="notes.txt", content_type="text/plain"),
        headers=auth_headers,
    )
    assert response.status_code == 415


async def test_upload_reference_audio_too_large_rejected(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    oversized = 21 * 1024 * 1024  # over the 20 MB default limit
    response = await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio",
        files=audio_file(size_bytes=oversized),
        headers=auth_headers,
    )
    assert response.status_code == 413


async def test_upload_reference_audio_twice_conflicts(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=auth_headers
    )
    second = await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=auth_headers
    )
    assert second.status_code == 409


async def test_upload_reference_audio_unknown_jingle_returns_404(
    client: AsyncClient, auth_headers: dict
):
    response = await client.post(
        "/api/v1/jingles/00000000-0000-0000-0000-000000000000/reference-audio",
        files=audio_file(),
        headers=auth_headers,
    )
    assert response.status_code == 404


async def test_replace_reference_audio_success(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    first = await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio",
        files=audio_file(filename="first.mp3"),
        headers=auth_headers,
    )
    assert first.status_code == 201

    replaced = await client.put(
        f"/api/v1/jingles/{draft['id']}/reference-audio",
        files=audio_file(filename="second.wav", content_type="audio/wav", size_bytes=2048),
        headers=auth_headers,
    )
    assert replaced.status_code == 200
    body = replaced.json()
    assert body["original_filename"] == "second.wav"
    assert body["size_bytes"] == 2048
    assert body["id"] == first.json()["id"]


async def test_replace_reference_audio_without_existing_returns_404(
    client: AsyncClient, auth_headers: dict
):
    draft = await create_draft(client, auth_headers)
    response = await client.put(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=auth_headers
    )
    assert response.status_code == 404


async def test_get_reference_audio_metadata(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=auth_headers
    )
    response = await client.get(
        f"/api/v1/jingles/{draft['id']}/reference-audio", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["original_filename"] == "sample.mp3"


async def test_get_reference_audio_missing_returns_404(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    response = await client.get(
        f"/api/v1/jingles/{draft['id']}/reference-audio", headers=auth_headers
    )
    assert response.status_code == 404


async def test_delete_reference_audio_success(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=auth_headers
    )

    delete_response = await client.delete(
        f"/api/v1/jingles/{draft['id']}/reference-audio", headers=auth_headers
    )
    assert delete_response.status_code == 204

    get_response = await client.get(
        f"/api/v1/jingles/{draft['id']}/reference-audio", headers=auth_headers
    )
    assert get_response.status_code == 404


async def test_delete_reference_audio_missing_returns_404(client: AsyncClient, auth_headers: dict):
    draft = await create_draft(client, auth_headers)
    response = await client.delete(
        f"/api/v1/jingles/{draft['id']}/reference-audio", headers=auth_headers
    )
    assert response.status_code == 404


async def test_user_cannot_access_another_users_reference_audio(
    client: AsyncClient, auth_headers: dict, db_session
):
    draft = await create_draft(client, auth_headers)
    await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=auth_headers
    )

    from app.core.security import hash_password
    from app.models.enums import UserRole
    from app.models.user import User

    other_user = User(
        name="Other",
        email=unique_email("other"),
        hashed_password=hash_password("StrongP1!"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(other_user)
    await db_session.commit()

    other_auth = await auth_headers_for(client, other_user.email)

    get_response = await client.get(
        f"/api/v1/jingles/{draft['id']}/reference-audio", headers=other_auth
    )
    assert get_response.status_code == 404

    upload_response = await client.post(
        f"/api/v1/jingles/{draft['id']}/reference-audio", files=audio_file(), headers=other_auth
    )
    assert upload_response.status_code == 404
