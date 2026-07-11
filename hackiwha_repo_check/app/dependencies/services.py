from functools import lru_cache

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.session import get_db
from app.integrations.ai_provider import AIProviderService, NotImplementedAIProviderService
from app.integrations.storage import LocalStorageService, StorageService
from app.services.auth_service import AuthService
from app.services.dashboard_service import DashboardService
from app.services.feedback_service import FeedbackService
from app.services.generation_service import GenerationService
from app.services.jingle_service import JingleService
from app.services.reference_audio_service import ReferenceAudioService


@lru_cache
def get_ai_provider() -> AIProviderService:
    # Real provider: Gemini (lyrics + TTS) + MusicGen (instrumental), see
    # app/integrations/ai/. Requires GEMINI_API_KEY — falls back to the
    # not-configured stub if it's missing so the app still boots cleanly
    # (generation requests just fail with a clear FAILED status instead).
    if not settings.gemini_api_key:
        return NotImplementedAIProviderService()

    from app.integrations.ai.provider import GeminiMusicGenProvider

    return GeminiMusicGenProvider(get_storage_service(), settings.upload_dir)


@lru_cache
def get_storage_service() -> StorageService:
    # Swap LocalStorageService for a cloud-backed StorageService (S3,
    # Cloudinary, Supabase Storage, ...) here once needed. Everything
    # downstream only depends on the StorageService interface.
    return LocalStorageService(base_dir=settings.upload_dir, public_base_url=settings.public_base_url)


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


def get_jingle_service(db: AsyncSession = Depends(get_db)) -> JingleService:
    return JingleService(db)


def get_generation_service(
    db: AsyncSession = Depends(get_db),
    ai_provider: AIProviderService = Depends(get_ai_provider),
    storage: StorageService = Depends(get_storage_service),
) -> GenerationService:
    return GenerationService(db, ai_provider, storage)


def get_reference_audio_service(
    db: AsyncSession = Depends(get_db),
    storage: StorageService = Depends(get_storage_service),
) -> ReferenceAudioService:
    return ReferenceAudioService(db, storage)


def get_feedback_service(db: AsyncSession = Depends(get_db)) -> FeedbackService:
    return FeedbackService(db)


def get_dashboard_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    return DashboardService(db)
