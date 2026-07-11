import uuid

from sqlalchemy import select

from app.models.favorite_jingle import FavoriteJingle
from app.repositories.base import BaseRepository


class FavoriteJingleRepository(BaseRepository[FavoriteJingle]):
    model = FavoriteJingle

    async def get(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> FavoriteJingle | None:
        result = await self.session.execute(
            select(FavoriteJingle).where(
                FavoriteJingle.user_id == user_id, FavoriteJingle.jingle_id == jingle_id
            )
        )
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: uuid.UUID) -> list[FavoriteJingle]:
        result = await self.session.execute(
            select(FavoriteJingle)
            .where(FavoriteJingle.user_id == user_id)
            .order_by(FavoriteJingle.created_at.desc())
        )
        return list(result.scalars().all())
