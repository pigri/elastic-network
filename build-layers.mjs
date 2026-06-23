// Generate four standalone Elastic Defense layer images.
// Cards size to fit their content + uniform breathing room — no dead air.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
const sharp = req("sharp");

const W = 1600;

/** @typedef {{ title: string, body1: string, body2: string, tag: string }} Card */
/** @typedef {{
 *   num: string, slug: string, name: string, headline: string, eyebrow: string,
 *   color: string, fill: string,
 *   mil: Card, net: Card,
 *   invariant: string,
 * }} Layer
 */

/** @type {Layer[]} */
const layers = [
  {
    num: "01", slug: "forward-observation", name: "Forward observation",
    headline: "Screen, see, warn.", eyebrow: "LAYER 01 · OUTPOST LINE",
    color: "#0891b2", fill: "rgba(8,145,178,0.08)",
    mil: {
      title: "Outpost line",
      body1: "Light recon, screening cavalry, listening posts. Far forward of the main line.",
      body2: "Job: spot the attack early. Survive long enough to report. Slow them.",
      tag: "\"Vorpostenlinie\" · cavalry vedettes · LP/OP",
    },
    net: {
      title: "External signal & deception",
      body1: "Dendrite captures every flow on the sensor. Threat intel feeds, honeypots, canary tokens, JA4+ telemetry.",
      body2: "Job: see the attack before it touches your perimeter. Tip Cerebellum, which aggregates it into CTI.",
      tag: "Dendrite (capture) · Cerebellum CTI · honeynets · canaries · DNS sinkholes",
    },
    invariant: "The point of the outpost is the warning, not the report.",
  },
  {
    num: "02", slug: "forward-defensive-belt", name: "Forward defensive belt",
    headline: "First shock absorber.", eyebrow: "LAYER 02 · THE EDGE",
    color: "#d97706", fill: "rgba(217,119,6,0.08)",
    mil: {
      title: "Forward defensive belt",
      body1: "Wire entanglements, prepared MG nests, mortar TRPs, minefields.",
      body2: "Job: break up assault waves. Cheap, attritional, expendable on purpose.",
      tag: "\"Vorfeldzone\" / outpost zone",
    },
    net: {
      title: "Cerebrum + Synapse — the edge",
      body1: "Amygdala decides on JA4+ & CTI; Hillock executes in XDP. WAF in Pingora proxy. DDoS shed.",
      body2: "Job: kill obvious traffic at wire speed; tag the rest. Cortex also runs here and feeds L05.",
      tag: "Amygdala (decides) · Hillock (kernel) · WAF (proxy) · Thalamus · Cortex",
    },
    invariant: "Wire-speed and stupid on purpose. The forward belt only works if it stays cheap.",
  },
  {
    num: "03", slug: "main-defensive-zone", name: "Main defensive zone",
    headline: "The kill zone. Depth as a weapon.", eyebrow: "LAYER 03 · HAUPTKAMPFFELD",
    color: "#dc2626", fill: "rgba(220,38,38,0.07)",
    mil: {
      title: "Hauptkampflinie — main battle line",
      body1: "Layered trench systems, interlocking fields of fire, depth in km, not m.",
      body2: "Job: bleed the attacker. Identify their schwerpunkt. Channel them into traps.",
      tag: "\"Hauptkampffeld\" / main fighting area",
    },
    net: {
      title: "Inline IDS / IPS inspection",
      body1: "Thalamus IDS — Suricata-grade rules, app-layer parsers, flow tracking, east-west microseg.",
      body2: "Job: classify what survived the edge. Amygdala fingerprint-blocks; Thalamus marks or routes.",
      tag: "Thalamus IDS · Amygdala (JA4+ block) · Suricata · east-west microseg · NDR",
    },
    invariant: "Every workload boundary is another wall. Microseg is depth.",
  },
  {
    num: "04", slug: "reserves-counterattack", name: "Reserves & counterattack",
    headline: "Retake the initiative.", eyebrow: "LAYER 04 · EINGREIFDIVISION",
    color: "#9333ea", fill: "rgba(147,51,234,0.08)",
    mil: {
      title: "Eingreif divisions — mobile reserves",
      body1: "Held in depth. Armoured / motorised. Strike when the attacker is overextended.",
      body2: "Job: restore the line. Punish penetrations. Retake ground.",
      tag: "\"Eingreifdivisionen\" / counterattack force",
    },
    net: {
      title: "Workflow — SOC + automated response",
      body1: "AI-powered playbooks. Standalone, or wired into your SOAR / SIEM. Approve outcomes in Slack.",
      body2: "Job: auto-push blocks across Cerebrum sensors and Synapse agents. Cap blast radius in ms.",
      tag: "Workflow · AI playbooks · SOAR/SIEM · Cerebrum + Synapse auto-block",
    },
    invariant: "Don't fight from the line. Counterstrike from depth, with decisive force.",
  },
  {
    num: "05", slug: "intelligence-adaptation", name: "Intelligence & adaptation",
    headline: "Learn. Predict. Adapt.", eyebrow: "LAYER 05 · GENERAL STAFF",
    color: "#16a34a", fill: "rgba(22,163,74,0.08)",
    mil: {
      title: "Generalstab — operational intelligence",
      body1: "Maps the whole front. Cross-correlates prisoner reports, intercepted comms, aerial recon.",
      body2: "Job: predict the next schwerpunkt. Plan the counter-operation. Rewrite the doctrine.",
      tag: "Generalstab · OKH · operational intelligence · doctrine writers",
    },
    net: {
      title: "Cerebellum — fleet intelligence",
      body1: "The backend that sees every sensor at once: cross-site correlation, CTI, threat prediction.",
      body2: "Job: feed Thalamus rules, sharpen Workflow, push the lessons to the whole fleet.",
      tag: "Cerebellum · cross-site correlation · CTI · rule generation · Cortex feeds up",
    },
    invariant: "Learn from every fight. Push the lessons forward to every other layer.",
  },
];

