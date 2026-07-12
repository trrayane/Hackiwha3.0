import os
import re
import struct
from google import genai
from google.genai import types

from app.integrations.ai.key_rotation import current_key, is_quota_error, num_keys, rotate_key

_clients: dict[str, "genai.Client"] = {}

VOICE_MAP = {
    "femme": "Aoede",
    "homme": "Fenrir",
}

# Brighter, more upbeat presets for sung jingles — Puck/Kore read as more
# playful and energetic than Fenrir/Aoede, which lean neutral/serious.
SUNG_VOICE_MAP = {
    "femme": "Leda",
    "homme": "Charon",
}

LANGUAGE_LABELS = {
    "fr": "French (France)",
    "ar-darija": "Algerian Darija (Arabic dialect spoken naturally as in Algeria, not Modern Standard Arabic, not Moroccan Darija)",
    "en": "English",
}


def _get_client(api_key: str):
    client = _clients.get(api_key)
    if client is None:
        client = genai.Client(api_key=api_key)
        _clients[api_key] = client
    return client


def _pcm_to_wav_bytes(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
    byte_rate = sample_rate * channels * sample_width
    block_align = channels * sample_width
    data_size = len(pcm_data)
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", 36 + data_size, b"WAVE",
        b"fmt ", 16, 1, channels, sample_rate, byte_rate, block_align, sample_width * 8,
        b"data", data_size,
    )
    return header + pcm_data


_VOWEL_RUN_RE = re.compile(r"([aeiouAEIOU])(\W*)(?=\s|$)")


def _stretch_word_vowels(word: str) -> str:
    """Elongate the last vowel of a word (e.g. 'sur3a' -> 'sur3aaa') to nudge
    Gemini TTS toward held, sung-sounding syllables instead of clipped speech.
    Only touches Latin-script vowels; Arabic-script text passes through unchanged
    since Arabic doesn't write short vowels explicitly."""
    match = None
    for match in _VOWEL_RUN_RE.finditer(word):
        pass
    if not match:
        return word
    vowel, trailing = match.group(1), match.group(2)
    start = match.start(1)
    return word[:start] + vowel * 3 + trailing


def _add_singing_rhythm(text: str) -> str:
    words = text.split(" ")
    stretched = [_stretch_word_vowels(w) if w else w for w in words]
    rhythmic = " ".join(stretched)
    # Rhythmic pauses: turn hard stops into held, musical pauses.
    rhythmic = re.sub(r"!\s*", "! ... ", rhythmic)
    rhythmic = re.sub(r",\s*", ", ... ", rhythmic)
    return rhythmic


def _wrap_with_stage_directions(sung_lyrics: str) -> str:
    """Bracketed stage directions ("(singing brightly)") act as strong style
    triggers for Gemini TTS, on top of the plain-English style instructions."""
    return (
        f"(singing warmly, melodic rise) {sung_lyrics} "
        f"(singing again, brighter and more excited, ascending pitch on the last words) {sung_lyrics}"
    )


# All prebuilt Gemini TTS voices the user can pick from in the UI, tagged
# with their perceived gender (per Google's Gemini TTS voice characteristics
# table) so the frontend can filter the picker by the voice_gender toggle.
VOICE_GENDER_MAP = {
    "Zephyr": "female", "Puck": "male", "Charon": "male", "Kore": "female",
    "Fenrir": "male", "Leda": "female", "Orus": "male", "Aoede": "female",
    "Callirrhoe": "female", "Autonoe": "female", "Enceladus": "male",
    "Iapetus": "male", "Umbriel": "male", "Algieba": "male",
    "Despina": "female", "Erinome": "female", "Algenib": "male",
    "Rasalgethi": "male", "Laomedeia": "female", "Achernar": "female",
    "Alnilam": "male", "Schedar": "male", "Gacrux": "female",
    "Pulcherrima": "female", "Achird": "male", "Zubenelgenubi": "male",
    "Vindemiatrix": "female", "Sadachbia": "male", "Sadaltager": "male",
    "Sulafat": "female",
}
AVAILABLE_VOICES = list(VOICE_GENDER_MAP.keys())


