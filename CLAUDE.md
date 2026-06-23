# Elastic-defense doctrine series — working notes

This directory holds the Gen0Sec "elastic network defense" doctrine content: a
5-part article series mapping WWI German *Verteidigung in der Tiefe* onto modern
network defense, plus the diagrams that illustrate it.

## Product / component model (authoritative — do not re-litigate)

Gen0Sec stack, and how it maps onto the 5 doctrine layers:

- **Cerebrum** — the hardware appliance (inline silicon at every site).
  - Edge SKU: 1U, LX2160A, up to 100 Gb/s.
  - Max SKU: 2U, **ECA-6710** (Nvidia MGX / Grace C1 / BlueField-3 DPU, 256 GB LPDDR5).
- **Synapse** — the **orchestrator**: one binary, two modes (**Agent + Proxy**).
  You get the layered defense by *deploying Synapse at multiple points*. The
  pipeline is **capture → detect → decide → execute**, and components are named
  for the signal path through a neuron. In path order:
  - **hillock** — the **kernel data-plane** (eBPF · TC · XDP): packet taps +
    in-kernel enforcement *execution*, ring events, metrics. **First** in the
    path; it executes drops but does **not** decide.
  - **dendrite** — **capture / fingerprint**. JA4+ capture & parse, the **source
    of truth** (FingerprintInfo + decoder buffers). Captures only, enforces
    nothing. Fans out to thalamus, cortex, and amygdala.
  - **thalamus** — **IDS engine** (Suricata-compatible rules, flow tracking →
    threat events). Detection runs **before** enforcement; feeds amygdala.
  - **cortex** — **JA4+ ML classifier** (ONNX inference pool), classify-and-block
    verdict → amygdala. Per-sensor; also ships findings up to Cerebellum.
  - **amygdala** — the **smart firewall / enforcement decision-maker**. wirefilter
    rules over fingerprints; **decides** drops and dispatches to a **multi-backend
    (XDP / nftables / iptables)**. The enforcement loop runs back to hillock.
    Spans L02 (edge) + L03 (main zone).
  - **Proxy mode** — inline **L7** via **Pingora** reverse proxy: TLS
    passthrough/termination, **WAF (wirefilter)**, rate-limit, CAPTCHA, content
    scan, load-balancing → backend. Proxy-mode only.
  - Shared engines: **wirefilter** (rules for amygdala + WAF), **Pingora** (proxy).
  - NB: the synapse-components diagram is **binary-internal** (no Cerebellum).
    Amygdala's wirefilter rules are still fed by Cerebellum CTI at fleet scale.
- **Cerebellum** — the backend platform. The **CTI engine** and the **fleet brain**
  (the Generalstab / Layer 05). Produces CTI verdicts, aggregates telemetry,
  clusters behaviour, generates Thalamus rules + edge policy.
- **Workflow** — SOC + automated response (SOAR), = Layer 04. AI playbooks,
  approves *outcomes* (not alerts) in Slack, auto-pushes blocks fleet-wide.
- **SynapseOS** — the OS under Cerebrum.

### CTI attribution rule (the #1 thing we keep getting wrong)

**Cerebellum produces CTI. Cortex does NOT.** Cortex is Synapse-local ML that
feeds findings *up* to Cerebellum; it never touches the CTI pipeline directly.
Layer 05 = Cerebellum, with Cortex feeding it from below. Because edge Synapse
also runs Cortex, **L02 feeds L05** (the edge is also a forward observer).

## Layer map

- **01 Forward observation** — *Vorpostenlinie* / outpost. CTI (Cerebellum), honeynets, canaries, Dendrite capture.
- **02 Forward defensive belt** — *Vorfeldzone* / the edge. Cerebrum + Synapse; dendrite captures, thalamus/cortex detect, **amygdala decides** drops (executed in-kernel by hillock / nftables / iptables), WAF in Pingora proxy mode, Cortex feeds L05.
- **03 Main defensive zone** — *Hauptkampffeld*. Thalamus IDS + cortex feed amygdala (deeper context); amygdala decides east-west microseg drops, executed by hillock.
- **04 Reserves / counterattack** — *Eingreifdivision*. Workflow (SOC/SOAR).
- **05 Intelligence / adaptation** — *Generalstab*. Cerebellum (fleet brain); Cortex feeds it.

## Files

