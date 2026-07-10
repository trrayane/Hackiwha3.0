import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, ConflictError, NotFoundError
from app.integrations.ai_provider import AIProviderService, JingleGenerationInput
from app.integrations.storage import StorageService
from app.models.enums import GenerationStatus, JingleStatus
from app.models.generated_variant import GeneratedVariant
from app.models.generation_request import GenerationRequest
from app.models.jingle import Jingle
from app.repositories.generated_variant_repository import GeneratedVariantRepository
from app.repositories.generation_request_repository import GenerationRequestRepository
from app.repositories.jingle_repository import JingleRepository

_REQUIRED_FIELDS = (
    "brand_name",
    "brand_tone",
    "target_age_range",
    "mood_context",
    "platform",
)
_CANCELLABLE_STATUSES = (GenerationStatus.PENDING, GenerationStatus.PROCESSING)


class GenerationService:
    def __init__(
        self, session: AsyncSession, ai_provider: AIProviderService, storage: StorageService
    ) -> None:
        self.session = session
        self.ai_provider = ai_provider
        self.storage = storage
        self.jingles = JingleRepository(session)
        self.requests = GenerationRequestRepository(session)
        self.variants = GeneratedVariantRepository(session)

    async def _get_owned_jingle_or_404(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> Jingle:
        jingle = await self.jingles.get_owned(jingle_id, user_id)
        if not jingle:
            raise NotFoundError("jingle not found")
        return jingle

    def _validate_complete(self, jingle: Jingle) -> None:
        missing = [field for field in _REQUIRED_FIELDS if getattr(jingle, field) in (None, "")]
        if missing:
            raise BadRequestError(f"missing required fields before generation: {', '.join(missing)}")

    async def generate(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> GenerationRequest:
        jingle = await self._get_owned_jingle_or_404(user_id, jingle_id)
        self._validate_complete(jingle)

        request = GenerationRequest(
            jingle_id=jingle.id,
            status=GenerationStatus.PROCESSING,
            progress_percent=0,
            stage_message="Analyzing brand tone...",
            started_at=datetime.now(timezone.utc),
        )
        request = await self.requests.add(request)

        reference_audio_url = None
        if jingle.reference_audio is not None:
            reference_audio_url = self.storage.get_url(jingle.reference_audio.storage_path)

        payload = JingleGenerationInput(
            brand_name=jingle.brand_name,
            brand_tone=jingle.brand_tone,
            brand_description=jingle.brand_description,
            target_age_range=jingle.target_age_range,
            mood_context=jingle.mood_context,
            platform=jingle.platform,
            sound_description=jingle.sound_description,
            voice_enabled=jingle.voice_enabled,
            reference_audio_url=reference_audio_url,
        )

        try:
            result = await self.ai_provider.generate_jingle(payload)
        except Exception as exc:  # provider failure must not crash the request
            request.status = GenerationStatus.FAILED
            request.error_message = str(exc)
            request.stage_message = None
            request.completed_at = datetime.now(timezone.utc)
            request.provider = getattr(self.ai_provider, "provider_name", None)
            await self.session.commit()
            return await self.requests.get_with_variants(request.id)

        variant = GeneratedVariant(
            generation_request_id=request.id,
            audio_url=result.audio_url,
            lyrics=result.lyrics,
            duration_seconds=result.duration_seconds,
            provider=result.provider,
            generation_time_ms=result.generation_time_ms,
            status=GenerationStatus.COMPLETED,
        )
        self.session.add(variant)

        request.status = GenerationStatus.COMPLETED
        request.provider = result.provider
        request.progress_percent = 100
        request.stage_message = "Completed"
        request.completed_at = datetime.now(timezone.utc)

        jingle.status = JingleStatus.IN_REVIEW
        await self.session.commit()
        return await self.requests.get_with_variants(request.id)

    async def cancel(
        self, user_id: uuid.UUID, jingle_id: uuid.UUID, request_id: uuid.UUID
    ) -> GenerationRequest:
        await self._get_owned_jingle_or_404(user_id, jingle_id)
        request = await self.requests.get_with_variants(request_id)
        if not request or request.jingle_id != jingle_id:
            raise NotFoundError("generation request not found")
        if request.status not in _CANCELLABLE_STATUSES:
            raise ConflictError("generation request is no longer cancellable")

        request.status = GenerationStatus.CANCELLED
        request.stage_message = None
        request.completed_at = datetime.now(timezone.utc)
        await self.session.commit()
        return await self.requests.get_with_variants(request_id)

    async def get(
        self, user_id: uuid.UUID, jingle_id: uuid.UUID, request_id: uuid.UUID
    ) -> GenerationRequest:
        await self._get_owned_jingle_or_404(user_id, jingle_id)
        request = await self.requests.get_with_variants(request_id)
        if not request or request.jingle_id != jingle_id:
            raise NotFoundError("generation request not found")
        return request

    async def list_for_jingle(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> list[GenerationRequest]:
        await self._get_owned_jingle_or_404(user_id, jingle_id)
        return await self.requests.list_for_jingle(jingle_id)

    async def list_for_user(self, user_id: uuid.UUID, limit: int = 20) -> list[GenerationRequest]:
        return await self.requests.list_for_user(user_id, limit=limit)
