from app.integrations.storage import StorageService
from app.models.jingle import Jingle
from app.models.reference_audio import ReferenceAudio
from app.schemas.jingle import JingleOut
from app.schemas.reference_audio import ReferenceAudioOut


def to_reference_audio_out(audio: ReferenceAudio, storage: StorageService) -> ReferenceAudioOut:
    return ReferenceAudioOut(
        id=audio.id,
        jingle_id=audio.jingle_id,
        original_filename=audio.original_filename,
        content_type=audio.content_type,
        size_bytes=audio.size_bytes,
        url=storage.get_url(audio.storage_path),
        created_at=audio.created_at,
        updated_at=audio.updated_at,
    )


def to_jingle_out(jingle: Jingle, storage: StorageService) -> JingleOut:
    reference_audio = None
    if jingle.reference_audio is not None:
        reference_audio = to_reference_audio_out(jingle.reference_audio, storage)

    return JingleOut(
        id=jingle.id,
        user_id=jingle.user_id,
        current_step=jingle.current_step,
        status=jingle.status,
        brand_name=jingle.brand_name,
        brand_tone=jingle.brand_tone,
        brand_description=jingle.brand_description,
        target_age_range=jingle.target_age_range,
        mood_context=jingle.mood_context,
        platform=jingle.platform,
        sound_description=jingle.sound_description,
        voice_enabled=jingle.voice_enabled,
        is_archived=jingle.is_archived,
        feedback_score=getattr(jingle, "feedback_score", None),
        reference_audio=reference_audio,
        created_at=jingle.created_at,
        updated_at=jingle.updated_at,
    )
