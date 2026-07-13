# CLAUDE.md — Elastic Network Defense voiceovers

Context for producing article voiceovers for the **Elastic Defense** Substack
series (gen0sec.substack.com). This folder holds the generator script and the
conventions below. When asked to "make a voiceover" for one of these articles,
follow this document.

## What we're doing

Each article in the series becomes a set of MP3 clips — **one clip per section** —
narrated by a single professional American male voice, then optionally
concatenated into one file. Splitting by section keeps each TTS request small
(no timeouts), makes fixes cheap (regenerate one clip, not the whole article),
and lets us drop sections (e.g. the bibliography) from the final cut.

## Voice & model

- **Voice:** Brian — deep, authoritative US male narrator.
  `voice_id = nPczCjzI2devNBz1zQrb`
- **Model:** `eleven_multilingual_v2` (reliable long-form narration up to ~10k
  chars; handles the German doctrinal terms in this series acceptably).
- Keep each clip **under ~3,500 characters**. Split longer sections into
  sub-clips (A/B/C).

## Source text: what to STRIP

Pull the article body and remove everything that isn't prose meant to be read:

- Share / Subscribe buttons, "Subscribe now", "Subscribe to Gen0Sec".
- The "I want a demo!" CTA and any other button label.
- Byline and date (e.g. "DAVID AND GEN0SEC · JUL 13, 2026").
- Cross-links like "the original story can be read here".
- Image captions (e.g. "Fake tank…", "Star Wars — honeypot…", the "Layer 0X"
  labels, "The doctrine").
- UI card labels with no readable content ("Verdict", "Raw verdict").
- The `TLP:CLEAR — approved for public distribution.` marking.
- Footer boilerplate ("A guest post by…", "By subscribing you agree…").

**De-duplicate:** the page text sometimes renders a section twice (an infographic
transcription plus the prose). Read it once. (This bit us on the doctrine article:
"The invariants are the point" and "What this changes" shared four identical
paragraphs.)

## Source text: pronunciation conventions

TTS mangles bare acronyms and figures. Rewrite before generating:

- **"WAF" → "web application firewall"** every time. (This is the single most
  common miss — check for it specifically.)
- Spell out acronyms letter-by-letter with hyphens: `C-T-I`, `D-N-S`, `T-L-S`,
  `T-C-P`, `H-T-T-P`, `X-D-P`, `e-B-P-F`, `I-D-S`, `I-P-S`, `A-S-N`, `S-N-I`,
  `A-L-P-N`, `M-S-S`, `T-T-L`, `C-D-N`, `S-S-H`, `D-P-U(s)`, `I-P(s)`,
  `L-three / L-four / L-seven`.
- `ML` → "machine-learning"; `MITM` → "man-in-the-middle".
- Numbers as words in context: `90%` → "ninety percent"; `300,000` → "three
  hundred thousand"; `0.94` → "zero point nine four"; `43,200` → "forty-three
  thousand two hundred"; `/24` → "slash twenty-four"; `1U/2U` → "one-U/two-U";
  `Grace C1` → "Grace C-one"; `BlueField-3` → "BlueField-three";
  `0400` → "oh-four-hundred".
- Product/anatomy names stay as written: Synapse, Cerebrum, Cerebellum, Cortex,
  Thalamus, Hillock, Amygdala, Dendrite, JA4 / JA4-plus / JA4-T / JA4-H / JA4-S /
  JA4-S-S-H / JA4-L / JA4-L-S / JA4-X.
- Fix obvious typos in the source and note them to the author (e.g. "It made the
  enemy **disclose** his capability"; "stop the attack here, **definitively**").

## Sections & ordering (typical)

1. Title & subtitle
2. "A short history of …" (the WWI framing)
3. "The technical version" (usually split A/B/C: components+mistake / the
   properties / the no-decrypt property + reverse-order intel)
4. "How Gen0Sec implements Layer 0X" (split into several: hardware+binary,
   the-edge-learns, component pairs, WAF/JA4+/cost)
5. "What the edge / CTI actually …" (the verdict/fingerprint walkthrough, often 2)
6. Historical sources (bibliography)
7. Series closing note ("This is part X of a five-part series …")

Keep the **series closing note as its own clip**, separate from Historical
sources, so the sources clip can be dropped while still ending on the wrap-up
line. (The author generally prefers to **skip the bibliography** from the audio.)

## Naming convention

`{prefix}_{NN}_{slug}.mp3`, zero-padded so they sort correctly:
`layer03_01_title.mp3`, `layer03_02_short-history.mp3`, …
The script produces these automatically from `NN_slug.txt` input files.

## Running the script

```bash
export ELEVENLABS_API_KEY=sk_...
# ./sections holds one cleaned .txt per section: 01_title.txt, 02_short-history.txt, ...
python generate_voiceover.py \
    --input sections \
    --outdir out \
    --prefix layer03 \
    --concat layer03_main_defensive_zone_full.mp3 \
    --skip-sources
```

- `--dry-run` lists clips and char counts (flags anything over 3,500) without
  calling the API — use it to sanity-check splits first.
- `--normalize` applies the conservative acronym map in the script, but still
  read the output; it won't catch numbers, typos, or context.
- Omit `--concat` to just generate clips (the author often reviews first, then
  concatenates separately).

## Concatenation (manual, if not using --concat)

```bash
cd out
for f in layer03_[0-9][0-9]_*.mp3; do echo "file '$f'"; done > parts.txt
ffmpeg -f concat -safe 0 -i parts.txt -c copy layer03_full.mp3
```

`-c copy` = no re-encode, no quality loss. The "non monotonically increasing
dts" warnings are cosmetic; the file plays fine. For a warning-free file,
re-encode instead: `-c:a libmp3lame -b:a 128k`.

## Gotchas

- **Per-key quota, not account balance.** A 401 `quota_exceeded` that names the
  API key means that key has its own credit cap (e.g. 20,000) below the account
  total. Fix in ElevenLabs → Settings → API Keys (raise/remove the key's limit).
- **Character limit per request.** Stay under ~3,500 chars/clip; a single
  ~9,000-char request timed out in practice.
- **Re-check "WAF"** in every article before shipping — it recurs and is easy to
  miss.
