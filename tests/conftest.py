import uuid
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.security import hash_password
from app.database.session import get_db
from app.dependencies.services import get_ai_provider, get_storage_service
from app.integrations.ai_provider import (
    AIProviderService,
    JingleGenerationInput,
    JingleGenerationResult,
)
from app.integrations.storage import LocalStorageService
from app.main import app
from app.models.enums import UserRole
from app.models.user import User

_connect_args = {"ssl": "require"} if "asyncpg" in settings.database_url else {}
# NullPool: each test opens a fresh connection instead of reusing one from a
# pool, since asyncpg connections can't be reused across the different event
# loops pytest-asyncio spins up per test function.
engine = create_async_engine(settings.database_url, connect_args=_connect_args, poolclass=NullPool)


class FakeAIProviderService(AIProviderService):
    """Deterministic fake provider used only in tests, so the generation
    workflow can be exercised end-to-end without a real AI implementation."""

    provider_name = "fake-test-provider"

    async def generate_jingle(self, payload: JingleGenerationInput) -> JingleGenerationResult:
        return JingleGenerationResult(
            provider=self.provider_name,
            audio_url="https://cdn.test/fake.mp3",
            lyrics=f"fake lyrics for {payload.brand_name}",
            duration_seconds=15,
            generation_time_ms=1,
        )


class FailingAIProviderService(AIProviderService):
    """Fake provider that always fails, to test the FAILED status path."""

    provider_name = "failing-test-provider"

    async def generate_jingle(self, payload: JingleGenerationInput) -> JingleGenerationResult:
        raise RuntimeError("simulated provider failure")


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with engine.connect() as conn:
        await conn.begin()
        session_factory = async_sessionmaker(
            bind=conn, expire_on_commit=False, join_transaction_mode="create_savepoint"
        )
        async with session_factory() as session:
            yield session
        await conn.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession, tmp_path) -> AsyncGenerator[AsyncClient, None]:
    async def _get_db_override() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _get_db_override
    app.dependency_overrides[get_ai_provider] = lambda: FakeAIProviderService()
    # Uploads go to a per-test temp dir instead of the real uploads/ folder.
    app.dependency_overrides[get_storage_service] = lambda: LocalStorageService(
        base_dir=str(tmp_path), public_base_url="http://test"
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def captured_emails(monkeypatch) -> dict:
    captured = {"reset": []}

    def _fake_send_reset_email(to_email: str, name: str, reset_link: str) -> None:
        captured["reset"].append({"to": to_email, "name": name, "reset_link": reset_link})

    monkeypatch.setattr(
        "app.services.auth_service.send_password_reset_email", _fake_send_reset_email
    )
    return captured


def unique_email(prefix: str = "test") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}@example.com"


async def register_user(
    client: AsyncClient,
    email: str,
    password: str = "StrongP1!",
    name: str = "Test User",
) -> dict:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
            "confirm_password": password,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


async def login(client: AsyncClient, email: str, password: str = "StrongP1!") -> dict:
    response = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )
    assert response.status_code == 200, response.text
    return response.json()


async def auth_headers_for(client: AsyncClient, email: str, password: str = "StrongP1!") -> dict:
    tokens = await login(client, email, password)
    return {"Authorization": f"Bearer {tokens['access_token']}"}


async def create_draft(client: AsyncClient, headers: dict, brand_name: str = "CaveCola") -> dict:
    response = await client.post(
        "/api/v1/jingles",
        json={"brand_name": brand_name, "brand_tone": "energetic"},
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


async def complete_wizard(client: AsyncClient, headers: dict, jingle_id: str) -> None:
    audience = await client.patch(
        f"/api/v1/jingles/{jingle_id}/audience",
        json={"target_age_range": "25-40", "mood_context": "focus time"},
        headers=headers,
    )
    assert audience.status_code == 200, audience.text

    platform = await client.patch(
        f"/api/v1/jingles/{jingle_id}/platform",
        json={"platform": "instagram_reels"},
        headers=headers,
    )
    assert platform.status_code == 200, platform.text


async def complete_creative_direction(
    client: AsyncClient,
    headers: dict,
    jingle_id: str,
    sound_description: str | None = "warm acoustic guitar intro",
    voice_enabled: bool = True,
) -> dict:
    response = await client.patch(
        f"/api/v1/jingles/{jingle_id}/creative-direction",
        json={"sound_description": sound_description, "voice_enabled": voice_enabled},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    return response.json()


def audio_file(
    filename: str = "sample.mp3", size_bytes: int = 1024, content_type: str = "audio/mpeg"
) -> dict:
    return {"file": (filename, b"a" * size_bytes, content_type)}


async def generate_variant(client: AsyncClient, headers: dict) -> dict:
    """Creates a draft, completes the wizard, and generates a variant with FakeAIProviderService."""
    draft = await create_draft(client, headers)
    await complete_wizard(client, headers, draft["id"])
    response = await client.post(f"/api/v1/jingles/{draft['id']}/generate", headers=headers)
    assert response.status_code == 200, response.text
    return response.json()


@pytest_asyncio.fixture
async def verified_user(db_session: AsyncSession) -> User:
    """A pre-inserted user, for tests that don't care about the register flow."""
    user = User(
        name="Test User",
        email=unique_email("user"),
        hashed_password=hash_password("StrongP1!"),
        role=UserRole.USER,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient, verified_user: User) -> dict:
    return await auth_headers_for(client, verified_user.email)
