---
name: gen0sec-doctrine-diagram
description: Build Gen0Sec-themed (light) "depth map" diagrams — layered defense-in-depth / military-doctrine / zoned-architecture figures — as generator-driven SVG rasterized to high-res PNG. Use when asked to recreate or design a layered/zoned/echeloned diagram (e.g. military defense layouts, multi-zone network architectures, anything with a depth axis, lateral boundaries, positioned symbols, and converging arrows) in the Gen0Sec design system.
---

# Gen0Sec Doctrine Diagram

Produce **generator-driven** technical diagrams in the Gen0Sec brand palette
(light theme): a Node script builds an SVG string, writes the `.svg`, then
rasterizes to a 2× PNG via `sharp`. This is the established pattern for the
elastic-defense doctrine illustrations and is the right tool for any "depth map":
zones along an axis, lateral boundaries, positioned symbols, brackets, a ruler,
and converging/diverging arrows.

For plain boxes-and-arrows software architecture diagrams that ship as a
self-contained HTML file with an export toolbar, use the **architecture-diagram**
skill instead. Use *this* skill when the figure is a spatial/zoned layout that's
easier to drive from code (computed coordinates, repeated symbols, a scale axis).

## Why a generator, not hand-written SVG

These diagrams have dozens of positioned, repeated elements (unit symbols,
ticks, wavy lines, boundary marks). Hand-writing SVG is error-prone; computing
coordinates in JS from a domain model (e.g. `x(km)`) is far more maintainable and
makes edits ("move unit X", "add a zone") trivial. Always ship the `build-*.mjs`
alongside the output so it stays editable.

## Workflow

1. **Model the domain → coordinates.** Pick a primary axis and write a mapping
   function, e.g. depth `x(km) = MARGIN + (km - MIN) * PX_PER_UNIT`. Decide vertical
   bands/sectors as named y constants.
2. **Copy the template** at `resources/template-generator.mjs` and adapt: palette
   is fixed; change the axis scale, zones, symbols, units, and arrows.
3. **Run it**: `node build-<name>.mjs`. It writes `<name>.svg` and `<name>.png`
   (2× viewBox).
4. **Verify visually.** Read the PNG. Then crop tight regions with `sharp`
   `.extract()` to a temp file and read those — overlaps and overflow are invisible
   at full-zoom. Check: label-on-line collisions, boxes covering arrowheads, text
   past card edges, boundary marks under boxes.
5. **Iterate in the generator**, never by editing the SVG by hand.
6. **Deliver** the PNG with SendUserFile.

## Design system (light theme — do not deviate)

| token | value |
|---|---|
| page / surface | `#ffffff` |
| grid lines | `#e8eaef` |
| border / subtle | `#d5d9e0` |
| text primary / secondary / tertiary | `#1a1d23` / `#5a6178` / `#8b92a5` |
| blue (brand) | `#006fff` |
| cyan / green / purple / orange / red | `#0891b2` / `#16a34a` / `#9333ea` / `#d97706` / `#dc2626` |

- **Font**: declare `font-family="'JetBrains Mono', ui-monospace, monospace"` on the
  root `<svg>` and a `<style>text{...}</style>`. JetBrains Mono is usually **not
  installed**; resvg falls back to DejaVu Sans Mono. Umlauts/accents render fine.
- **Grid background**: a `<pattern id="grid">` of 40px cells in `#e8eaef`, painted
  over a white rect.
- **Eyebrow + title**: `GEN0SEC · DOCTRINE` in faint letter-spaced caps, then a 30px
  bold title, then a 14px secondary subtitle.
- **Footer**: one faint 12px source/attribution line.
- **Color-code by function**, and add a small legend if you use >2 arrow/element types.

## Rendering (sharp via resvg)

`sharp` is borrowed from the landing app — do not install anything:

```js
import { createRequire } from "node:module";
const req = createRequire("/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json");
const sharp = req("sharp");
// rasterize at 2× the viewBox for crisp output:
await sharp(Buffer.from(svg), { density: 200 })
  .resize({ width: W * 2, height: H * 2, fit: "fill" })
  .png({ compressionLevel: 9 })
  .toFile(pngPath);
```

If the sharp path has moved, find it: `ls /home/pigri/work/gen0sec/*/node_modules/.pnpm/ | grep sharp`.

## Spacing rules (learned the hard way — check every time)

- **Halo behind labels on lines/arrows.** Any text crossing a line needs an opaque
  white `<rect>` behind it. **Size the halo to the text** (`halfw = label.length * 4.9 + 16`),
  not a fixed width — fixed widths clip long labels and let the line touch the text.
- **Never let a symbol box cover an arrowhead** or sit *on* a boundary line. Offset the
  box, the arrow endpoint, or the boundary mark so they don't collide.
- **Body text overflow**: in fixed-width cards, ~73 chars at font-size 13 is the ceiling.
  Wrap or shorten.
- **Two-line labels** under symbols: `y = boxBottom + 16 + i*14`, `text-anchor="middle"`.
- After any change, re-crop and re-read the affected region; don't trust full-zoom.

## Reusable building blocks (in the template)

- `x(km)` depth-axis mapper + a depth **ruler** with ticks, abs-value labels, unit suffix,
  and an alternating black/white scale bar.
- **Zone bands**: translucent full-height rects delimiting labeled zones.
- **Wavy vertical lines** (`wavyV`): defensive "positions"/belts via alternating quadratic curves.
- **Lateral boundaries**: dashed horizontal lines carrying echelon marks (e.g. `XX`/`XXX`/`XXXX`)
  with white halos.
- **Top brackets**: `⎴`-style spans labeling super-zones (e.g. Tactical vs Operational).
- **Unit symbols** (`unit({km, cy, type, ech, label, color})`): NATO-ish glyphs —
  infantry (box + X), armor/mech (oval [+ diagonal]), artillery (filled dot), MG (small dot),
  mortar (circle + barrel), SSM (rocket), AT (chevron), antiland (tilde), CP (flag staff).
  Echelon string drawn above; multi-line label below.
- **Converging arrows**: dashed strike/counterstrike fans with colored `marker-end` arrowheads
  (one marker def per color; keep line stroke == arrowhead fill).

## Gen0Sec context

If the diagram is about the Gen0Sec product or the elastic-defense doctrine, read
`/home/pigri/work/gen0sec/docs/elastic-network/CLAUDE.md` first for the authoritative
component model and the CTI-attribution rule (Cerebellum produces CTI, not Cortex).
Two reference "depth map" outputs already exist there under `layers/illustrations/`:
`german-defense.*` (WWI tactical) and `operational-defense.*` (Soviet operational).
