import os
import re
import time
import uuid

from pydub import AudioSegment

from app.integrations.ai import prompt_enhancer
from app.integrations.ai.voice_engine import generate_voice
from app.integrations.ai.music_engine import generate_music
from app.integrations.ai.key_matching import estimate_key, align_music_key_to_voice
from app.integrations.ai.pitch_correct import autotune_to_melody

FADE_MS = 800
DUCK_DB = -9
BALANCED_DB = 0

# Fallback when the wizard doesn't send a language (older drafts created
# before this field existed). language/voice_gender/voice_name are all
# threaded through from JingleGenerationInput (see run_pipeline below).
DEFAULT_LANGUAGE = "ar-darija"
_VALID_LANGUAGES = {"ar-darija", "fr", "en"}
DEFAULT_VOICE_GENDER = "femme"

# Frontend/API use "male"/"female"; voice_engine's VOICE_MAP/SUNG_VOICE_MAP
# key off the French "homme"/"femme".
_VOICE_GENDER_TO_FR = {"male": "homme", "female": "femme"}

# Target duration per platform, used when the wizard doesn't expose a
# duration field either — mirrors the constraints named in PLATFORM_PROFILES.
_PLATFORM_DURATION_SECONDS = {
    "tiktok": 8,
    "instagram_reels": 8,
    "spotify_ads": 8,
    "youtube": 15,
    "classic_radio": 20,
    "in_store": 25,
}
DEFAULT_DURATION_SECONDS = 15
DEFAULT_GUIDANCE_SCALE = 4.0

# TargetAgeRange enum values (app/models/enums.py) are raw "13-24" / "25-40" /
# "41+" strings — translate to a descriptive phrase for a richer prompt.
_AGE_RANGE_LABELS = {
    "13-24": "jeunes / teens et jeunes adultes (13-24 ans) — ton vif, moderne, énergique",
    "25-40": "adultes actifs (25-40 ans) — ton dynamique mais posé, crédible",
    "41+": "public senior/mature (41 ans et +) — ton chaleureux, respectueux, sans jargon jeune",
}


def _extract_bpm(music_prompt: str) -> int | None:
    match = re.search(r"(\d{2,3})\s*BPM", music_prompt, re.IGNORECASE)
    return int(match.group(1)) if match else None


def _with_tempo_lock(voice_prompt: str, bpm: int | None) -> str:
    if bpm is None:
        return voice_prompt
    return (
        f"{voice_prompt}\nMatch the music's tempo: perform at a steady {bpm} BPM pulse, "
        "keeping your rhythm and pacing locked to this beat throughout, so the voice and "
        "the music feel like one synchronized performance, not two separate tracks."
    )


