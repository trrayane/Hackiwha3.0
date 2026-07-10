import logging
import os

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.database.session import AsyncSessionLocal
from app.middleware.exception_handlers import register_exception_handlers

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

DESCRIPTION = """
Backend for **Jingle Engine** — an AI-powered contextual jingle generation platform.

This service manages users, jingle projects (a 4-step creation wizard), reference-audio
uploads, generation requests and their history/feedback. It does **not** generate audio
itself: it calls an `AIProviderService` interface that a separate team implements later
(ElevenLabs, Suno, OpenAI, ...). Storage is likewise behind a swappable `StorageService`.

**Auth:** JWT access + rotating refresh tokens (Argon2 password hashing).
"""

OPENAPI_TAGS = [
    {"name": "auth", "description": "Registration, login, token refresh/rotation, password reset."},
    {"name": "jingles", "description": "4-step creation wizard, CRUD, reference-audio upload, generation, favorites/archive."},
    {"name": "feedback", "description": "Rate generated variants (1-5) and leave comments."},
    {"name": "history", "description": "Generation history, recent activity, favorites and archived jingles."},
    {"name": "dashboard", "description": "Aggregated stats: counts by status, quota usage, top platforms."},
    {"name": "health", "description": "Liveness and readiness probes."},
]

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=DESCRIPTION,
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(api_v1_router)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.upload_dir), name="media")


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    """Liveness probe — the process is up. Does not touch the database."""
    return {"status": "ok"}


@app.get("/health/ready", tags=["health"])
async def readiness() -> JSONResponse:
    """Readiness probe — verifies the database is reachable."""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return JSONResponse(content={"status": "ready", "database": "ok"})
    except Exception:
        logging.getLogger(__name__).exception("readiness check failed")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not ready", "database": "unreachable"},
        )
