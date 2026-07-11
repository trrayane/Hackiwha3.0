import os
import scipy.io.wavfile
from transformers import AutoProcessor, MusicgenForConditionalGeneration

_processor = None
_model = None

# musicgen-small in float32. Bigger models (medium/large) OOM-crash this
# machine's RAM, and float16 on CPU segfaults MusicGen (unsupported half-
# precision ops) — so float32 small is the only stable configuration here.
MODEL_NAME = os.environ.get("MUSICGEN_MODEL", "facebook/musicgen-small")


def _load_model():
    global _processor, _model
    if _model is None:
        _processor = AutoProcessor.from_pretrained(MODEL_NAME)
        _model = MusicgenForConditionalGeneration.from_pretrained(MODEL_NAME)
    return _processor, _model


def generate_music(music_prompt: str, duration_seconds: float, guidance_scale: float, out_path: str) -> str:
    processor, model = _load_model()

    inputs = processor(text=[music_prompt], padding=True, return_tensors="pt")

    tokens_per_second = 50
    max_new_tokens = int(duration_seconds * tokens_per_second)

    audio_values = model.generate(
        **inputs,
        do_sample=True,
        guidance_scale=guidance_scale,
        max_new_tokens=max_new_tokens,
    )

    sampling_rate = model.config.audio_encoder.sampling_rate
    audio_data = audio_values[0, 0].cpu().numpy()

    scipy.io.wavfile.write(out_path, rate=sampling_rate, data=audio_data)
    return out_path
