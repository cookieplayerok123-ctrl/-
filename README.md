# Правила тишины — animated short

A ~110 second vertical (1080×1920, 30 fps) animated story in the flat-vector "survival rules" style:
big-eyed outlined characters, word-by-word captions, rule cards, a floor plan, a cliffhanger choice and a
helpline card. Story, characters and artwork are original; narration is Russian.

**Story.** Тим's father is the town's "teacher of the year" and the school principal. At home Тим lives by
four rules: fear the silence rather than the shouting, stay out of rooms with no second exit, don't stand
between them — get your little sister out, and agree on a code word in advance. The code word brings the
local policeman to the door — who turns out to be the father's former pupil.

## Build

Requires Node, pnpm, ffmpeg, Google Chrome and [uv](https://docs.astral.sh/uv/).

```sh
pnpm install
uv venv .venv && uv pip install -p .venv/bin/python piper-tts
pnpm build        # narration + audio, then frames + mux -> out/rules-of-silence.mp4
```

- `pnpm tts` — synthesizes the narration with Piper (voice is downloaded on first run), mixes the ambient
  bed and sound effects, and writes `build/audio.wav` and `build/timeline.json` (caption/scene timing).
- `pnpm render` — renders every frame in headless Chrome and muxes the video.
- `pnpm stills` — contact sheets of key moments in `build/stills/` for quick visual review.
- `node tools/render.mjs --at $(node tools/times.mjs hook:0.3 end:0.9)` — single frames.

Open `src/index.html` in a browser to watch the animation play (without sound).

## Layout

- `story/script.json` — scenes, narration lines (`*word*` highlights a caption word), sound cues.
- `src/art.js` — drawing kit: characters, props, rooms. `src/scenes.js` — one function per scene.
- `src/engine.js` — captions and the time-driven `frame(t)` renderer.
- `tools/` — narration/audio builder and the frame renderer.

Fonts: Montserrat and Caveat (SIL OFL) via `@fontsource`. Voice: Piper `ru_RU-dmitri-medium`.
