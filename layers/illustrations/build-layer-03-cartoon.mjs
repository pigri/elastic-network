// Layer 03 military cartoon — the Hauptkampffeld (main defensive zone, 1916).
// Same visual language as layer-01/02 military cartoons. SVG → PNG via sharp.
// Doctrine: depth substitutes for density; the breakthrough lands in a prepared trap.
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
// Resolve sharp from whichever environment is building this (Linux box or local Mac).
const SHARP_PKGS = [
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
  "/Users/davidpapp/Tresorit/Projects/enterprise/src/kapnative/cf-integration/node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/package.json",
];
const req = createRequire(SHARP_PKGS.find(existsSync) ?? SHARP_PKGS[0]);
const sharp = req("sharp");

const W = 1600, H = 900;
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", grid: "#e8eaef", line: "#d5d9e0", blue: "#006fff", green: "#16a34a", red: "#dc2626", orange: "#d97706" };
const GY = 600; // ground line

const o = [];
const P = (s) => o.push(s);

// — helpers —
const halo = (x, y, w, h) => P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" opacity="0.92"/>`);
function soldier(x, color, scale = 1) {
  const s = scale;
  P(`<g transform="translate(${x},${GY}) scale(${s})" stroke="${color}" stroke-width="2" fill="${color}"><circle cx="0" cy="-22" r="4"/><line x1="0" y1="-18" x2="0" y2="-8"/><line x1="0" y1="-14" x2="-6" y2="-10"/><line x1="0" y1="-14" x2="6" y2="-10"/><line x1="0" y1="-8" x2="-5" y2="0"/><line x1="0" y1="-8" x2="5" y2="0"/></g>`);
}
function mgNest(x, color) {
  P(`<g transform="translate(${x},${GY})" stroke="${color}" stroke-width="2" fill="none"><rect x="-13" y="-26" width="26" height="14" fill="rgba(0,111,255,0.10)"/><line x1="0" y1="-19" x2="22" y2="-19" stroke-width="3"/></g>`);
}
function trench(x0, x1, color, w = 2.5) {
  let d = `M ${x0} ${GY + 5}`;
  let up = true;
  for (let x = x0 + 25; x <= x1; x += 25) { d += ` L ${x} ${GY + (up ? 22 : 5)}`; up = !up; }
  P(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`);
}

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="arr-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`  <marker id="arr-redt" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`  <marker id="arr-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${C.green}"/></marker>`);
P(`  <marker id="arr-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${C.blue}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// — HEADER —
P(`<text x="60" y="56" fill="${C.faint}" font-size="16" letter-spacing="6" font-weight="600">GEN0SEC · DOCTRINE</text>`);
P(`<rect x="60" y="100" width="68" height="68" rx="10" fill="${C.blue}"/>`);
P(`<text x="94" y="144" fill="#ffffff" font-size="28" font-weight="700" text-anchor="middle">03</text>`);
P(`<text x="148" y="124" fill="${C.blue}" font-size="14" letter-spacing="4" font-weight="600">LAYER 03 · MAIN DEFENSIVE ZONE — 1916</text>`);
P(`<text x="148" y="158" fill="${C.ink}" font-size="32" font-weight="700">Penetration is a step deeper into the trap.</text>`);
P(`<text x="148" y="190" fill="${C.sub}" font-size="16">Lines in depth. The first is thinly held on purpose; the breakthrough lands where the fire is heaviest.</text>`);

// — ZONE LABELS —
P(`<text x="230" y="246" fill="${C.red}" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">BREAKTHROUGH FROM THE BELT</text>`);
P(`<text x="830" y="246" fill="${C.blue}" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">HAUPTKAMPFFELD · MAIN DEFENSIVE ZONE</text>`);
P(`<text x="1400" y="246" fill="${C.green}" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">EINGREIF · COUNTERATTACK</text>`);

P(`<line x1="420" y1="260" x2="420" y2="720" stroke="${C.line}" stroke-width="1" stroke-dasharray="6,6"/>`);
P(`<line x1="1290" y1="260" x2="1290" y2="720" stroke="${C.line}" stroke-width="1" stroke-dasharray="6,6"/>`);
P(`<rect x="420" y="260" width="870" height="460" rx="6" fill="rgba(0,111,255,0.04)"/>`);

// — GROUND —
P(`<line x1="40" y1="${GY}" x2="1560" y2="${GY}" stroke="${C.ink}" stroke-width="2"/>`);
P(`<g fill="${C.faint}" opacity="0.4">`);
for (let x = 100; x < 1560; x += 120) P(`<circle cx="${x}" cy="${GY + 52 + (x % 3) * 4}" r="1"/>`);
P(`</g>`);

// — ATTACKER: thin survivor entering from the belt —
P(`<line x1="60" y1="430" x2="410" y2="430" stroke="${C.red}" stroke-width="4" marker-end="url(#arr-red)" opacity="0.9"/>`);
halo(150, 396, 232, 18);
P(`<text x="235" y="410" fill="${C.red}" font-size="13" font-weight="700" text-anchor="middle">WEAKER · LATER · ON OUR AXIS</text>`);
soldier(250, C.red); soldier(310, C.red); soldier(360, C.red, 0.85);
halo(255, 552, 110, 16);
P(`<text x="310" y="564" fill="${C.red}" font-size="10" text-anchor="middle">what survived L02</text>`);
// attacker's own trench fringe far left
P(`<path d="M 50 605 L 70 620 L 90 605 L 110 620 L 130 605 L 150 620 L 170 605 L 190 620 L 210 605 L 230 620 L 250 605 L 270 620 L 290 605 L 310 620 L 330 605 L 350 620 L 370 605 L 390 620 L 410 605" fill="none" stroke="${C.red}" stroke-width="2"/>`);

// — FIRST LINE — thinly held (deliberately) —
trench(500, 600, C.blue, 2);
soldier(560, C.blue, 0.8);
halo(470, 638, 170, 30);
P(`<text x="555" y="650" fill="${C.blue}" font-size="11" font-weight="700" text-anchor="middle">FIRST LINE</text>`);
P(`<text x="555" y="664" fill="${C.sub}" font-size="10" text-anchor="middle">thinly held — deliberately</text>`);

// — KILLING GROUND between line 1 and line 2 (pre-registered fire) —
P(`<polygon points="660,300 820,470 820,530 660,700" fill="rgba(220,38,38,0.07)" stroke="${C.red}" stroke-width="1" stroke-dasharray="4,4"/>`);
// pre-registered artillery bursts
P(`<g stroke="${C.red}" stroke-width="1.4" opacity="0.85">`);
for (const bx of [705, 745, 785]) P(`<g><line x1="${bx}" y1="490" x2="${bx}" y2="430"/><line x1="${bx - 12}" y1="445" x2="${bx + 12}" y2="445"/><line x1="${bx - 9}" y1="432" x2="${bx + 9}" y2="458"/><line x1="${bx + 9}" y1="432" x2="${bx - 9}" y2="458"/></g>`);
P(`</g>`);
halo(672, 322, 136, 30);
P(`<text x="740" y="334" fill="${C.red}" font-size="11" font-weight="700" text-anchor="middle">KILLING GROUND</text>`);
P(`<text x="740" y="348" fill="${C.sub}" font-size="10" text-anchor="middle">pre-registered fire</text>`);

// — SECOND LINE — main strength —
trench(770, 920, C.blue, 3);
mgNest(800, C.blue); mgNest(884, C.blue);
soldier(845, C.blue); soldier(910, C.blue, 0.9);
halo(760, 668, 170, 16);
P(`<text x="845" y="680" fill="${C.blue}" font-size="11" font-weight="700" text-anchor="middle">SECOND LINE — main strength</text>`);
// the breakthrough is STOPPED here
P(`<g stroke="${C.red}" stroke-width="2.6" opacity="0.95"><line x1="742" y1="492" x2="762" y2="512"/><line x1="762" y1="492" x2="742" y2="512"/></g>`);

// — THIRD LINE — prepared, stocked, reserves not yet committed —
trench(1080, 1230, C.blue, 2.5);
// ammunition / wire stocks (stacked crates)
P(`<g stroke="${C.blue}" stroke-width="1.6" fill="rgba(0,111,255,0.08)"><rect x="1095" y="566" width="20" height="16"/><rect x="1118" y="566" width="20" height="16"/><rect x="1106" y="548" width="20" height="16"/></g>`);
// reserves — drawn slightly back from the ground line to read as "uncommitted"
soldier(1160, C.green, 0.85); soldier(1195, C.green, 0.85); soldier(1230, C.green, 0.85);
halo(1080, 520, 180, 16);
P(`<text x="1170" y="532" fill="${C.green}" font-size="10" font-weight="700" text-anchor="middle">reserves — not yet committed</text>`);
halo(1070, 668, 220, 30);
P(`<text x="1180" y="680" fill="${C.blue}" font-size="11" font-weight="700" text-anchor="middle">THIRD LINE — prepared in depth</text>`);
P(`<text x="1180" y="694" fill="${C.sub}" font-size="10" text-anchor="middle">ammunition · wire · fresh reserves</text>`);

// — ATTACK FLOW: penetrates the thin first line, channeled, stopped at the second —
halo(560, 380, 300, 18);
P(`<text x="710" y="394" fill="${C.red}" font-size="12" font-weight="700" text-anchor="middle">PENETRATION ≠ BREAKTHROUGH →</text>`);
P(`<path d="M 430 440 C 540 440 560 470 660 492" fill="none" stroke="${C.red}" stroke-width="2.4" stroke-dasharray="7,5" opacity="0.7"/>`);
P(`<path d="M 430 500 C 560 500 600 500 740 500" fill="none" stroke="${C.red}" stroke-width="2.4" stroke-dasharray="7,5" opacity="0.7"/>`);
P(`<path d="M 430 560 C 540 560 560 530 660 508" fill="none" stroke="${C.red}" stroke-width="2.4" stroke-dasharray="7,5" opacity="0.7"/>`);

// — COUNTERATTACK from depth (the Eingreif) sweeping forward into the penetration —
P(`<path d="M 1150 470 C 1000 360 820 360 770 452" fill="none" stroke="${C.green}" stroke-width="3.2" marker-end="url(#arr-green)"/>`);
halo(905, 350, 196, 16);
P(`<text x="1003" y="362" fill="${C.green}" font-size="11" font-weight="700" text-anchor="middle">counterattack from depth</text>`);

// — "each line costs more" annotation —
P(`<line x1="520" y1="285" x2="1130" y2="285" stroke="${C.blue}" stroke-width="1" stroke-dasharray="3,4" opacity="0.5" marker-end="url(#arr-blue)"/>`);
halo(640, 277, 360, 16);
P(`<text x="820" y="289" fill="${C.blue}" font-size="11" font-weight="700" text-anchor="middle">each line costs the attacker more than the last →</text>`);

// — deeper-behind hint to Layer 04/05 —
P(`<text x="1400" y="450" fill="${C.sub}" font-size="11" text-anchor="middle">layers 04 · 05</text>`);
P(`<text x="1400" y="464" fill="${C.sub}" font-size="11" text-anchor="middle">reserves &amp; staff →</text>`);
P(`<line x1="1330" y1="478" x2="1540" y2="478" stroke="${C.sub}" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arr-green)" opacity="0.6"/>`);

// — FOOTER —
P(`<line x1="60" y1="780" x2="1540" y2="780" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="820" fill="${C.blue}" font-size="12" letter-spacing="3" font-weight="700">DOCTRINE</text>`);
P(`<text x="60" y="852" fill="${C.ink}" font-size="22" font-weight="500">Depth substitutes for density. One line can be ranged and reduced; many lines in depth cannot all be reduced at once.</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "layer-03-military-cartoon.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "layer-03-military-cartoon.png"));
console.log(`Wrote layer-03-military-cartoon.svg and .png (${W * 2}x${H * 2})`);
