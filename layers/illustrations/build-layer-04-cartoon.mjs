// Layer 04 military cartoon — the Eingreifdivision (intervention/counterattack
// divisions, 1917). Held in operational depth; committed in mass at the decisive
// moment against an exhausted penetration. Same visual language as L01–L03 cartoons.
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const SHARP_PKGS = [
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
  "/Users/davidpapp/Tresorit/Projects/enterprise/src/kapnative/cf-integration/node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/package.json",
];
const req = createRequire(SHARP_PKGS.find(existsSync) ?? SHARP_PKGS[0]);
const sharp = req("sharp");

const W = 1600, H = 900;
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", grid: "#e8eaef", line: "#d5d9e0", purple: "#9333ea", green: "#16a34a", red: "#dc2626" };
const GY = 600;

const o = [];
const P = (s) => o.push(s);
const halo = (xc, y, w, h = 16) => P(`<rect x="${xc - w / 2}" y="${y - 12}" width="${w}" height="${h}" fill="#ffffff" opacity="0.92"/>`);
function soldier(x, color, scale = 1, lean = 0) {
  P(`<g transform="translate(${x},${GY}) scale(${scale}) rotate(${lean})" stroke="${color}" stroke-width="2" fill="${color}"><circle cx="0" cy="-22" r="4"/><line x1="0" y1="-18" x2="0" y2="-8"/><line x1="0" y1="-14" x2="-6" y2="-10"/><line x1="0" y1="-14" x2="6" y2="-10"/><line x1="0" y1="-8" x2="-5" y2="0"/><line x1="0" y1="-8" x2="5" y2="0"/></g>`);
}
function trench(x0, x1, color, w = 2.5) {
  let d = `M ${x0} ${GY + 5}`, up = true;
  for (let x = x0 + 25; x <= x1; x += 25) { d += ` L ${x} ${GY + (up ? 22 : 5)}`; up = !up; }
  P(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`);
}

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="arr-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`  <marker id="arr-purple" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.purple}"/></marker>`);
P(`  <marker id="arr-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${C.sub}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// HEADER
P(`<text x="60" y="56" fill="${C.faint}" font-size="16" letter-spacing="6" font-weight="600">GEN0SEC · DOCTRINE</text>`);
P(`<rect x="60" y="100" width="68" height="68" rx="10" fill="${C.purple}"/>`);
P(`<text x="94" y="144" fill="#ffffff" font-size="28" font-weight="700" text-anchor="middle">04</text>`);
P(`<text x="148" y="124" fill="${C.purple}" font-size="14" letter-spacing="4" font-weight="600">LAYER 04 · RESERVES &amp; COUNTERATTACK — 1917</text>`);
P(`<text x="148" y="158" fill="${C.ink}" font-size="32" font-weight="700">Held back, then committed in mass.</text>`);
P(`<text x="148" y="190" fill="${C.sub}" font-size="16">The Eingreifdivision waits in depth and strikes the exhausted penetration at the decisive moment.</text>`);

// ZONE LABELS
P(`<text x="250" y="246" fill="${C.red}" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">SPENT ASSAULT</text>`);
P(`<text x="760" y="246" fill="${C.green}" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">HAUPTKAMPFFELD · BENT, NOT BROKEN</text>`);
P(`<text x="1380" y="246" fill="${C.purple}" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">EINGREIF · RESERVES IN DEPTH</text>`);

P(`<line x1="420" y1="260" x2="420" y2="720" stroke="${C.line}" stroke-width="1" stroke-dasharray="6,6"/>`);
P(`<line x1="980" y1="260" x2="980" y2="720" stroke="${C.line}" stroke-width="1" stroke-dasharray="6,6"/>`);

// GROUND
P(`<line x1="40" y1="${GY}" x2="1560" y2="${GY}" stroke="${C.ink}" stroke-width="2"/>`);

// SPENT ASSAULT entering from far left
P(`<line x1="60" y1="430" x2="300" y2="430" stroke="${C.red}" stroke-width="4" marker-end="url(#arr-red)" opacity="0.7"/>`);
halo(180, 416, 150, 16);
P(`<text x="180" y="428" fill="${C.red}" font-size="12" font-weight="700" text-anchor="middle">assault, now spent</text>`);

// PENETRATION salient bulging into the depth (red)
P(`<polygon points="420,440 700,478 770,540 700,602 420,560" fill="rgba(220,38,38,0.08)" stroke="${C.red}" stroke-width="1.4" stroke-dasharray="5,4"/>`);
// exhausted attackers inside the salient (one fallen)
soldier(500, C.red, 0.9);
soldier(560, C.red, 0.85);
soldier(620, C.red, 0.8, 8);
P(`<line x1="650" y1="${GY}" x2="690" y2="${GY - 6}" stroke="${C.red}" stroke-width="2"/><circle cx="694" cy="${GY - 8}" r="4" fill="${C.red}"/>`);
halo(560, 408, 200, 16);
P(`<text x="560" y="420" fill="${C.red}" font-size="11" font-weight="700" text-anchor="middle">outrun his guns · low on ammo</text>`);
halo(560, 510, 150, 16);
P(`<text x="560" y="522" fill="${C.red}" font-size="10" text-anchor="middle">no fresh command</text>`);

// HAUPTKAMPFFELD line — held on the flanks, breached in the centre
trench(430, 540, C.green, 2.2);   // upper flank holding
trench(770, 960, C.green, 2.5);   // far flank holding
// breach gap markers
P(`<g stroke="${C.red}" stroke-width="2.4" opacity="0.85"><line x1="600" y1="566" x2="616" y2="582"/><line x1="616" y1="566" x2="600" y2="582"/></g>`);
halo(700, 632, 120, 16);
P(`<text x="700" y="644" fill="${C.green}" font-size="10" text-anchor="middle">line bled the attack</text>`);

// EINGREIFDIVISION held in depth — fresh, organised, with HQ
// HQ flag
P(`<line x1="1120" y1="${GY}" x2="1120" y2="${GY - 70}" stroke="${C.purple}" stroke-width="2"/>`);
P(`<path d="M 1120 ${GY - 70} L 1168 ${GY - 60} L 1120 ${GY - 50} Z" fill="${C.purple}"/>`);
halo(1120, 512, 110, 16);
P(`<text x="1120" y="524" fill="${C.purple}" font-size="10" font-weight="700" text-anchor="middle">clear command</text>`);
// fresh reserve ranks (purple, upright, in formation)
for (const x of [1040, 1075, 1190, 1225, 1260]) soldier(x, C.purple, 0.95);
trench(1020, 1280, C.purple, 1.6);
halo(1150, 668, 240, 30);
P(`<text x="1150" y="680" fill="${C.purple}" font-size="11" font-weight="700" text-anchor="middle">FRESH · FULLY SUPPLIED · IN FORMATION</text>`);
P(`<text x="1150" y="694" fill="${C.sub}" font-size="10" text-anchor="middle">kept out of the daily fight — a strategic asset</text>`);

// COUNTERATTACK — committed in mass into the flank of the salient
P(`<path d="M 1040 450 C 900 380 800 410 760 500" fill="none" stroke="${C.purple}" stroke-width="4" marker-end="url(#arr-purple)"/>`);
P(`<path d="M 1060 480 C 940 430 850 460 800 535" fill="none" stroke="${C.purple}" stroke-width="3" marker-end="url(#arr-purple)" opacity="0.8"/>`);
halo(905, 372, 240, 16);
P(`<text x="905" y="384" fill="${C.purple}" font-size="12" font-weight="700" text-anchor="middle">committed in mass · decisive moment</text>`);

// timing annotation
halo(820, 300, 360, 16);
P(`<text x="820" y="312" fill="${C.purple}" font-size="12" font-weight="700" text-anchor="middle">timing &gt; strength — Layer 05 says when →</text>`);
P(`<line x1="980" y1="318" x2="1100" y2="430" stroke="${C.purple}" stroke-width="0.8" stroke-dasharray="2,3" opacity="0.5"/>`);

// FOOTER
P(`<line x1="60" y1="780" x2="1540" y2="780" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="820" fill="${C.purple}" font-size="12" letter-spacing="3" font-weight="700">DOCTRINE</text>`);
P(`<text x="60" y="852" fill="${C.ink}" font-size="22" font-weight="500">Don't fight from the line. Reserves are committed in mass, or not at all — until the penetration is the wrong call.</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "layer-04-military-cartoon.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "layer-04-military-cartoon.png"));
console.log(`Wrote layer-04-military-cartoon.svg and .png (${W * 2}x${H * 2})`);
