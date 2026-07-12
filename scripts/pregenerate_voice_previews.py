"""One-off script: pre-generates and caches a short spoken preview clip for
every Gemini TTS voice, in every supported language, directly via the voice
engine (no HTTP round trip). Safe to re-run — skips files that already exist.

Supports rotating across multiple GEMINI_API_KEY values to work around the
free-tier per-key rate limit (3 requests/minute for the TTS model): put one
key per line in scripts/gemini_keys.txt, or fall back to the single
GEMINI_API_KEY from .env if that file doesn't exist.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
import app.integrations.ai.voice_engine as voice_engine
from app.integrations.ai.voice_engine import AVAILABLE_VOICES, VOICE_GENDER_MAP, generate_voice

PREVIEW_PHRASES = {
    "fr": "Bonjour, voici un aperçu de cette voix.",
    "en": "Hello, this is a preview of this voice.",
    "ar-darija": "أهلا، هادي نظرة على هاد الصوت.",
}

previews_dir = os.path.join(settings.upload_dir, "voice_previews")
os.makedirs(previews_dir, exist_ok=True)

keys_file = os.path.join(os.path.dirname(__file__), "gemini_keys.txt")
if os.path.exists(keys_file):
    with open(keys_file, encoding="utf-8") as f:
        API_KEYS = [line.strip() for line in f if line.strip()]
else:
    API_KEYS = [os.environ["GEMINI_API_KEY"]]

print(f"Loaded {len(API_KEYS)} API key(s).")
key_index = 0


def _switch_key(index: int) -> None:
    os.environ["GEMINI_API_KEY"] = API_KEYS[index]
    voice_engine._client = None  # force genai.Client to be rebuilt with the new key


_switch_key(key_index)

jobs = [
    (voice_name, language, phrase)
    for voice_name in AVAILABLE_VOICES
    for language, phrase in PREVIEW_PHRASES.items()
]
jobs = [j for j in jobs if not os.path.exists(os.path.join(previews_dir, f"{j[0]}_{j[1]}.wav"))]

total = len(jobs)
print(f"{total} preview(s) left to generate.")

i = 0
attempts_this_job = 0
max_attempts_per_job = len(API_KEYS) * 2
while i < len(jobs):
    voice_name, language, phrase = jobs[i]
    out_path = os.path.join(previews_dir, f"{voice_name}_{language}.wav")
    gender = VOICE_GENDER_MAP[voice_name]
    print(f"[{i + 1}/{total}] {voice_name} ({language}) via key #{key_index + 1} — generating...")
    try:
        generate_voice(
            lyrics=phrase,
            voice_prompt="Speak in a natural, neutral, friendly tone.",
            voice_gender=gender,
            language=language,
            mode="spoken",
            out_path=out_path,
            voice_name=voice_name,
        )
        i += 1
        attempts_this_job = 0
    except Exception as exc:
        msg = str(exc)
        attempts_this_job += 1
        is_quota = "RESOURCE_EXHAUSTED" in msg or "429" in msg
        if attempts_this_job >= max_attempts_per_job:
            print(f"  giving up on this voice after {attempts_this_job} attempts across all keys: {msg[:200]}")
            i += 1
            attempts_this_job = 0
            continue
        reason = "quota hit" if is_quota else f"error ({msg[:150]})"
        key_index = (key_index + 1) % len(API_KEYS)
        print(f"  {reason}, switching to key #{key_index + 1}")
        _switch_key(key_index)
        if is_quota and key_index == 0:
            print("  all keys exhausted this round, waiting 60s before retrying...")
            time.sleep(60)
        # retry same job with the new key, don't advance i

print("Done.")
