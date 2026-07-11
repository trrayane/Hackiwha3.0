import librosa
import numpy as np

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Krumhansl-Kessler key profiles — standard reference vectors for correlating
# against a chroma vector to estimate the most likely musical key.
_MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
_MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def estimate_key(audio_path: str) -> tuple[str, str, int]:
    """Estimates the musical key of an audio file via chroma analysis,
    correlated against Krumhansl-Kessler major/minor key profiles.
    Returns (note_name, mode, pitch_class_index)."""
    y, sr = librosa.load(audio_path, sr=None, mono=True)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = chroma.mean(axis=1)

    best_score = -np.inf
    best_note_idx = 0
    best_mode = "major"

    for shift in range(12):
        major_rotated = np.roll(_MAJOR_PROFILE, shift)
        minor_rotated = np.roll(_MINOR_PROFILE, shift)

        major_score = np.corrcoef(chroma_mean, major_rotated)[0, 1]
        minor_score = np.corrcoef(chroma_mean, minor_rotated)[0, 1]

        if major_score > best_score:
            best_score = major_score
            best_note_idx = shift
            best_mode = "major"
        if minor_score > best_score:
            best_score = minor_score
            best_note_idx = shift
            best_mode = "minor"

    return NOTE_NAMES[best_note_idx], best_mode, best_note_idx


def semitone_shift_to_match(source_pitch_class: int, target_pitch_class: int) -> int:
    """Smallest signed semitone shift to move source onto target's pitch class."""
    diff = (target_pitch_class - source_pitch_class) % 12
    if diff > 6:
        diff -= 12
    return diff


def align_music_key_to_voice(music_path: str, voice_pitch_class: int, out_path: str) -> str:
    """Pitch-shifts an instrumental track so its key matches the voice's
    detected key — guarantees harmonic compatibility even without true
    melody-following, and is cheap pure-DSP (no heavy model, no crash risk)."""
    _, _, music_pitch_class = estimate_key(music_path)
    shift = semitone_shift_to_match(music_pitch_class, voice_pitch_class)

    y, sr = librosa.load(music_path, sr=None, mono=False)
    if shift != 0:
        if y.ndim == 1:
            y = librosa.effects.pitch_shift(y, sr=sr, n_steps=shift)
        else:
            y = np.stack([librosa.effects.pitch_shift(ch, sr=sr, n_steps=shift) for ch in y])

    import soundfile as sf

    sf.write(out_path, y.T if y.ndim > 1 else y, sr)
    return out_path
