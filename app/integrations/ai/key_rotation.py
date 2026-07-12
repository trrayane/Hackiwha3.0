"""Shared Gemini API key rotation for the AI integrations.

Reads all keys from scripts/gemini_keys.txt (one per line) so the same 6
keys the pregeneration script rotates through are also used for live
requests (jingle generation, lyrics/prompt enhancement, voice previews).
Falls back to the single GEMINI_API_KEY from the environment/.env if that
file doesn't exist.
"""
import os

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_THIS_DIR, "..", "..", ".."))
_KEYS_FILE = os.path.join(_PROJECT_ROOT, "scripts", "gemini_keys.txt")


def _load_api_keys() -> list[str]:
    if os.path.exists(_KEYS_FILE):
        with open(_KEYS_FILE, encoding="utf-8") as f:
            keys = [line.strip() for line in f if line.strip()]
        if keys:
            return keys
    single = os.environ.get("GEMINI_API_KEY")
    return [single] if single else []


_API_KEYS = _load_api_keys()
_key_index = 0


def current_key() -> str:
    if not _API_KEYS:
        raise RuntimeError(
            "No Gemini API key configured (set GEMINI_API_KEY or create scripts/gemini_keys.txt)"
        )
    return _API_KEYS[_key_index]


def rotate_key() -> str:
    global _key_index
    _key_index = (_key_index + 1) % len(_API_KEYS)
    return _API_KEYS[_key_index]


def num_keys() -> int:
    return len(_API_KEYS)


def is_quota_error(exc: Exception) -> bool:
    msg = str(exc)
    return "RESOURCE_EXHAUSTED" in msg or "429" in msg
