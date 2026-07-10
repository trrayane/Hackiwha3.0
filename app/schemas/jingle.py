import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import JingleStatus, Platform, TargetAgeRange
from app.schemas.reference_audio import ReferenceAudioOut


class JingleCreate(BaseModel):
    brand_name: str = Field(min_length=1, max_length=150)
    brand_tone: str = Field(min_length=1, max_length=50)
    brand_description: str | None = Field(default=None, max_length=500)


class JingleAudienceUpdate(BaseModel):
    target_age_range: TargetAgeRange | None = None
    mood_context: str | None = Field(default=None, max_length=150)


class JinglePlatformUpdate(BaseModel):
    platform: Platform | None = None


class JingleCreativeDirectionUpdate(BaseModel):
    sound_description: str | None = Field(default=None, max_length=1000)
    voice_enabled: bool = True


class JingleUpdate(BaseModel):
    brand_name: str | None = Field(default=None, min_length=1, max_length=150)
    brand_tone: str | None = Field(default=None, min_length=1, max_length=50)
    brand_description: str | None = Field(default=None, max_length=500)
    target_age_range: TargetAgeRange | None = None
    mood_context: str | None = Field(default=None, max_length=150)
    platform: Platform | None = None
    sound_description: str | None = Field(default=None, max_length=1000)
    voice_enabled: bool | None = None


class JingleOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    current_step: int
    status: JingleStatus
    brand_name: str
    brand_tone: str
    brand_description: str | None
    target_age_range: TargetAgeRange | None
    mood_context: str | None
    platform: Platform | None
    sound_description: str | None
    voice_enabled: bool
    is_archived: bool
    feedback_score: float | None = None
    reference_audio: ReferenceAudioOut | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FavoriteToggleOut(BaseModel):
    jingle_id: uuid.UUID
    is_favorite: bool


class ArchiveToggleOut(BaseModel):
    jingle_id: uuid.UUID
    is_archived: bool
