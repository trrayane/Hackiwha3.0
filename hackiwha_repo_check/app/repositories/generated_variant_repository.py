import uuid

from sqlalchemy import select

from app.models.generated_variant import GeneratedVariant
from app.repositories.base import BaseRepository


class GeneratedVariantRepository(BaseRepository[GeneratedVariant]):
    model = GeneratedVariant

    async def list_for_request(self, generation_request_id: uuid.UUID) -> list[GeneratedVariant]:
        result = await self.session.execute(
            select(GeneratedVariant)
            .where(
                GeneratedVariant.generation_request_id == generation_request_id,
                GeneratedVariant.deleted_at.is_(None),
            )
            .order_by(GeneratedVariant.created_at.desc())
        )
        return list(result.scalars().all())
