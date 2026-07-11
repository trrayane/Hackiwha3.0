import librosa
import numpy as np
import psola
import soundfile as sf

# Scale degree patterns (semitone offsets from the tonic) for building a
# catchy jingle melody that stays in key. Major = bright/upbeat,
# minor = warm/emotional.
MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]
MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]

# A simple, memorable jingle contour expressed as scale-degree indices
# (into the scale above). Rises to a peak then resolves — nursery-rhyme
# shape that reads as "sung hook". A gentle climb to a peak (degree 5) then a
# resolving fall back to the tonic — a classic memorable-jingle melodic arc,
# rather than a flat back-and-forth.
JINGLE_CONTOUR = [0, 2, 4, 5, 4, 2, 1, 0, 2, 4, 4, 0]


def _midi_to_hz(midi: float) -> float:
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


def build_target_melody(tonic_pitch_class: int, mode: str, num_notes: int, octave: int = 4) -> list[float]:
    """Builds a list of target frequencies (Hz) for a catchy jingle melody
    in the given key, one target per note slot."""
    scale = MAJOR_SCALE if mode == "major" else MINOR_SCALE
    tonic_midi = 12 * (octave + 1) + tonic_pitch_class  # MIDI note number of the tonic

    targets = []
    for i in range(num_notes):
        degree = JINGLE_CONTOUR[i % len(JINGLE_CONTOUR)]
        semitone = scale[degree % len(scale)]
        octave_bump = 12 * (degree // len(scale))
        midi = tonic_midi + semitone + octave_bump
        targets.append(_midi_to_hz(midi))
    return targets


def _segment_median_f0(segment: np.ndarray, sr: int) -> float | None:
    """Median voiced fundamental frequency of a segment, or None if unvoiced."""
    if len(segment) < sr // 20:  # too short (<50ms) to estimate reliably
        return None
    try:
        f0, voiced_flag, _ = librosa.pyin(
            segment,
            fmin=float(librosa.note_to_hz("C2")),
            fmax=float(librosa.note_to_hz("C6")),
            sr=sr,
        )
    except Exception:
        return None
    voiced = f0[~np.isnan(f0)]
    if voiced.size == 0:
        return None
    return float(np.median(voiced))


def autotune_to_melody(
    voice_path: str, tonic_pitch_class: int, mode: str, out_path: str, strength: float = 0.6
) -> str:
    """Turns spoken/quasi-sung TTS audio into an actual sung melody by
    slicing the voice on note onsets and pitch-shifting each slice onto the
    nearest note of a generated in-key jingle melody. This is the step that
    makes Gemini TTS 'sing' — it keeps the perfect Darija pronunciation but
    forces the pitch to follow real musical notes.

    `strength` in [0,1] blends tuned vs. dry voice: lower = more intelligible
    words, higher = more obviously sung."""
    y, sr = librosa.load(voice_path, sr=None, mono=True)

    # Onset-based segmentation: each onset marks a new syllable/note slot.
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, backtrack=True)
    onset_samples = librosa.frames_to_samples(onset_frames)
    boundaries = [0, *[int(s) for s in onset_samples if 0 < s < len(y)], len(y)]
    boundaries = sorted(set(boundaries))
    segments = [(boundaries[i], boundaries[i + 1]) for i in range(len(boundaries) - 1)]
    segments = [(a, b) for a, b in segments if b > a]

    if not segments:
        sf.write(out_path, y, sr)
        return out_path

    targets = build_target_melody(tonic_pitch_class, mode, len(segments))

    out = np.zeros_like(y)
    for idx, (start, end) in enumerate(segments):
        seg = y[start:end]
        current_f0 = _segment_median_f0(seg, sr)
        target_f0 = targets[idx]

        if current_f0 is None or current_f0 <= 0:
            out[start:end] = seg
            continue

        ratio = target_f0 / current_f0
        # Fold the target into the octave nearest the voice so we never shift
        # by more than half an octave — keeps it natural and avoids artifacts.
        while ratio > 1.5:
            ratio /= 2.0
        while ratio < 1 / 1.5:
            ratio *= 2.0
        octave_target_f0 = current_f0 * ratio

        try:
            # TD-PSOLA: shifts pitch while PRESERVING FORMANTS, so the voice
            # stays natural/human instead of getting the metallic phase-vocoder
            # artifact. target_pitch as a scalar pins the whole segment to that
            # note (assumed "sung" effect).
            shifted = psola.vocode(
                seg.astype(np.float64),
                sample_rate=sr,
                target_pitch=float(octave_target_f0),
                fmin=float(librosa.note_to_hz("C2")),
                fmax=float(librosa.note_to_hz("C6")),
            ).astype(np.float32)
        except Exception:
            shifted = seg

        shifted = shifted[: end - start] if len(shifted) >= (end - start) else np.pad(
            shifted, (0, (end - start) - len(shifted))
        )
        # Blend tuned + original so the words stay intelligible: the tuned
        # signal carries the musical pitch, the dry original keeps the crisp
        # consonants/diction that a hard 100% autotune smears.
        out[start:end] = strength * shifted + (1.0 - strength) * seg

    # Gentle normalization to avoid clipping after shifting.
    peak = np.max(np.abs(out)) or 1.0
    out = out / peak * 0.97

    sf.write(out_path, out, sr)
    return out_path
