"""Synthesizes narration with Piper, mixes ambience + sound effects, and writes
build/audio.wav plus build/timeline.{json,js} that drive caption and scene timing."""
import json, re, subprocess, sys, wave
from pathlib import Path
import numpy as np
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
script = json.loads((ROOT / "story/script.json").read_text(encoding="utf-8"))
voice_name = script["voice"]
vdir = BUILD / "voices"
vdir.mkdir(parents=True, exist_ok=True)
model = vdir / f"{voice_name}.onnx"
if not model.exists():
    subprocess.run([sys.executable, "-m", "piper.download_voices", voice_name, "--download-dir", str(vdir)], check=True)
voice = PiperVoice.load(str(model))
SR = voice.config.sample_rate
cfg = SynthesisConfig(length_scale=script.get("lengthScale", 1.0))


def speak(text):
    chunks = [c.audio_float_array for c in voice.synthesize(text, syn_config=cfg)]
    a = np.concatenate(chunks).astype(np.float32)
    loud = np.flatnonzero(np.abs(a) > 0.02)
    if len(loud):
        a = a[max(0, loud[0] - int(0.03 * SR)): loud[-1] + int(0.06 * SR)]
    return a


def tokens(show):
    """Split caption text into words; *...* marks highlighted words, a lone dash joins the previous word."""
    out, hl = [], False
    for raw in show.split():
        text, mark = "", hl
        for ch in raw:
            if ch == "*":
                hl = not hl
                mark = mark or hl
            else:
                text += ch
        if text == "—" and out:
            out[-1]["text"] += " —"
        elif text:
            out.append({"text": text, "hl": mark})
    return out


def weight(tok, last):
    w = len(re.findall(r"[аеёиоуыэюяАЕЁИОУЫЭЮЯ]", tok)) + 2.5 * len(re.findall(r"\d", tok))
    w = max(w, 1) + 0.6
    if not last and re.search(r"[,:;.!?—]»?$", tok):
        w += 1.3
    return w


def clean(text):
    return re.sub(r"\s+", " ", re.sub(r"[«»*]", "", text).replace("—", ",")).strip()


t = 0.0
clips, scenes, cues = [], [], []
for sc in script["scenes"]:
    start = t
    t += sc.get("lead", 0.25)
    lines = []
    for ln in sc["lines"]:
        audio = speak(clean(ln.get("say", ln["show"])))
        dur = len(audio) / SR
        clips.append((t, audio))
        toks = tokens(ln["show"])
        ws = [weight(k["text"], i == len(toks) - 1) for i, k in enumerate(toks)]
        acc, words = 0.0, []
        for k, w in zip(toks, ws):
            words.append({"text": k["text"], "hl": k["hl"], "t0": round(t + dur * acc / sum(ws), 3)})
            acc += w
        lines.append({"start": round(t, 3), "end": round(t + dur, 3), "words": words})
        t += dur + ln.get("gap", 0.14)
    t = max(t + sc.get("tail", 0.3), start + sc.get("dur", 0))
    cue = {}
    for fx in sc.get("sfx", []):
        at = lines[fx["line"]]["start"] + fx["at"]
        cue[fx["name"]] = round(at - start, 3)
        cues.append((at, fx["type"]))
    if sc.get("heartbeat"):
        cues += [(x, "beat") for x in np.arange(start + 0.2, t - 0.3, 0.95)]
    scenes.append({"id": sc["id"], "start": round(start, 3), "end": round(t, 3), "lines": lines, "cue": cue})

total = t
n = int(total * SR) + 1
x = np.arange(n) / SR
rng = np.random.default_rng(7)


def env(length, decay):
    return np.exp(-np.arange(int(length * SR)) / SR / decay)


def lowpass(sig, k):
    return np.convolve(sig, np.ones(k) / k, mode="same")


def sfx(kind):
    if kind in ("thump", "cardoor", "beat"):
        length, f0, f1, dec, amp = {"thump": (0.6, 110, 38, 0.13, 0.9), "cardoor": (0.3, 150, 60, 0.05, 0.4), "beat": (0.5, 62, 40, 0.07, 0.5)}[kind]
        e = env(length, dec)
        f = f1 + (f0 - f1) * e
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * e
        if kind == "beat":
            d = int(0.22 * SR)
            body[d:] += 0.7 * body[:-d]
            return amp * body
        return amp * (body + 0.5 * lowpass(rng.standard_normal(len(e)), 12) * env(length, 0.03))
    if kind == "crash":
        e = env(0.9, 0.16)
        return 0.5 * lowpass(rng.standard_normal(len(e)), 6) * e + 0.5 * np.sin(2 * np.pi * 70 * np.arange(len(e)) / SR) * env(0.9, 0.1)
    if kind == "bell":
        out = np.zeros(int(1.3 * SR))
        for off, freq in ((0.0, 659.3), (0.42, 523.3)):
            e = env(0.85, 0.22)
            tt = np.arange(len(e)) / SR
            tone = (np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * 2 * freq * tt) + 0.15 * np.sin(2 * np.pi * 3.01 * freq * tt)) * e
            i = int(off * SR)
            out[i:i + len(e)] += 0.3 * tone
        return out
    raise ValueError(kind)


def add(dst, at, sig, gain=1.0):
    i = int(at * SR)
    sig = sig[: max(0, len(dst) - i)]
    dst[i:i + len(sig)] += gain * sig


mix = np.zeros(n, dtype=np.float64)
for at, audio in clips:
    add(mix, at, audio, 0.9)
# Ambient bed: slow low drone plus soft filtered noise.
lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * x)
bed = (np.sin(2 * np.pi * 55 * x) + 0.55 * np.sin(2 * np.pi * 82.6 * x) + 0.3 * np.sin(2 * np.pi * 110.4 * x + np.sin(2 * np.pi * 0.11 * x))) * lfo
bed = 0.05 * bed + 0.012 * lowpass(rng.standard_normal(n), 40)
fade = np.minimum(1, np.minimum(x / 1.5, (total - x) / 2.5)).clip(0, 1)
mix += bed * fade
for at, kind in cues:
    add(mix, at, sfx(kind))
mix = np.tanh(mix * 1.1)
with wave.open(str(BUILD / "audio.wav"), "wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((mix * 32000).astype(np.int16).tobytes())

timeline = {"duration": round(total, 3), "scenes": scenes}
(BUILD / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1), encoding="utf-8")
(BUILD / "timeline.js").write_text("window.TIMELINE=" + json.dumps(timeline, ensure_ascii=False) + ";", encoding="utf-8")
print(f"duration {total:.1f}s, {len(clips)} lines, sample rate {SR}")
for s in scenes:
    print(f"  {s['id']:9s} {s['start']:6.2f} – {s['end']:6.2f}")
