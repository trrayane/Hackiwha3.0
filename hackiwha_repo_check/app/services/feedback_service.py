import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.feedback import Feedback
from app.models.generated_variant import GeneratedVariant
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.generated_variant_repository import GeneratedVariantRepository
from app.repositories.generation_request_repository import GenerationRequestRepository
from app.repositories.jingle_repository import JingleRepository


class FeedbackService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.feedback = FeedbackRepository(session)
        self.variants = GeneratedVariantRepository(session)
        self.requests = GenerationRequestRepository(session)
        self.jingles = JingleRepository(session)

    async def _get_owned_variant_or_404(
        self, user_id: uuid.UUID, jingle_id: uuid.UUID, variant_id: uuid.UUID
    ) -> GeneratedVariant:
        jingle = await self.jingles.get_owned(jingle_id, user_id)
        if not jingle:
            raise NotFoundError("jingle not found")

        variant = await self.variants.get_by_id(variant_id)
        if not variant:
            raise NotFoundError("variant not found")

        request = await self.requests.get_by_id(variant.generation_request_id)
        if not request or request.jingle_id != jingle.id:
            raise NotFoundError("variant not found")

        return variant

    async def create(
        self,
        user_id: uuid.UUID,
        jingle_id: uuid.UUID,
        variant_id: uuid.UUID,
        rating: int,
        comment: str | None,
    ) -> Feedback:
        variant = await self._get_owned_variant_or_404(user_id, jingle_id, variant_id)
        feedback = Feedback(
            user_id=user_id,
            variant_id=variant.id,
            rating=rating,
            comment=comment,
        )
        return await self.feedback.add(feedback)

    async def list_for_variant(
        self, user_id: uuid.UUID, jingle_id: uuid.UUID, variant_id: uuid.UUID
    ) -> list[Feedback]:
        variant = await self._get_owned_variant_or_404(user_id, jingle_id, variant_id)
        return await self.feedback.list_for_variant(variant.id)