- `articles/NN-*.md` — the five layer articles. Build HTML: `cd articles && node build-articles.mjs`.
- `article-draft.md` (+ `.html` via `node md-to-html.mjs`) — the overview essay. **A byte-identical duplicate lives in `../elastic-defense/` — keep both in sync.**
- `elastic-defense-comparison.svg` — master 2-column (military vs network) comparison. Render: `node render.mjs` → 1600, 1080×1350, and 3200 (2×) PNGs.
- `build-layers.mjs` — generates the five per-layer cards. `layers/illustrations/` holds the figure SVGs/PNGs + their `build-*.mjs` generators and `render.mjs`.

## Writing voice (match this for any article / post in this series)

The brief, in the user's words: **"not too marketing, not chatgpt, human."** What
that means concretely, derived from the existing articles:

- **Structure per layer article**: open with concrete *history* (real dates, units,
  doctrine — "By the autumn of 1916…"), then a **"The technical version"** section
  (vendor-neutral), then **"How Gen0Sec implements …"**. End with a `## Historical
  sources` list and a one-line series footer.
- **Declarative and opinionated.** Short, load-bearing sentences. Make the claim, then
  back it ("a perfect perimeter is just a more expensive way to lose"). It's fine to be
  blunt ("anyone who tells you the perimeter is the answer hasn't been compromised yet").
- **The throughline is doctrine**: *swap the technology, keep the invariants.* Tie
  modern security back to the 1916–18 German elastic-defense idea; carry German terms in
  *italics* with a translation on first use (*Vorfeldzone*, *Hauptkampffeld*, *Eingreifdivision*).
- **Section pattern that works**: "A useful Layer N has four properties." then bolded
  lead-ins (**It is wire-speed.** …). Use sparingly, not as filler.
- **Banned (the "chatgpt" smell)**: no "In today's fast-paced world", no "Let's dive in",
  no "It's important to note", no breathless adjective stacks, no emoji, no listicle padding,
  no summary-of-what-I-just-said paragraphs. Don't hedge everything; commit to the claim.
- **Banned (the "marketing" smell)**: no superlatives without substance, no "revolutionary/
  cutting-edge/seamless", no feature-dump. Product claims are specific and falsifiable
  (sub-microsecond verdicts, eBPF/XDP, fleet-wide push in ms), never vibes.
- **Voice**: second person at the reader ("your edge") is fine; first-person plural for
  Gen0Sec ("we built…"). British-ish spelling is already in use (analyse, canalise) — keep
  whatever a given file uses, consistently.
- **Historical accuracy matters** — get the dates/offensives right (e.g. the Hundred Days
  Offensive is Aug–Nov 1918; the German Spring Offensive is March 1918). Cite real sources.

For LinkedIn/Instagram posts: same "human, not marketing, not chatgpt" rule, shorter, no
hashtag spam, lead with a concrete hook not a thesis statement.

## Diagram build conventions

See the **`gen0sec-doctrine-diagram` skill** (`~/.claude/skills/gen0sec-doctrine-diagram/`)
for the full recipe. Quick reference:

- Diagrams are **generator-driven**: a `build-*.mjs` constructs an SVG string in JS,
  writes `.svg`, then rasterizes to `.png` at **2× the viewBox** via `sharp` (resvg backend).
- `sharp` is borrowed from the landing app: `createRequire(".../core/landing/node_modules/.pnpm/sharp@0.34.5/.../package.json")`.
- Fonts: SVGs declare `'JetBrains Mono', ui-monospace, monospace`. JetBrains Mono is
  **not installed** — resvg falls back to DejaVu Sans Mono. Umlauts (ä ö ü) render fine.
- Light theme only. Palette: bg `#ffffff`, grid `#e8eaef`, ink `#1a1d23`, sub `#5a6178`,
  faint `#8b92a5`, line `#d5d9e0`; accents blue `#006fff`, cyan `#0891b2`, green `#16a34a`,
  purple `#9333ea`, orange `#d97706`, red `#dc2626`.
- Spacing lessons learned the hard way:
  - Master-diagram body text overflows past ~73 chars at font-size 13; keep lines short.
  - Put a white halo `<rect>` behind any label that sits on a line/arrow, and **size the
    halo to the label length** (`label.length * ~4.9 + pad`), not a fixed width.
  - Don't let unit boxes sit on boundary lines or cover arrowheads — offset one or the other.

## Reference layout diagrams (the "depth map" style)

- `layers/illustrations/german-defense.{svg,png}` — WWI German tactical layout (depth in km
  to the Eingreif divisions). Terminology matches the articles. **Use this as the doctrine lead diagram.**
- `layers/illustrations/operational-defense.{svg,png}` — Soviet Cold-War *operational* layout
  (300 km depth, Army-Group/SSM/MOD). The "same doctrine, larger scale" companion — note it is
  NOT WWI German, so its labels won't match the articles.
