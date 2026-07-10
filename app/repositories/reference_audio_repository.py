import uuid

from sqlalchemy import select

from app.models.reference_audio import ReferenceAudio
from app.repositories.base import BaseRepository


class ReferenceAudioRepository(BaseRepository[ReferenceAudio]):
    model = ReferenceAudio

    async def get_for_jingle(self, jingle_id: uuid.UUID) -> ReferenceAudio | None:
        result = await self.session.execute(
            select(ReferenceAudio).where(ReferenceAudio.jingle_id == jingle_id)
        )
        return result.scalar_one_or_none()
