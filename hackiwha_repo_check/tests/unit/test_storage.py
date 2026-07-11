import io
import uuid

import pytest
from fastapi import UploadFile

from app.core.exceptions import PayloadTooLargeError
from app.integrations.storage import LocalStorageService, generate_storage_key


def _upload_file(content: bytes, filename: str = "sample.mp3") -> UploadFile:
    return UploadFile(filename=filename, file=io.BytesIO(content))


async def test_save_writes_file_and_returns_size(tmp_path):
    storage = LocalStorageService(base_dir=str(tmp_path), public_base_url="http://test")
    file = _upload_file(b"hello world")

    stored = await storage.save(file, "some/key.mp3", max_size_bytes=1024)

    assert stored.size_bytes == len(b"hello world")
    assert (tmp_path / "some" / "key.mp3").read_bytes() == b"hello world"


async def test_save_enforces_max_size_and_cleans_up_partial_file(tmp_path):
    storage = LocalStorageService(base_dir=str(tmp_path), public_base_url="http://test")
    file = _upload_file(b"x" * 2000)

    with pytest.raises(PayloadTooLargeError):
        await storage.save(file, "big/key.mp3", max_size_bytes=1000)

    assert not (tmp_path / "big" / "key.mp3").exists()


async def test_delete_removes_existing_file(tmp_path):
    storage = LocalStorageService(base_dir=str(tmp_path), public_base_url="http://test")
    file = _upload_file(b"data")
    stored = await storage.save(file, "to-delete.mp3", max_size_bytes=1024)

    await storage.delete(stored.storage_path)

    assert not (tmp_path / "to-delete.mp3").exists()


async def test_delete_missing_file_does_not_raise(tmp_path):
    storage = LocalStorageService(base_dir=str(tmp_path), public_base_url="http://test")
    await storage.delete("never-existed.mp3")


def test_get_url_builds_expected_url(tmp_path):
    storage = LocalStorageService(base_dir=str(tmp_path), public_base_url="http://test.local/")
    assert storage.get_url("abc/key.mp3") == "http://test.local/media/abc/key.mp3"


def test_generate_storage_key_preserves_extension():
    jingle_id = uuid.uuid4()
    key = generate_storage_key(jingle_id, "My Song.WAV")
    assert key.startswith(f"{jingle_id}/")
    assert key.endswith(".wav")


def test_generate_storage_key_is_unique():
    jingle_id = uuid.uuid4()
    assert generate_storage_key(jingle_id, "a.mp3") != generate_storage_key(jingle_id, "a.mp3")
