import asyncio
import os
import shutil
import uuid

from app.integrations.ai.pipeline import run_pipeline
from app.integrations.ai_provider import AIProviderService, JingleGenerationInput, JingleGenerationResult
from app.integrations.storage import StorageService


class GeminiMusicGenProvider(AIProviderService):
    """Real AI provider: Gemini (lyrics + prompt enrichment + TTS) for voice,
    MusicGen (facebook/musicgen-small) for the instrumental, plus a DSP
    autotune step (librosa + psola) that turns the TTS speech into an
    actually-sung melody, all mixed together with pydub.

    Requires GEMINI_API_KEY in the environment (see .env.example). Runs
    entirely on CPU; MusicGen generation typically takes 1-3 minutes, so this
    call is genuinely slow — see the module docstring in pipeline.py.
    """

    provider_name = "gemini-musicgen"

    def __init__(self, storage: StorageService, upload_dir: str) -> None:
        self.storage = storage
        # Scratch dir for intermediate pipeline files (voice/music stems).
        self.work_dir = os.path.join(upload_dir, "_jingle_work")
        # Final files live directly under upload_dir/generated so
        # storage.get_url("generated/<file>") resolves the same way as any
        # other file the LocalStorageService already serves under /media.
        self.generated_dir = os.path.join(upload_dir, "generated")
        os.makedirs(self.work_dir, exist_ok=True)
        os.makedirs(self.generated_dir, exist_ok=True)

    async def generate_jingle(self, payload: JingleGenerationInput) -> JingleGenerationResult:
        # payload.reference_audio_url: accepted by the interface (user may
        # optionally upload a voice sample) but NOT yet used — Gemini TTS only
        # offers its own preset voices, it has no voice-cloning capability, so
        # a reference sample can't currently steer the output voice. Ignored
        # rather than erroring, so generation still works with or without one.

        # MusicGen/Gemini calls are blocking (network + CPU-bound torch
        # inference) — run in a worker thread so they don't block the event
        # loop for other requests.
        result = await asyncio.to_thread(
            run_pipeline,
            brand_name=payload.brand_name,
            brand_tone=payload.brand_tone,
            brand_description=payload.brand_description,
            target_age_range=payload.target_age_range.value if payload.target_age_range else None,
            mood_context=payload.mood_context,
            platform=payload.platform.value if payload.platform else None,
            sound_description=payload.sound_description,
            voice_enabled=payload.voice_enabled,
            voice_gender=payload.voice_gender,
            voice_name=payload.voice_name,
            language=payload.language,
            work_dir=self.work_dir,
        )

        storage_key = f"generated/{uuid.uuid4().hex}.mp3"
        dest_path = os.path.join(self.generated_dir, os.path.basename(storage_key))
        shutil.move(result.audio_path, dest_path)

        return JingleGenerationResult(
            provider=self.provider_name,
            audio_url=self.storage.get_url(storage_key),
            lyrics=result.lyrics,
            duration_seconds=result.duration_seconds,
            generation_time_ms=result.generation_time_ms,
        )
