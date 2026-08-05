#!/usr/bin/env python3
"""Generate lightweight, kid-friendly game music and sound effects.

Audio synthesis uses only Python's standard-library math, struct, and wave
modules. If ffmpeg is installed, an MP3 is also written beside every WAV.
"""

import math
import shutil
import struct
import subprocess
import wave
from pathlib import Path


SAMPLE_RATE = 22_050
ROOT = Path(__file__).resolve().parents[1]
AUDIO_ROOT = ROOT / "assets" / "audio"

NOTE_OFFSETS = {
    "C": 0,
    "C#": 1,
    "D": 2,
    "D#": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "G": 7,
    "G#": 8,
    "A": 9,
    "A#": 10,
    "B": 11,
}


def frequency(note):
    """Return a note name such as C4 or F#5 as a frequency in hertz."""
    name = note[:-1]
    octave = int(note[-1])
    midi = 12 * (octave + 1) + NOTE_OFFSETS[name]
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


def make_buffer(seconds):
    return [0.0] * int(round(seconds * SAMPLE_RATE))


def oscillator(phase, shape):
    sine = math.sin(phase)
    if shape == "triangle":
        return (2.0 / math.pi) * math.asin(sine)
    return sine


def envelope(t, duration, attack, decay, sustain, release):
    """Simple attack-decay-sustain-release envelope in the range 0..1."""
    if t < 0.0 or t >= duration:
        return 0.0
    if attack > 0.0 and t < attack:
        return t / attack
    if decay > 0.0 and t < attack + decay:
        return 1.0 - (1.0 - sustain) * ((t - attack) / decay)
    release_start = max(attack + decay, duration - release)
    if release > 0.0 and t >= release_start:
        return sustain * max(0.0, (duration - t) / (duration - release_start))
    return sustain


def add_tone(
    samples,
    start,
    duration,
    freq,
    amplitude,
    shape="sine",
    attack=0.008,
    decay=0.04,
    sustain=0.72,
    release=0.06,
):
    first = max(0, int(round(start * SAMPLE_RATE)))
    last = min(len(samples), int(round((start + duration) * SAMPLE_RATE)))
    for index in range(first, last):
        t = (index - first) / SAMPLE_RATE
        phase = 2.0 * math.pi * freq * t
        env = envelope(t, duration, attack, decay, sustain, release)
        samples[index] += amplitude * env * oscillator(phase, shape)


def add_sweep(
    samples,
    start,
    duration,
    start_freq,
    end_freq,
    amplitude,
    shape="sine",
    attack=0.006,
    release=0.06,
):
    first = max(0, int(round(start * SAMPLE_RATE)))
    last = min(len(samples), int(round((start + duration) * SAMPLE_RATE)))
    rate = (end_freq - start_freq) / duration
    for index in range(first, last):
        t = (index - first) / SAMPLE_RATE
        # Integral of the linear frequency ramp keeps phase continuous.
        phase = 2.0 * math.pi * (start_freq * t + 0.5 * rate * t * t)
        env = envelope(t, duration, attack, 0.02, 0.72, release)
        samples[index] += amplitude * env * oscillator(phase, shape)


def add_notes(samples, notes, amplitude, shape="sine", **envelope_options):
    """Add (start, duration, note-name) tuples to a sample buffer."""
    for start, duration, note in notes:
        add_tone(
            samples,
            start,
            duration,
            frequency(note),
            amplitude,
            shape,
            **envelope_options,
        )