// ─── Layout constants ──────────────────────────────────────────────────
const PAD_X = 60;
const CARD_W = (W - 3 * PAD_X) / 2; // two cards side by side with PAD_X gutter
const CARD_INNER_PAD = 28;
const BODY_FONT = 16;
const BODY_LH = 22;
const TITLE_FONT = 22;
const TAG_FONT = 14;
const GAP_TITLE = 28;     // gap from title baseline to first body line baseline
const GAP_PARA = 18;      // gap between body1 last line and body2 first line
const GAP_TAG = 24;       // gap between body2 last line and tag baseline

// Approximate monospace char width. JetBrains Mono rendered through resvg
// runs ~0.64em wide; 0.60 was still letting borderline lines spill past the
// card edge on Layer 01 and Layer 03.
const CHAR_W = BODY_FONT * 0.64;

/** Word-wrap into an array of line strings. */
function wrapLines(text, maxWidth, charW = CHAR_W) {
  const maxChars = Math.floor(maxWidth / charW);
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (cand.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cand;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Compute card content height given wrapped bodies. */
function cardHeight(body1Lines, body2Lines) {
  return (
    CARD_INNER_PAD +
    TITLE_FONT +
    GAP_TITLE +
    body1Lines * BODY_LH +
    GAP_PARA +
    body2Lines * BODY_LH +
    GAP_TAG +
    TAG_FONT +
    CARD_INNER_PAD
  );
}

/** Render lines as <text> elements at a fixed x; returns SVG + new y after last line. */
function renderLines(lines, x, y, fontSize, fill) {
  let cursor = y;
  const out = lines
    .map((line, i) => {
      const yy = cursor + i * BODY_LH;
      return `<text x="${x}" y="${yy}" fill="${fill}" font-size="${fontSize}">${escape(line)}</text>`;
    })
    .join("\n  ");
  const endY = y + (lines.length - 1) * BODY_LH;
  return { svg: out, endY };
}

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const CARDS_Y = 290;

/** Compute per-card height (sized exactly to its body lines). */
function cardHeightFor(card) {
  const innerW = CARD_W - CARD_INNER_PAD * 2;
  const b1 = wrapLines(card.body1, innerW).length;
  const b2 = wrapLines(card.body2, innerW).length;
  return Math.ceil(cardHeight(b1, b2));
}

/** Tallest of the two cards in a layer — drives canvas height. */
function layerMaxHeight(L) {
  return Math.max(cardHeightFor(L.mil), cardHeightFor(L.net));
}

function buildSVG(L) {
  const innerW = CARD_W - CARD_INNER_PAD * 2;
  const milH = cardHeightFor(L.mil);
  const netH = cardHeightFor(L.net);
  const maxH = Math.max(milH, netH);
  const FOOTER_Y = CARDS_Y + maxH + 60;
  const H = FOOTER_Y + 130;

  const renderCard = (card, x0, cardH) => {
    const titleY = CARDS_Y + CARD_INNER_PAD + TITLE_FONT;
    const body1Lines = wrapLines(card.body1, innerW);
    const body2Lines = wrapLines(card.body2, innerW);

    const body1Y = titleY + GAP_TITLE;
    const body1 = renderLines(body1Lines, x0 + CARD_INNER_PAD, body1Y, BODY_FONT, "#5a6178");

    const body2yStart = body1.endY + GAP_PARA + BODY_LH;
    const body2 = renderLines(body2Lines, x0 + CARD_INNER_PAD, body2yStart, BODY_FONT, "#5a6178");

    const tagY = body2.endY + GAP_TAG + TAG_FONT;

    return `
  <rect x="${x0}" y="${CARDS_Y}" width="${CARD_W}" height="${cardH}" rx="14" fill="${L.fill}" stroke="${L.color}" stroke-width="1.5"/>
  <text x="${x0 + CARD_INNER_PAD}" y="${titleY}" fill="#1a1d23" font-size="${TITLE_FONT}" font-weight="700">${escape(card.title)}</text>
  ${body1.svg}
  ${body2.svg}
  <text x="${x0 + CARD_INNER_PAD}" y="${tagY}" fill="${L.color}" font-size="${TAG_FONT}" font-style="italic">${escape(card.tag)}</text>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">
  <style>text { font-family: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace; }</style>
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e8eaef" stroke-width="0.5"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <text x="${PAD_X}" y="56" fill="#8b92a5" font-size="16" letter-spacing="6" font-family="Orbitron, 'JetBrains Mono', monospace" font-weight="600">GEN0SEC · DOCTRINE</text>

  <rect x="${PAD_X}" y="100" width="80" height="80" rx="12" fill="${L.color}"/>
  <text x="${PAD_X + 40}" y="158" fill="#ffffff" font-size="36" font-weight="700" text-anchor="middle">${L.num}</text>

  <text x="${PAD_X + 100}" y="128" fill="${L.color}" font-size="15" letter-spacing="4" font-weight="600">${escape(L.eyebrow)}</text>
  <text x="${PAD_X + 100}" y="168" fill="#1a1d23" font-size="36" font-weight="700" letter-spacing="-0.01em">${escape(L.headline)}</text>

  <rect x="${PAD_X}" y="220" width="${CARD_W}" height="48" rx="6" fill="rgba(90,97,120,0.06)" stroke="#5a6178" stroke-width="1.2"/>
  <text x="${PAD_X + CARD_W / 2}" y="251" fill="#1a1d23" font-size="18" font-weight="700" text-anchor="middle">MILITARY DOCTRINE</text>

  <rect x="${PAD_X * 2 + CARD_W}" y="220" width="${CARD_W}" height="48" rx="6" fill="rgba(0,111,255,0.06)" stroke="#006fff" stroke-width="1.2"/>
  <text x="${PAD_X * 2 + CARD_W + CARD_W / 2}" y="251" fill="#006fff" font-size="18" font-weight="700" text-anchor="middle">ELASTIC NETWORK DEFENSE</text>

  ${renderCard(L.mil, PAD_X, milH)}
  ${renderCard(L.net, PAD_X * 2 + CARD_W, netH)}

  <line x1="${PAD_X}" y1="${FOOTER_Y - 10}" x2="${W - PAD_X}" y2="${FOOTER_Y - 10}" stroke="#e8eaef" stroke-width="1"/>
  <text x="${PAD_X}" y="${FOOTER_Y + 30}" fill="#0f172a" font-size="13" letter-spacing="3" font-weight="700">DOCTRINE</text>
  <text x="${PAD_X}" y="${FOOTER_Y + 62}" fill="#1a1d23" font-size="22" font-weight="500" letter-spacing="-0.01em">${escape(L.invariant)}</text>
</svg>`;
}

const outDir = path.join(here, "layers");
await mkdir(outDir, { recursive: true });

console.log(`Rendering per-layer images:`);
for (const L of layers) {
  const cardH = layerMaxHeight(L);
  const h = CARDS_Y + cardH + 60 + 130;
  const svg = buildSVG(L);
  const svgPath = path.join(outDir, `layer-${L.num}-${L.slug}.svg`);
  const pngPath = path.join(outDir, `layer-${L.num}-${L.slug}.png`);
  await writeFile(svgPath, svg);
  await sharp(Buffer.from(svg), { density: 200 })
    .resize({ width: W, height: h, fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log(`  layer-${L.num}-${L.slug}.png  (card ${cardH}px, canvas ${W}×${h})`);
}
