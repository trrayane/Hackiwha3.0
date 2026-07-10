import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.models.enums import JingleStatus
from app.models.favorite_jingle import FavoriteJingle
from app.models.feedback import Feedback
from app.models.generated_variant import GeneratedVariant
from app.models.generation_request import GenerationRequest
from app.models.jingle import Jingle
from app.repositories.base import BaseRepository

_SORTABLE_FIELDS = {
    "created_at": Jingle.created_at,
    "updated_at": Jingle.updated_at,
    "brand_name": Jingle.brand_name,
}


class JingleRepository(BaseRepository[Jingle]):
    model = Jingle

    async def get_owned(self, jingle_id: uuid.UUID, user_id: uuid.UUID) -> Jingle | None:
        result = await self.session.execute(
            select(Jingle)
            .options(
                selectinload(Jingle.generation_requests), selectinload(Jingle.reference_audio)
            )
            .where(Jingle.id == jingle_id, Jingle.user_id == user_id, Jingle.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        search: str | None = None,
        platform: str | None = None,
        is_archived: bool | None = None,
        status: JingleStatus | None = None,
        favorites_only: bool = False,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        min_feedback_score: float | None = None,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Jingle], int]:
        query = select(Jingle).options(selectinload(Jingle.reference_audio)).where(
            Jingle.user_id == user_id, Jingle.deleted_at.is_(None)
        )

        if favorites_only:
            query = query.join(FavoriteJingle, FavoriteJingle.jingle_id == Jingle.id).where(
                FavoriteJingle.user_id == user_id
            )
        if search:
            query = query.where(Jingle.brand_name.ilike(f"%{search}%"))
        if platform:
            query = query.where(Jingle.platform == platform)
        if is_archived is not None:
            query = query.where(Jingle.is_archived == is_archived)
        if status is not None:
            query = query.where(Jingle.status == status)
        if date_from is not None:
            query = query.where(Jingle.created_at >= date_from)
        if date_to is not None:
            query = query.where(Jingle.created_at <= date_to)
        if min_feedback_score is not None:
            query = query.where(
                Jingle.id.in_(
                    select(GenerationRequest.jingle_id)
                    .join(GeneratedVariant, GeneratedVariant.generation_request_id == GenerationRequest.id)
                    .join(Feedback, Feedback.variant_id == GeneratedVariant.id)
                    .where(GeneratedVariant.deleted_at.is_(None))
                    .group_by(GenerationRequest.jingle_id)
                    .having(func.avg(Feedback.rating) >= min_feedback_score)
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar_one()

        sort_column = _SORTABLE_FIELDS.get(sort_by, Jingle.created_at)
        query = query.order_by(sort_column.desc() if sort_dir == "desc" else sort_column.asc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.session.execute(query)
        return list(result.scalars().all()), total

    async def count_for_user(self, user_id: uuid.UUID) -> int:
        result = await self.session.execute(
            select(func.count())
            .select_from(Jingle)
            .where(Jingle.user_id == user_id, Jingle.deleted_at.is_(None))
        )
        return result.scalar_one()

    async def count_by_status(self, user_id: uuid.UUID, status: JingleStatus) -> int:
        result = await self.session.execute(
            select(func.count())
            .select_from(Jingle)
            .where(Jingle.user_id == user_id, Jingle.deleted_at.is_(None), Jingle.status == status)
        )
        return result.scalar_one()