def _mix_voice_and_music(voice_path: str, music_path: str, mix_mode: str, target_duration_s: float, out_path: str) -> None:
    voice = AudioSegment.from_file(voice_path)
    music = AudioSegment.from_file(music_path)

    requested_ms = int(target_duration_s * 1000)
    tail_ms = 700
    target_ms = max(requested_ms, len(voice) + tail_ms)

    if len(music) < target_ms:
        music = music * (target_ms // len(music) + 1)
    music = music[:target_ms].fade_in(FADE_MS).fade_out(FADE_MS)

    gain_db = DUCK_DB if mix_mode == "duck" else BALANCED_DB
    music = music + gain_db

    if len(voice) < target_ms:
        voice = voice + AudioSegment.silent(duration=target_ms - len(voice))
    else:
        voice = voice[:target_ms]

    mixed = music.overlay(voice).normalize()
    mixed.export(out_path, format="mp3")


def _measure_duration_seconds(path: str) -> int:
    """Actual length of the final mixed file, in whole seconds. mix_voice_and_music
    can extend the mix past the requested target (never cut a word mid-sentence),
    so the requested duration_seconds is not reliable — always measure the real
    output instead of trusting the target, otherwise GeneratedVariant.duration_seconds
    silently disagrees with the audio file it's attached to."""
    return int(round(len(AudioSegment.from_file(path)) / 1000))


class JinglePipelineResult:
    def __init__(self, audio_path: str, lyrics: str, duration_seconds: int, generation_time_ms: int):
        self.audio_path = audio_path
        self.lyrics = lyrics
        self.duration_seconds = duration_seconds
        self.generation_time_ms = generation_time_ms


def run_pipeline(
    *,
    brand_name: str,
    brand_tone: str,
    brand_description: str | None,
    target_age_range: str | None,
    mood_context: str | None,
    platform: str | None,
    sound_description: str | None,
    voice_enabled: bool,
    work_dir: str,
    voice_gender: str | None = None,
    voice_name: str | None = None,
    language: str | None = None,
) -> JinglePipelineResult:
    """Runs the full Gemini TTS + MusicGen jingle pipeline synchronously
    (blocking, CPU/network heavy — call via asyncio.to_thread from async
    code). Writes intermediate + final files under `work_dir` and returns
    the path to the final mixed MP3."""
    start = time.monotonic()
    os.makedirs(work_dir, exist_ok=True)
    job_id = uuid.uuid4().hex

    duration_seconds = _PLATFORM_DURATION_SECONDS.get(platform or "", DEFAULT_DURATION_SECONDS)
    # voice_enabled now picks between the two REAL voice modes — it never
    # means "no voice": True = sung jingle (singing, melodic), False = spoken
    # voiceover (a normal speaking voice, no singing). Both always generate
    # a TTS voice; there is no instrumental-only path anymore.
    mode = "sung_jingle" if voice_enabled else "voiceover"
    resolved_language = language if language in _VALID_LANGUAGES else DEFAULT_LANGUAGE

    brand_context_parts = [f"Marque : {brand_name}", f"Ton : {brand_tone}"]
    if brand_description:
        brand_context_parts.append(f"Description : {brand_description}")
    if target_age_range:
        age_label = _AGE_RANGE_LABELS.get(target_age_range, target_age_range)
        brand_context_parts.append(f"Public cible : {age_label}")
    if mood_context:
        brand_context_parts.append(f"Contexte/ambiance : {mood_context}")
    brand_context = "\n".join(brand_context_parts)

    lyrics = prompt_enhancer.generate_lyrics(
        brand_context, mode=mode, language=resolved_language, duration_seconds=duration_seconds
    )

    music_simple_request = sound_description or brand_tone
    music_prompt = prompt_enhancer.enhance_music_prompt(
        music_simple_request, brand_context=(lyrics or brand_context), platform=platform or ""
    )

    final_path = os.path.join(work_dir, f"{job_id}_final.mp3")

    voice_prompt = prompt_enhancer.enhance_voice_prompt(
        brand_tone, lyrics=lyrics, mode=mode, language=resolved_language
    )

    voice_path = os.path.join(work_dir, f"{job_id}_voice.wav")
    bpm = _extract_bpm(music_prompt)
    voice_prompt = _with_tempo_lock(voice_prompt, bpm)

    generate_voice(
        lyrics=lyrics,
        voice_prompt=voice_prompt,
        voice_gender=_VOICE_GENDER_TO_FR.get(voice_gender or "", DEFAULT_VOICE_GENDER),
        language=resolved_language,
        mode=mode,
        out_path=voice_path,
        voice_name=voice_name or "",
    )

    music_path = os.path.join(work_dir, f"{job_id}_music.wav")

    if mode == "sung_jingle":
        # Autotune (pitch-correct the TTS take onto a real melody) only makes
        # sense for a sung performance — a spoken voiceover has no melody to
        # conform the music to.
        voice_key_name, voice_mode_name, voice_pitch_class = estimate_key(voice_path)
        tuned_voice_path = os.path.join(work_dir, f"{job_id}_voice_tuned.wav")
        autotune_to_melody(voice_path, voice_pitch_class, voice_mode_name, tuned_voice_path, strength=0.72)
        voice_path = tuned_voice_path

        music_prompt = f"{music_prompt}\nCompose in the key of {voice_key_name} {voice_mode_name}."
        generate_music(
            music_prompt=music_prompt,
            duration_seconds=duration_seconds,
            guidance_scale=DEFAULT_GUIDANCE_SCALE,
            out_path=music_path,
        )
        aligned_music_path = os.path.join(work_dir, f"{job_id}_music_aligned.wav")
        align_music_key_to_voice(music_path, voice_pitch_class, aligned_music_path)
        music_path = aligned_music_path
    else:
        generate_music(
            music_prompt=music_prompt,
            duration_seconds=duration_seconds,
            guidance_scale=DEFAULT_GUIDANCE_SCALE,
            out_path=music_path,
        )

    # Spoken voiceover sits on top of the music bed (ducked), not blended
    # into it like a sung melody, so the words stay clearly intelligible.
    mix_mode = "balanced" if mode == "sung_jingle" else "duck"
    _mix_voice_and_music(voice_path, music_path, mix_mode, duration_seconds, final_path)

    elapsed_ms = int((time.monotonic() - start) * 1000)
    return JinglePipelineResult(final_path, lyrics, _measure_duration_seconds(final_path), elapsed_ms)
