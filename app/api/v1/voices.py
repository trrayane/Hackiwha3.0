import os

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
from app.dependencies.auth import get_current_user
from app.dependencies.services import get_storage_service
from app.integrations.ai.voice_engine import AVAILABLE_VOICES, VOICE_GENDER_MAP, generate_voice
from app.integrations.storage import StorageService
from app.models.user import User

router = APIRouter(prefix="/voices", tags=["voices"])

_PREVIEW_PHRASES = {
    "fr": "Bonjour, voici un aperçu de cette voix.",
    "en": "Hello, this is a preview of this voice.",
    "ar-darija": "أهلا، هادي نظرة على هاد الصوت.",
}

_previews_dir = os.path.join(settings.upload_dir, "voice_previews")
os.makedirs(_previews_dir, exist_ok=True)


@router.get("/{voice_name}/preview")
async def get_voice_preview(
    voice_name: str,
    language: str = "fr",
    current_user: User = Depends(get_current_user),
    storage: StorageService = Depends(get_storage_service),
) -> dict:
    if voice_name not in AVAILABLE_VOICES:
        raise HTTPException(status_code=404, detail="unknown voice")
    if language not in _PREVIEW_PHRASES:
        raise HTTPException(status_code=400, detail="unsupported language")

    storage_key = f"voice_previews/{voice_name}_{language}.wav"
    full_path = os.path.join(settings.upload_dir, storage_key)

    if not os.path.exists(full_path):
        gender = VOICE_GENDER_MAP[voice_name]
        try:
            generate_voice(
                lyrics=_PREVIEW_PHRASES[language],
                voice_prompt="Speak in a natural, neutral, friendly tone.",
                voice_gender=gender,
                language=language,
                mode="spoken",
                out_path=full_path,
                voice_name=voice_name,
            )
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"voice preview generation failed: {exc}") from exc

    return {"audio_url": storage.get_url(storage_key)}
