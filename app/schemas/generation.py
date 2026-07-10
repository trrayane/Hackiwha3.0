import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import GenerationStatus


class GeneratedVariantOut(BaseModel):
    id: uuid.UUID
    audio_url: str | None
    lyrics: str | None
    duration_seconds: int | None
    provider: str
    generation_time_ms: int | None
    status: GenerationStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerationRequestOut(BaseModel):
    id: uuid.UUID
    jingle_id: uuid.UUID
    status: GenerationStatus
    provider: str | None
    error_message: str | None
    progress_percent: int
    stage_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    variants: list[GeneratedVariantOut] = []

    model_config = ConfigDict(from_attributes=True)
