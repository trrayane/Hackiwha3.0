import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.models.enums import GenerationStatus
from app.models.generation_request import GenerationRequest
from app.models.jingle import Jingle
from app.repositories.base import BaseRepository


class GenerationRequestRepository(BaseRepository[GenerationRequest]):
    model = GenerationRequest

    async def get_with_variants(self, request_id: uuid.UUID) -> GenerationRequest | None:
        result = await self.session.execute(
            select(GenerationRequest)
            .options(selectinload(GenerationRequest.variants))
            .where(GenerationRequest.id == request_id)
        )
        return result.scalar_one_or_none()

    async def list_for_jingle(self, jingle_id: uuid.UUID) -> list[GenerationRequest]:
        result = await self.session.execute(
            select(GenerationRequest)
            .options(selectinload(GenerationRequest.variants))
            .where(GenerationRequest.jingle_id == jingle_id)
            .order_by(GenerationRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_for_user(self, user_id: uuid.UUID, limit: int = 20) -> list[GenerationRequest]:
        result = await self.session.execute(
            select(GenerationRequest)
            .join(Jingle, Jingle.id == GenerationRequest.jingle_id)
            .options(selectinload(GenerationRequest.variants), selectinload(GenerationRequest.jingle))
            .where(Jingle.user_id == user_id, Jingle.deleted_at.is_(None))
            .order_by(GenerationRequest.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_by_status(self, user_id: uuid.UUID, status_: GenerationStatus) -> int:
        result = await self.session.execute(
            select(func.count())
            .select_from(GenerationRequest)
            .join(Jingle, Jingle.id == GenerationRequest.jingle_id)
            .where(
                Jingle.user_id == user_id,
                Jingle.deleted_at.is_(None),
                GenerationRequest.status == status_,
            )
        )
        return result.scalar_one()

    async def top_platforms(self, user_id: uuid.UUID, limit: int = 5) -> list[tuple[str, int]]:
        result = await self.session.execute(
            select(Jingle.platform, func.count().label("cnt"))
            .join(GenerationRequest, GenerationRequest.jingle_id == Jingle.id)
            .where(Jingle.user_id == user_id, Jingle.deleted_at.is_(None), Jingle.platform.is_not(None))
            .group_by(Jingle.platform)
            .order_by(func.count().desc())
            .limit(limit)
        )
        return [(row[0], row[1]) for row in result.all()]
