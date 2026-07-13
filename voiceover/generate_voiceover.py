#!/usr/bin/env python3
"""
generate_voiceover.py — Elastic Network Defense article voiceovers (Gen0Sec)

Turns a folder of cleaned, per-section text files into numbered MP3 clips using
ElevenLabs TTS, then (optionally) concatenates them into a single file with
ffmpeg. This codifies the workflow used for the "Elastic Defense" Substack
series: one clip per section, Brian narrator voice, no re-encoding on concat.

--------------------------------------------------------------------------------
QUICK START
--------------------------------------------------------------------------------
    export ELEVENLABS_API_KEY=sk_...            # key with enough per-key quota
    # Put one cleaned .txt file per section in ./sections, named NN_slug.txt:
    #   01_title.txt  02_short-history.txt  03_technical-components.txt  ...
    python generate_voiceover.py \
        --input sections \
        --outdir out \
        --prefix layer03 \
        --concat layer03_main_defensive_zone_full.mp3 \
        --skip-sources          # leave the bibliography clip out of the concat

Output clips are named:  {prefix}_{NN}_{slug}.mp3  (e.g. layer03_02_short-history.mp3)

--------------------------------------------------------------------------------
INPUT FILES
--------------------------------------------------------------------------------
Each .txt file is ONE clip. The file's whole contents become the narration for
that clip. Files are processed in sorted filename order, so zero-pad the leading
number (01, 02, ... 13). The slug is derived from the filename (the leading
number and extension are stripped).

Text should already be cleaned per CLAUDE.md (strip buttons / "Subscribe" /
captions / byline / TLP marking; spell out acronyms and numbers; write "WAF" as
"web application firewall", etc.). The optional --normalize pass applies a
conservative set of pronunciation replacements but is NOT a substitute for a
manual read-through.

--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
* Keep each clip under ~3,500 characters. Very long single requests can time out
  and cost more; splitting by section is the whole point.
* Per-key quota gotcha: an ElevenLabs API key can carry its own credit cap that
  is lower than the account balance. A 401 "quota_exceeded" naming the key means
  raise/remove that key's limit in Settings -> API Keys, not top up the account.
* The ffmpeg concat step stream-copies (-c copy): no quality loss, and the
  "non monotonically increasing dts" lines it prints are harmless.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import subprocess
import tempfile
from pathlib import Path

import requests

# ----- Defaults (the series conventions) -------------------------------------
DEFAULT_VOICE_ID = "nPczCjzI2devNBz1zQrb"      # "Brian" — deep, authoritative US male
DEFAULT_MODEL_ID = "eleven_multilingual_v2"    # reliable long-form narration, up to 10k chars
API_BASE = "https://api.elevenlabs.io/v1/text-to-speech"
MAX_CHARS_WARN = 3500

# Conservative, opt-in pronunciation replacements (word-boundary anchored).
# Review output after using --normalize; automated substitution can miss context.
NORMALIZE_MAP = {
    r"\bWAF\b": "web application firewall",
    r"\bWAFs\b": "web application firewalls",
    r"\bCTI\b": "C-T-I",
    r"\bIP\b": "I-P",
    r"\bIPs\b": "I-Ps",
    r"\bDNS\b": "D-N-S",
    r"\bTLS\b": "T-L-S",
    r"\bTCP\b": "T-C-P",
    r"\bHTTP\b": "H-T-T-P",
    r"\bXDP\b": "X-D-P",
    r"\beBPF\b": "e-B-P-F",
    r"\bIDS\b": "I-D-S",
    r"\bIPS\b": "I-P-S",
    r"\bEDR\b": "E-D-R",
    r"\bAPT\b": "A-P-T",
    r"\bIOC\b": "I-O-C",
    r"\bASN\b": "A-S-N",
    r"\bSNI\b": "S-N-I",
    r"\bALPN\b": "A-L-P-N",
    r"\bMSS\b": "M-S-S",
    r"\bTTL\b": "T-T-L",
    r"\bCDN\b": "C-D-N",
    r"\bSSH\b": "S-S-H",
    r"\bDPU\b": "D-P-U",
    r"\bDPUs\b": "D-P-Us",
    r"\bL3\b": "L-three",
    r"\bL4\b": "L-four",
    r"\bL7\b": "L-seven",
    r"\bML\b": "machine-learning",
    r"\bMITM\b": "man-in-the-middle",
}


def slug_from_filename(path: Path) -> str:
    stem = path.stem
    stem = re.sub(r"^\d+[_-]?", "", stem)   # drop leading number + separator
    stem = re.sub(r"[^A-Za-z0-9]+", "-", stem).strip("-").lower()
    return stem or "clip"


def normalize_text(text: str) -> str:
    for pattern, repl in NORMALIZE_MAP.items():
        text = re.sub(pattern, repl, text)
    return text


def synthesize(text: str, out_path: Path, voice_id: str, model_id: str,
               api_key: str) -> None:
    url = f"{API_BASE}/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True,
        },
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=300)
    if resp.status_code == 401:
        # Surface the quota / auth detail clearly — this is the common failure.
        try:
            detail = resp.json().get("detail", resp.text)
        except Exception:
            detail = resp.text
        raise RuntimeError(
            f"401 from ElevenLabs: {detail}\n"
            "If this says 'quota_exceeded' and names an API key, raise or remove "
            "that key's credit limit in Settings -> API Keys (the account balance "
            "is not the constraint — the per-key cap is)."
        )
    resp.raise_for_status()
    out_path.write_bytes(resp.content)


def concat_with_ffmpeg(clips: list[Path], output: Path) -> None:
    if not clips:
        print("Nothing to concat.", file=sys.stderr)
        return
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as tf:
        for c in clips:
            # ffmpeg concat demuxer: single quotes escaped as needed
            safe = str(c.resolve()).replace("'", r"'\''")
            tf.write(f"file '{safe}'\n")
        list_path = tf.name
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0",
             "-i", list_path, "-c", "copy", str(output)],
            check=True,
        )
        print(f"\nConcatenated {len(clips)} clips -> {output}")
    finally:
        os.unlink(list_path)


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate ElevenLabs voiceover clips per section.")
    ap.add_argument("--input", required=True, help="Directory of cleaned per-section .txt files (NN_slug.txt).")
    ap.add_argument("--outdir", default="out", help="Where to write the .mp3 clips.")
    ap.add_argument("--prefix", default="voiceover", help="Filename prefix, e.g. 'layer03'.")
    ap.add_argument("--voice", default=DEFAULT_VOICE_ID, help="ElevenLabs voice id (default: Brian).")
    ap.add_argument("--model", default=DEFAULT_MODEL_ID, help="ElevenLabs model id.")
    ap.add_argument("--concat", metavar="FILE", help="If set, concat all generated clips into FILE.")
    ap.add_argument("--skip-sources", action="store_true",
                    help="Exclude clips whose slug contains 'sources' from the concat (they are still generated).")
    ap.add_argument("--normalize", action="store_true",
                    help="Apply the conservative pronunciation replacement map (review the result).")
    ap.add_argument("--dry-run", action="store_true", help="List what would be generated, call no API.")
    args = ap.parse_args()

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key and not args.dry_run:
        print("ERROR: set ELEVENLABS_API_KEY in your environment.", file=sys.stderr)
        return 2

    in_dir = Path(args.input)
    if not in_dir.is_dir():
        print(f"ERROR: input directory not found: {in_dir}", file=sys.stderr)
        return 2

    txt_files = sorted(in_dir.glob("*.txt"))
    if not txt_files:
        print(f"ERROR: no .txt files in {in_dir}", file=sys.stderr)
        return 2

    out_dir = Path(args.outdir)
    out_dir.mkdir(parents=True, exist_ok=True)

    generated: list[Path] = []
    for i, txt in enumerate(txt_files, start=1):
        slug = slug_from_filename(txt)
        out_name = f"{args.prefix}_{i:02d}_{slug}.mp3"
        out_path = out_dir / out_name
        text = txt.read_text(encoding="utf-8").strip()
        if args.normalize:
            text = normalize_text(text)
        n = len(text)
        flag = "  <-- LONG, consider splitting" if n > MAX_CHARS_WARN else ""
        print(f"[{i:02d}] {txt.name} -> {out_name}  ({n} chars){flag}")
        if args.dry_run:
            continue
        try:
            synthesize(text, out_path, args.voice, args.model, api_key)
        except Exception as e:  # noqa: BLE001 — surface and stop; partial output kept
            print(f"\nFAILED on {txt.name}: {e}", file=sys.stderr)
            return 1
        generated.append(out_path)

    if args.dry_run:
        print("\nDry run complete — no audio generated.")
        return 0

    if args.concat:
        clips = generated
        if args.skip_sources:
            clips = [c for c in clips if "sources" not in c.stem]
        concat_with_ffmpeg(clips, Path(args.concat))

    print(f"\nDone. {len(generated)} clips in {out_dir}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())