def generate_voice(
    lyrics: str,
    voice_prompt: str,
    voice_gender: str,
    language: str,
    mode: str,
    out_path: str,
    voice_name: str = "",
) -> str:
    language_label = LANGUAGE_LABELS.get(language, language)
    style_prefix = f"Speak/sing strictly in {language_label}. Do not switch to any other language.\n{voice_prompt}\n"

    # An explicit user-picked voice always wins; otherwise fall back to the
    # gender-based default for the mode.
    picked_voice = voice_name if voice_name in AVAILABLE_VOICES else ""

    if mode == "sung_jingle":
        voice_name = picked_voice or SUNG_VOICE_MAP.get(voice_gender, "Kore")
        # Technical singing mechanics ONLY here — the actual emotion (tender,
        # energetic, proud, calm, etc.) must come from voice_prompt above,
        # which is already tailored per-brand. A fixed "bright/triumphant"
        # block here would fight a tender lullaby-style prompt for a kids/milk
        # brand, for example — so this stays emotion-neutral by design.
        style_prefix += (
            "PERFORMANCE STYLE — this must sound like a real singer performing a "
            "melody, not narration or a voice actor reading a script:\n"
            "- Melody: short, catchy, nursery-rhyme-simple — a melody a listener "
            "could hum after one listen. Stretch and hold vowels on accented syllables, let the "
            "pitch rise and fall across each phrase like a real musical line — never flat, never "
            "monotone, never speech-like.\n"
            "- Breath and phrasing: place natural singer's breaths between phrases, and let the "
            "held notes decay and swell the way a human voice does when actually singing on pitch, "
            "not when reading text aloud.\n"
            "- Emotional arc: follow precisely the specific emotion, warmth/energy level, and "
            "character described above for this brand — do not default to generic cheerfulness; "
            "let THAT particular emotion colour the melody, dynamics, and the way the hook/brand "
            "name lands at the end of the phrase.\n"
            "- Sing the lyrics through EXACTLY ONCE, in the order given — the repeated refrain, "
            "if any, is already written into the lyrics text below; do not repeat the whole "
            "passage again after reaching the end, that would run the jingle far past its "
            "target duration.\n"
        )
        # Keep the lyrics CLEAN — no vowel-stretching ("sur3aaa") or ♪ symbols,
        # which garbled Gemini TTS's Darija pronunciation. We only steer the
        # delivery via the style prompt; the actual "singing" (pitch onto notes)
        # is handled downstream by the autotune step, which preserves the words.
        full_text = style_prefix + lyrics
        tts_model = "gemini-2.5-flash-preview-tts"
    else:
        voice_name = picked_voice or VOICE_MAP.get(voice_gender, "Aoede")
        full_text = style_prefix + lyrics
        tts_model = "gemini-2.5-flash-preview-tts"

    max_attempts = 3 * max(1, num_keys())
    candidate = None
    last_reason = "unknown"
    for attempt in range(max_attempts):
        client = _get_client(current_key())
        try:
            response = client.models.generate_content(
                model=tts_model,
                contents=full_text,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice_name)
                        )
                    ),
                ),
            )
        except Exception as exc:
            if is_quota_error(exc) and num_keys() > 1:
                rotate_key()
                last_reason = "quota exhausted on this key, rotated"
                continue
            raise
        candidate = response.candidates[0] if response.candidates else None
        if candidate is not None and candidate.content is not None:
            break
        last_reason = candidate.finish_reason if candidate else "no candidates returned"
        candidate = None

    if candidate is None:
        raise RuntimeError(
            f"Gemini TTS returned no audio after {max_attempts} attempts (finish_reason={last_reason})"
        )

    pcm_data = candidate.content.parts[0].inline_data.data
    wav_bytes = _pcm_to_wav_bytes(pcm_data)

    with open(out_path, "wb") as f:
        f.write(wav_bytes)

    return out_path
