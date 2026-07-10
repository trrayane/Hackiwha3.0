import os
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass

from fastapi import UploadFile

from app.core.exceptions import PayloadTooLargeError

_CHUNK_SIZE = 1024 * 1024  # 1 MB


@dataclass
class StoredFile:
    storage_path: str
    size_bytes: int


class StorageService(ABC):
    """Abstraction over where uploaded files live, so local disk can later be
    swapped for S3, Cloudinary, Supabase Storage, etc. without touching any
    business logic in the services that call it.
    """

    @abstractmethod
    async def save(self, file: UploadFile, key: str, max_size_bytes: int) -> StoredFile:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, storage_path: str) -> None:
        raise NotImplementedError

    @abstractmethod
    def get_url(self, storage_path: str) -> str:
        raise NotImplementedError


class LocalStorageService(StorageService):
    """Stores files on local disk under `base_dir`.

    Good enough for local dev and small deployments. Swap for a cloud-backed
    StorageService (S3, Cloudinary, Supabase, ...) in production by
    implementing the same interface and changing the DI wiring in
    app/dependencies/services.py::get_storage_service().
    """

    def __init__(self, base_dir: str, public_base_url: str) -> None:
        self.base_dir = base_dir
        self.public_base_url = public_base_url.rstrip("/")
        os.makedirs(self.base_dir, exist_ok=True)

    async def save(self, file: UploadFile, key: str, max_size_bytes: int) -> StoredFile:
        full_path = os.path.join(self.base_dir, key)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        size = 0
        try:
            with open(full_path, "wb") as out_file:
                while chunk := await file.read(_CHUNK_SIZE):
                    size += len(chunk)
                    if size > max_size_bytes:
                        raise PayloadTooLargeError(
                            f"file exceeds maximum allowed size of {max_size_bytes} bytes"
                        )
                    out_file.write(chunk)
        except PayloadTooLargeError:
            if os.path.exists(full_path):
                os.remove(full_path)
            raise

        return StoredFile(storage_path=key, size_bytes=size)

    async def delete(self, storage_path: str) -> None:
        full_path = os.path.join(self.base_dir, storage_path)
        if os.path.exists(full_path):
            os.remove(full_path)

    def get_url(self, storage_path: str) -> str:
        return f"{self.public_base_url}/media/{storage_path}"


def generate_storage_key(jingle_id: uuid.UUID, original_filename: str) -> str:
    ext = os.path.splitext(original_filename)[1].lower()
    return f"{jingle_id}/{uuid.uuid4().hex}{ext}"
