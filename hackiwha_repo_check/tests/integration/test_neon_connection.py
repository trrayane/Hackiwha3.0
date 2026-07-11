"""Real smoke test against the actual Neon database.

Unlike the rest of the integration suite (which wraps every test in a
transaction that's rolled back via ``db_session``/``client``), these tests
open a raw connection straight to ``settings.database_url`` and read real
server/catalog state. No mocking, no rollback tricks, no FastAPI app. If
these fail, the database itself (not the app code) is the problem.
"""

import asyncpg
import pytest

from app.core.config import settings

EXPECTED_TABLES = {
    "alembic_version",
    "favorite_jingles",
    "feedback",
    "generated_variants",
    "generation_requests",
    "jingles",
    "reference_audio",
    "refresh_tokens",
    "users",
}


def _asyncpg_dsn() -> str:
    return settings.database_url.replace("postgresql+asyncpg://", "postgresql://")


@pytest.fixture
async def neon_conn():
    conn = await asyncpg.connect(_asyncpg_dsn(), ssl="require")
    try:
        yield conn
    finally:
        await conn.close()


async def test_can_connect_to_neon(neon_conn):
    version = await neon_conn.fetchval("select version()")
    assert "PostgreSQL" in version


async def test_all_expected_tables_exist(neon_conn):
    rows = await neon_conn.fetch(
        "select table_name from information_schema.tables where table_schema = 'public'"
    )
    tables = {row["table_name"] for row in rows}
    missing = EXPECTED_TABLES - tables
    assert not missing, f"missing tables in Neon: {missing}"


async def test_alembic_version_matches_head():
    from alembic.config import Config
    from alembic.script import ScriptDirectory

    cfg = Config("alembic.ini")
    script = ScriptDirectory.from_config(cfg)
    local_head = script.get_current_head()

    conn = await asyncpg.connect(_asyncpg_dsn(), ssl="require")
    try:
        db_version = await conn.fetchval("select version_num from alembic_version")
    finally:
        await conn.close()

    assert db_version == local_head, (
        f"DB is on migration {db_version!r} but code expects head {local_head!r} "
        "- run `alembic upgrade head`"
    )


async def test_users_table_has_expected_columns(neon_conn):
    rows = await neon_conn.fetch(
        "select column_name from information_schema.columns where table_name = 'users'"
    )
    columns = {row["column_name"] for row in rows}
    for expected in {"id", "name", "email", "hashed_password", "role", "is_active"}:
        assert expected in columns
    # OTP columns must be gone after the OTP-removal pass.
    for removed in {"is_verified", "otp_code_hash", "otp_expires_at"}:
        assert removed not in columns


async def test_jingles_table_has_wizard_columns(neon_conn):
    rows = await neon_conn.fetch(
        "select column_name from information_schema.columns where table_name = 'jingles'"
    )
    columns = {row["column_name"] for row in rows}
    for expected in {
        "current_step",
        "status",
        "sound_description",
        "voice_enabled",
        "brand_description",
        "target_age_range",
        "mood_context",
        "platform",
    }:
        assert expected in columns
    # Old free-text step2/step3 fields must be gone after the Figma-alignment migration.
    for removed in {"target_audience", "region", "language", "industry", "duration_seconds", "music_style", "voice_type"}:
        assert removed not in columns


async def test_users_table_has_jingle_quota(neon_conn):
    rows = await neon_conn.fetch(
        "select column_name from information_schema.columns where table_name = 'users'"
    )
    columns = {row["column_name"] for row in rows}
    assert "jingle_quota" in columns


async def test_feedback_table_has_single_rating(neon_conn):
    rows = await neon_conn.fetch(
        "select column_name from information_schema.columns where table_name = 'feedback'"
    )
    columns = {row["column_name"] for row in rows}
    assert "rating" in columns
    for removed in {"energy", "tone", "brand_fit", "memorability"}:
        assert removed not in columns


async def test_reference_audio_table_shape(neon_conn):
    rows = await neon_conn.fetch(
        "select column_name from information_schema.columns where table_name = 'reference_audio'"
    )
    columns = {row["column_name"] for row in rows}
    assert columns == {
        "id",
        "jingle_id",
        "user_id",
        "original_filename",
        "storage_path",
        "content_type",
        "size_bytes",
        "created_at",
        "updated_at",
    }


async def test_foreign_keys_are_real(neon_conn):
    rows = await neon_conn.fetch(
        """
        select tc.table_name, kcu.column_name, ccu.table_name as foreign_table
        from information_schema.table_constraints tc
        join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
        join information_schema.constraint_column_usage ccu on tc.constraint_name = ccu.constraint_name
        where tc.constraint_type = 'FOREIGN KEY' and tc.table_name = 'reference_audio'
        """
    )
    fks = {(row["column_name"], row["foreign_table"]) for row in rows}
    assert ("jingle_id", "jingles") in fks
    assert ("user_id", "users") in fks
