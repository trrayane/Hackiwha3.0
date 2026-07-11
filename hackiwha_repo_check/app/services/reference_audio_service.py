import os
import uuid

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ConflictError, NotFoundError, UnsupportedMediaTypeError
from app.integrations.storage import StorageService, generate_storage_key
from app.models.reference_audio import ReferenceAudio
from app.repositories.jingle_repository import JingleRepository
from app.repositories.reference_audio_repository import ReferenceAudioRepository


class ReferenceAudioService:
    def __init__(self, session: AsyncSession, storage: StorageService) -> None:
        self.session = session
        self.storage = storage
        self.jingles = JingleRepository(session)
        self.audio_repo = ReferenceAudioRepository(session)

    async def _get_owned_jingle_or_404(self, user_id: uuid.UUID, jingle_id: uuid.UUID):
        jingle = await self.jingles.get_owned(jingle_id, user_id)
        if not jingle:
            raise NotFoundError("jingle not found")
        return jingle

    @staticmethod
    def _validate_file(file: UploadFile) -> None:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in settings.allowed_audio_extensions_list:
            allowed = ", ".join(settings.allowed_audio_extensions_list)
            raise UnsupportedMediaTypeError(
                f"unsupported audio format '{ext}', allowed formats: {allowed}"
            )

    async def upload(
        self, user_id: uuid.UUID, jingle_id: uuid.UUID, file: UploadFile
    ) -> ReferenceAudio:
        await self._get_owned_jingle_or_404(user_id, jingle_id)
        if await self.audio_repo.get_for_jingle(jingle_id):
            raise ConflictError("reference audio already exists, use replace instead")

        self._validate_file(file)
        key = generate_storage_key(jingle_id, file.filename or "audio")
        stored = await self.storage.save(file, key, settings.max_upload_size_bytes)

        audio = ReferenceAudio(
            jingle_id=jingle_id,
            user_id=user_id,
            original_filename=file.filename or "audio",
            storage_path=stored.storage_path,
            content_type=file.content_type or "application/octet-stream",
            size_bytes=stored.size_bytes,
        )
        return await self.audio_repo.add(audio)

    async def replace(
        self, user_id: uuid.UUID, jingle_id: uuid.UUID, file: UploadFile
    ) -> ReferenceAudio:
        await self._get_owned_jingle_or_404(user_id, jingle_id)
        existing = await self.audio_repo.get_for_jingle(jingle_id)
        if not existing:
            raise NotFoundError("no reference audio uploaded yet, use upload instead")

        self._validate_file(file)
        old_storage_path = existing.storage_path
        key = generate_storage_key(jingle_id, file.filename or "audio")
        stored = await self.storage.save(file, key, settings.max_upload_size_bytes)

        existing.original_filename = file.filename or "audio"
        existing.storage_path = stored.storage_path
        existing.content_type = file.content_type or "application/octet-stream"
        existing.size_bytes = stored.size_bytes
        await self.session.commit()
        await self.session.refresh(existing)

        await self.storage.delete(old_storage_path)
        return existing

    async def delete(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> None:
        await self._get_owned_jingle_or_404(user_id, jingle_id)
        existing = await self.audio_repo.get_for_jingle(jingle_id)
        if not existing:
            raise NotFoundError("no reference audio uploaded yet")

        storage_path = existing.storage_path
        await self.audio_repo.delete(existing)
        await self.storage.delete(storage_path)

    async def get(self, user_id: uuid.UUID, jingle_id: uuid.UUID) -> ReferenceAudio:
        await self._get_owned_jingle_or_404(user_id, jingle_id)
        existing = await self.audio_repo.get_for_jingle(jingle_id)
        if not existing:
            raise NotFoundError("no reference audio uploaded yet")
        return existing
