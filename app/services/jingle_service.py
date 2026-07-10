import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.enums import JingleStatus, Platform, TargetAgeRange
from app.models.favorite_jingle import FavoriteJingle
from app.models.jingle import Jingle
from app.repositories.favorite_jingle_repository import FavoriteJingleRepository
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.jingle_repository import JingleRepository
from app.repositories.user_repository import UserRepository


class JingleService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.jingles = JingleRepository(session)
        self.favorites = FavoriteJingleRepository(session)
        self.feedback = FeedbackRepository(session)
        self.users = UserRepository(session)

    async def _get_owned_or_404(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> Jingle:
        jingle = await self.jingles.get_owned(jingle_id, user_id)
        if not jingle:
            raise NotFoundError("jingle not found")
        return jingle

    @staticmethod
    def _bump_step(jingle: Jingle, step: int) -> None:
        jingle.current_step = max(jingle.current_step, step)

    async def _with_feedback_score(self, jingle: Jingle) -> Jingle:
        jingle.feedback_score = await self.feedback.avg_rating_for_jingle(jingle.id)
        return jingle

    async def create_draft(
        self, user_id: uuid.UUID, brand_name: str, brand_tone: str, brand_description: str | None
    ) -> Jingle:
        user = await self.users.get_by_id(user_id)
        used = await self.jingles.count_for_user(user_id)
        if user and used >= user.jingle_quota:
            raise ConflictError(
                f"jingle quota reached ({used}/{user.jingle_quota}) - upgrade your plan for more"
            )

        jingle = Jingle(
            user_id=user_id,
            brand_name=brand_name,
            brand_tone=brand_tone,
            brand_description=brand_description,
            current_step=1,
        )
        jingle = await self.jingles.add(jingle)
        jingle = await self._get_owned_or_404(user_id, jingle.id)
        return await self._with_feedback_score(jingle)

    async def update_audience(
        self,
        user_id: uuid.UUID,
        jingle_id: uuid.UUID,
        target_age_range: TargetAgeRange | None,
        mood_context: str | None,
    ) -> Jingle:
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        jingle.target_age_range = target_age_range
        jingle.mood_context = mood_context
        self._bump_step(jingle, 2)
        await self.session.commit()
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        return await self._with_feedback_score(jingle)

    async def update_platform(
        self,
        user_id: uuid.UUID,
        jingle_id: uuid.UUID,
        platform: Platform | None,
    ) -> Jingle:
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        jingle.platform = platform
        self._bump_step(jingle, 3)
        await self.session.commit()
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        return await self._with_feedback_score(jingle)

    async def update_creative_direction(
        self,
        user_id: uuid.UUID,
        jingle_id: uuid.UUID,
        sound_description: str | None,
        voice_enabled: bool,
    ) -> Jingle:
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        jingle.sound_description = sound_description
        jingle.voice_enabled = voice_enabled
        self._bump_step(jingle, 4)
        await self.session.commit()
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        return await self._with_feedback_score(jingle)

    async def approve(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> Jingle:
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        if jingle.status != JingleStatus.IN_REVIEW:
            raise ConflictError("only jingles in review can be approved")
        jingle.status = JingleStatus.APPROVED
        await self.session.commit()
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        return await self._with_feedback_score(jingle)

    async def get(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> Jingle:
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        return await self._with_feedback_score(jingle)

    async def list(
        self,
        user_id: uuid.UUID,
        *,
        search: str | None,
        platform: Platform | None,
        is_archived: bool | None,
        status: JingleStatus | None,
        favorites_only: bool,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        min_feedback_score: float | None = None,
        sort_by: str,
        sort_dir: str,
        page: int,
        page_size: int,
    ) -> tuple[list[Jingle], int]:
        items, total = await self.jingles.list_for_user(
            user_id,
            search=search,
            platform=platform,
            is_archived=is_archived,
            status=status,
            favorites_only=favorites_only,
            date_from=date_from,
            date_to=date_to,
            min_feedback_score=min_feedback_score,
            sort_by=sort_by,
            sort_dir=sort_dir,
            page=page,
            page_size=page_size,
        )
        # Single batched query for all rows' feedback scores (avoids an N+1).
        scores = await self.feedback.avg_ratings_for_jingles([item.id for item in items])
        for item in items:
            item.feedback_score = scores.get(item.id)
        return items, total

    async def update(self, user_id: uuid.UUID, jingle_id: uuid.UUID, **fields) -> Jingle:
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        for key, value in fields.items():
            if value is not None:
                setattr(jingle, key, value)
        await self.session.commit()
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        return await self._with_feedback_score(jingle)

    async def delete(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> None:
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        jingle.deleted_at = datetime.now(timezone.utc)
        await self.session.commit()

    async def duplicate(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> Jingle:
        original = await self._get_owned_or_404(user_id, jingle_id)
        copy = Jingle(
            user_id=user_id,
            brand_name=f"{original.brand_name} (copy)",
            brand_tone=original.brand_tone,
            brand_description=original.brand_description,
            target_age_range=original.target_age_range,
            mood_context=original.mood_context,
            platform=original.platform,
            sound_description=original.sound_description,
            voice_enabled=original.voice_enabled,
            current_step=original.current_step,
            status=JingleStatus.DRAFT,
        )
        copy = await self.jingles.add(copy)
        jingle = await self._get_owned_or_404(user_id, copy.id)
        return await self._with_feedback_score(jingle)

    async def toggle_favorite(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> bool:
        await self._get_owned_or_404(user_id, jingle_id)
        existing = await self.favorites.get(user_id, jingle_id)
        if existing:
            await self.favorites.delete(existing)
            return False

        await self.favorites.add(FavoriteJingle(user_id=user_id, jingle_id=jingle_id))
        return True

    async def toggle_archive(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> bool:
        jingle = await self._get_owned_or_404(user_id, jingle_id)
        jingle.is_archived = not jingle.is_archived
        await self.session.commit()
        await self.session.refresh(jingle)
        return jingle.is_archived
