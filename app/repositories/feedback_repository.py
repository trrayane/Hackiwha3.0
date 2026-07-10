import uuid

from sqlalchemy import func, select

from app.models.feedback import Feedback
from app.models.generated_variant import GeneratedVariant
from app.models.generation_request import GenerationRequest
from app.repositories.base import BaseRepository


class FeedbackRepository(BaseRepository[Feedback]):
    model = Feedback

    async def list_for_variant(self, variant_id: uuid.UUID) -> list[Feedback]:
        result = await self.session.execute(
            select(Feedback)
            .where(Feedback.variant_id == variant_id)
            .order_by(Feedback.created_at.desc())
        )
        return list(result.scalars().all())

    async def avg_rating_for_jingle(self, jingle_id: uuid.UUID) -> float | None:
        result = await self.session.execute(
            select(func.avg(Feedback.rating))
            .select_from(Feedback)
            .join(GeneratedVariant, GeneratedVariant.id == Feedback.variant_id)
            .join(GenerationRequest, GenerationRequest.id == GeneratedVariant.generation_request_id)
            .where(
                GenerationRequest.jingle_id == jingle_id,
                GeneratedVariant.deleted_at.is_(None),
            )
        )
        avg = result.scalar_one()
        return round(float(avg), 2) if avg is not None else None

    async def avg_ratings_for_jingles(
        self, jingle_ids: list[uuid.UUID]
    ) -> dict[uuid.UUID, float]:
        """Average feedback rating per jingle, resolved in a single query.

        Used by list endpoints to avoid an N+1 (one AVG query per row)."""
        if not jingle_ids:
            return {}
        result = await self.session.execute(
            select(GenerationRequest.jingle_id, func.avg(Feedback.rating))
            .select_from(Feedback)
            .join(GeneratedVariant, GeneratedVariant.id == Feedback.variant_id)
            .join(GenerationRequest, GenerationRequest.id == GeneratedVariant.generation_request_id)
            .where(
                GenerationRequest.jingle_id.in_(jingle_ids),
                GeneratedVariant.deleted_at.is_(None),
            )
            .group_by(GenerationRequest.jingle_id)
        )
        return {jingle_id: round(float(avg), 2) for jingle_id, avg in result.all()}