def fade_edges(samples, seconds=0.012):
    """Prevent clicks at file boundaries without affecting loop timing."""
    count = min(int(seconds * SAMPLE_RATE), len(samples) // 2)
    for index in range(count):
        gain = index / count
        samples[index] *= gain
        samples[-1 - index] *= gain


def write_wav(path, samples, peak_limit):
    peak = max(abs(value) for value in samples) or 1.0
    scale = min(1.0, peak_limit / peak)
    pcm = [
        max(-32767, min(32767, int(round(value * scale * 32767.0))))
        for value in samples
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(struct.pack("<{}h".format(len(pcm)), *pcm))


def lobby_music():
    samples = make_buffer(8.0)
    pattern = ["C4", "E4", "G4", "C5", "G4", "E4", "D4", "G4"]
    notes = [(step * 0.5, 0.44, pattern[step % len(pattern)]) for step in range(16)]
    add_notes(samples, notes, 0.105, "sine", attack=0.025, release=0.12)
    for start, root in ((0.0, "C3"), (2.0, "F3"), (4.0, "A3"), (6.0, "G3")):
        add_tone(samples, start, 1.88, frequency(root), 0.045, "triangle",
                 attack=0.08, decay=0.15, sustain=0.55, release=0.25)
    fade_edges(samples)
    return samples


def memory_music():
    samples = make_buffer(8.0)
    melody = [
        "C5", "E5", "G5", "E5", "D5", "F5", "A5", "F5",
        "E5", "G5", "C6", "G5", "D5", "G5", "B5", "G5",
    ]
    notes = [(step * 0.25, 0.145, melody[step % len(melody)]) for step in range(32)]
    add_notes(samples, notes, 0.105, "triangle", attack=0.004, decay=0.025,
              sustain=0.58, release=0.05)
    bass = ["C3", "C3", "F3", "G3", "C3", "A3", "F3", "G3"]
    add_notes(
        samples,
        [(beat, 0.30, bass[index]) for index, beat in enumerate(range(8))],
        0.05,
        "sine",
        attack=0.012,
        release=0.10,
    )
    fade_edges(samples)
    return samples


def quiz_music():
    samples = make_buffer(8.0)
    melody = [
        "C5", "E5", "G5", "C6", "B5", "G5", "E5", "G5",
        "D5", "F5", "A5", "C6", "A5", "F5", "G5", "B5",
    ]
    add_notes(
        samples,
        [(step * 0.25, 0.21, melody[step % len(melody)]) for step in range(32)],
        0.09,
        "triangle",
        attack=0.005,
        decay=0.03,
        sustain=0.62,
        release=0.055,
    )
    roots = ["C3", "C3", "F3", "G3", "A3", "F3", "G3", "G3"]
    for beat in range(16):
        add_tone(samples, beat * 0.5, 0.20, frequency(roots[beat // 2]),
                 0.065, "sine", attack=0.008, release=0.06)
    fade_edges(samples)
    return samples


def wheel_music():
    samples = make_buffer(8.0)
    melody = [
        "C5", "E5", "G5", "C6", "G5", "E5", "F5", "A5",
        "C6", "A5", "G5", "B5", "D6", "B5", "G5", "D5",
    ]
    add_notes(
        samples,
        [(step * 0.25, 0.19, melody[step % len(melody)]) for step in range(32)],
        0.10,
        "triangle",
        attack=0.003,
        decay=0.025,
        sustain=0.60,
        release=0.045,
    )
    chord_roots = ["C3", "F3", "G3", "C3"]
    for bar in range(4):
        start = bar * 2.0
        root = chord_roots[bar]
        add_tone(samples, start, 0.30, frequency(root), 0.07, "sine",
                 attack=0.006, release=0.08)
        for offbeat in (0.5, 1.0, 1.5):
            add_tone(samples, start + offbeat, 0.16, frequency(root) * 2.0,
                     0.045, "triangle", attack=0.004, release=0.04)
    fade_edges(samples)
    return samples


def make_sfx():
    effects = {}

    samples = make_buffer(0.09)
    add_sweep(samples, 0, 0.075, 950, 650, 0.42, "triangle", release=0.035)
    effects["ui-click.wav"] = samples

    samples = make_buffer(0.11)
    add_tone(samples, 0, 0.10, frequency("G6"), 0.24, "sine",
             attack=0.004, decay=0.025, sustain=0.45, release=0.05)
    effects["ui-hover.wav"] = samples

    samples = make_buffer(0.28)
    add_sweep(samples, 0, 0.25, 420, 920, 0.34, "sine", release=0.08)
    effects["ui-open.wav"] = samples

    samples = make_buffer(0.25)
    add_sweep(samples, 0, 0.22, 850, 360, 0.31, "sine", release=0.08)
    effects["ui-close.wav"] = samples

    samples = make_buffer(0.20)
    add_sweep(samples, 0, 0.16, 1200, 460, 0.37, "triangle", release=0.07)
    effects["card-flip.wav"] = samples

    samples = make_buffer(0.62)
    add_notes(samples, [(0.00, 0.30, "C6"), (0.11, 0.34, "E6"),
                        (0.22, 0.38, "G6")], 0.25, "sine",
              attack=0.004, decay=0.05, sustain=0.62, release=0.18)
    effects["match-ok.wav"] = samples

    samples = make_buffer(0.42)
    add_tone(samples, 0, 0.38, 145, 0.23, "triangle",
             attack=0.015, decay=0.04, sustain=0.55, release=0.12)
    add_tone(samples, 0, 0.38, 151, 0.16, "sine",
             attack=0.015, decay=0.04, sustain=0.55, release=0.12)
    effects["match-bad.wav"] = samples

    samples = make_buffer(0.13)
    add_tone(samples, 0, 0.11, frequency("A5"), 0.38, "sine",
             attack=0.003, decay=0.02, sustain=0.50, release=0.045)
    effects["countdown.wav"] = samples

    samples = make_buffer(0.16)
    add_sweep(samples, 0, 0.14, 520, 760, 0.34, "triangle", release=0.05)
    effects["answer-select.wav"] = samples

    samples = make_buffer(0.70)
    add_notes(samples, [(0.00, 0.34, "E5"), (0.13, 0.38, "G5"),
                        (0.27, 0.40, "C6")], 0.27, "sine",
              attack=0.004, decay=0.04, sustain=0.66, release=0.17)
    effects["answer-correct.wav"] = samples

    samples = make_buffer(0.50)
    add_tone(samples, 0, 0.46, 190, 0.28, "triangle",
             attack=0.01, decay=0.05, sustain=0.62, release=0.13)
    add_tone(samples, 0, 0.46, 202, 0.20, "sine",
             attack=0.01, decay=0.05, sustain=0.62, release=0.13)
    effects["answer-wrong.wav"] = samples

    samples = make_buffer(0.08)
    add_sweep(samples, 0, 0.055, 1500, 780, 0.38, "triangle", release=0.025)
    effects["wheel-tick.wav"] = samples

    samples = make_buffer(0.95)
    add_notes(samples, [(0.00, 0.25, "C5"), (0.16, 0.25, "E5"),
                        (0.32, 0.27, "G5"), (0.50, 0.42, "C6")],
              0.27, "triangle", attack=0.004, decay=0.035,
              sustain=0.64, release=0.14)
    effects["wheel-win.wav"] = samples

    samples = make_buffer(1.20)
    add_notes(samples, [(0.00, 0.28, "C5"), (0.15, 0.28, "E5"),
                        (0.30, 0.30, "G5"), (0.48, 0.30, "C6"),
                        (0.67, 0.50, "E6")], 0.25, "triangle",
              attack=0.004, decay=0.04, sustain=0.66, release=0.18)
    add_notes(samples, [(0.67, 0.50, "C6"), (0.67, 0.50, "G5")],
              0.13, "sine", attack=0.008, decay=0.05,
              sustain=0.62, release=0.18)
    effects["victory.wav"] = samples

    samples = make_buffer(0.80)
    add_notes(samples, [(0.00, 0.25, "G4"), (0.18, 0.25, "E4"),
                        (0.36, 0.40, "C4")], 0.20, "sine",
              attack=0.012, decay=0.05, sustain=0.58, release=0.16)
    effects["defeat.wav"] = samples

    for samples in effects.values():
        fade_edges(samples, 0.006)
    return effects


def convert_to_mp3(wav_paths):
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        print("ffmpeg not found; WAV files are ready.")
        return []

    mp3_paths = []
    for wav_path in wav_paths:
        mp3_path = wav_path.with_suffix(".mp3")
        subprocess.run(
            [
                ffmpeg,
                "-y",
                "-loglevel",
                "error",
                "-i",
                str(wav_path),
                "-codec:a",
                "libmp3lame",
                "-q:a",
                "5",
                str(mp3_path),
            ],
            check=True,
        )
        mp3_paths.append(mp3_path)
    return mp3_paths


def main():
    bgm = {
        "lobby.wav": lobby_music(),
        "memory.wav": memory_music(),
        "quiz.wav": quiz_music(),
        "wheel.wav": wheel_music(),
    }
    sfx = make_sfx()

    wav_paths = []
    for filename, samples in bgm.items():
        path = AUDIO_ROOT / "bgm" / filename
        write_wav(path, samples, peak_limit=0.34)
        wav_paths.append(path)
    for filename, samples in sfx.items():
        path = AUDIO_ROOT / "sfx" / filename
        write_wav(path, samples, peak_limit=0.58)
        wav_paths.append(path)

    generated = wav_paths + convert_to_mp3(wav_paths)
    print("Generated audio:")
    for path in generated:
        print("{} ({} bytes)".format(path.relative_to(ROOT), path.stat().st_size))


if __name__ == "__main__":
    main()
