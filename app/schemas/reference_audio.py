import uuid
from datetime import datetime

from pydantic import BaseModel


class ReferenceAudioOut(BaseModel):
    id: uuid.UUID
    jingle_id: uuid.UUID
    original_filename: str
    content_type: str
    size_bytes: int
    url: str
    created_at: datetime
    updated_at: datetime
