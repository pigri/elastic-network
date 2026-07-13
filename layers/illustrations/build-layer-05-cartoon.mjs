// Layer 05 military cartoon — the Generalstab (the staff, 1916). Not a battle zone:
// the institution that correlated every source, predicted the next Schwerpunkt, and
// rewrote the doctrine. The learning loop: reports up, revised doctrine down.
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
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", grid: "#e8eaef", line: "#d5d9e0", green: "#16a34a", red: "#dc2626", purple: "#9333ea" };

const o = [];
const P = (s) => o.push(s);
const halo = (xc, y, w, h = 16) => P(`<rect x="${xc - w / 2}" y="${y - 12}" width="${w}" height="${h}" fill="#ffffff" opacity="0.92"/>`);
const txt = (x, y, t, col, sz = 14, wt = 400, anc = "start") => P(`<text x="${x}" y="${y}" fill="${col}" font-size="${sz}" font-weight="${wt}" text-anchor="${anc}">${t}</text>`);

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="ag" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.green}"/></marker>`);
P(`  <marker id="ared" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// HEADER
P(`<text x="60" y="56" fill="${C.faint}" font-size="16" letter-spacing="6" font-weight="600">GEN0SEC · DOCTRINE</text>`);
P(`<rect x="60" y="100" width="68" height="68" rx="10" fill="${C.green}"/>`);
P(`<text x="94" y="144" fill="#ffffff" font-size="28" font-weight="700" text-anchor="middle">05</text>`);
P(`<text x="148" y="124" fill="${C.green}" font-size="14" letter-spacing="4" font-weight="600">LAYER 05 · INTELLIGENCE &amp; ADAPTATION — 1916</text>`);
P(`<text x="148" y="158" fill="${C.ink}" font-size="32" font-weight="700">The staff that rewrites the doctrine.</text>`);
P(`<text x="148" y="190" fill="${C.sub}" font-size="16">Correlate every source, predict the next Schwerpunkt, and revise the doctrine before the next battle.</text>`);

// ── GENERALSTAB HQ (top centre) ──
const hx = 600, hy = 270, hw = 400, hh = 150;
P(`<path d="M ${hx} ${hy + 28} L ${hx + hw / 2} ${hy} L ${hx + hw} ${hy + 28} Z" fill="rgba(22,163,74,0.10)" stroke="${C.green}" stroke-width="1.6"/>`);
P(`<rect x="${hx}" y="${hy + 28}" width="${hw}" height="${hh - 28}" rx="6" fill="rgba(22,163,74,0.05)" stroke="${C.green}" stroke-width="1.8"/>`);
txt(hx + hw / 2, hy + 60, "GENERALSTAB", C.green, 18, 700, "middle");
txt(hx + hw / 2, hy + 84, "the brain in the rear", C.sub, 12, 400, "middle");
txt(hx + hw / 2, hy + 112, "correlate · predict · rewrite", C.ink, 13, 700, "middle");
txt(hx + hw / 2, hy + 134, "the doctrine, between battles", C.sub, 11, 400, "middle");

// predicted Schwerpunkt mini-map (right of HQ)
const mx = 1080, my = 282;
P(`<rect x="${mx}" y="${my}" width="220" height="138" rx="8" fill="#ffffff" stroke="${C.line}" stroke-width="1.4"/>`);
txt(mx + 110, my + 24, "PREDICTED SCHWERPUNKT", C.faint, 11, 700, "middle");
// front squiggle on the mini-map
P(`<path d="M ${mx + 24} ${my + 92} q 30 -18 60 0 q 30 18 60 0 q 30 -18 52 0" fill="none" stroke="${C.green}" stroke-width="1.6"/>`);
// predicted enemy arrow into a point
P(`<line x1="${mx + 110}" y1="${my + 46}" x2="${mx + 110}" y2="${my + 84}" stroke="${C.red}" stroke-width="2.4" marker-end="url(#ared)"/>`);
P(`<g stroke="${C.red}" stroke-width="2"><line x1="${mx + 101}" y1="${my + 92}" x2="${mx + 119}" y2="${my + 110}"/><line x1="${mx + 119}" y1="${my + 92}" x2="${mx + 101}" y2="${my + 110}"/></g>`);
txt(mx + 110, my + 132, "reinforce here, first", C.red, 10, 400, "middle");

// HQ → mini-map connector
P(`<line x1="${hx + hw}" y1="${hy + 90}" x2="${mx}" y2="${my + 70}" stroke="${C.green}" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.6"/>`);

// ── INTEL SOURCES (left) feeding UP into HQ ──
const sources = [
  ["aerial recon", 300],
  ["signals intercept", 360],
  ["prisoners · deserters", 420],
  ["captured documents", 480],
  ["front-line reports", 540],
];
txt(96, 268, "MULTI-SOURCE INTELLIGENCE", C.faint, 12, 700);
sources.forEach(([t, y], i) => {
  P(`<rect x="96" y="${y - 18}" width="250" height="30" rx="6" fill="#ffffff" stroke="${C.line}" stroke-width="1.2"/>`);
  P(`<circle cx="116" cy="${y - 3}" r="4" fill="${C.green}"/>`);
  txt(132, y + 1, t, C.ink, 13, 700);
  // arrow up-right toward HQ left edge
  P(`<line x1="346" y1="${y - 3}" x2="${hx - 6}" y2="${hy + 70 + (i - 2) * 8}" stroke="${C.green}" stroke-width="1.4" stroke-dasharray="5,4" marker-end="url(#ag)" opacity="0.7"/>`);
});
txt(471, 250, "every source the front cannot see itself", C.sub, 12, 400, "middle");

// ── THE FRONT (bottom band) ──
const fy = 660;
P(`<line x1="120" y1="${fy}" x2="1480" y2="${fy}" stroke="${C.ink}" stroke-width="2"/>`);
P(`<rect x="120" y="${fy - 34}" width="1360" height="34" fill="rgba(22,163,74,0.03)"/>`);
txt(132, fy - 12, "THE FRONT", C.faint, 12, 700);
const layers = [["L01", 420], ["L02", 640], ["L03", 860], ["L04", 1080]];
layers.forEach(([t, x]) => {
  P(`<rect x="${x - 34}" y="${fy - 30}" width="68" height="26" rx="5" fill="#ffffff" stroke="${C.green}" stroke-width="1.3"/>`);
  txt(x, fy - 12, t, C.green, 13, 700, "middle");
  P(`<line x1="${x}" y1="${fy}" x2="${x}" y2="${fy + 16}" stroke="${C.faint}" stroke-width="1"/>`);
});
txt(1300, fy - 12, "01–04 fight; 05 learns", C.sub, 12, 400, "middle");

// ── THE LOOP: reports UP, revised doctrine DOWN ──
// reports up (front → HQ)
P(`<path d="M 430 ${fy - 36} C 430 540, 520 470, ${hx + 70} ${hy + hh + 4}" fill="none" stroke="${C.green}" stroke-width="2.4" stroke-dasharray="7,5" marker-end="url(#ag)"/>`);
halo(470, 506, 230, 16);
txt(470, 518, "after-action reports ↑", C.green, 12, 700, "middle");
// revised doctrine down (HQ → front)
P(`<path d="M ${hx + hw - 70} ${hy + hh + 4} C 1080 470, 1120 560, 1080 ${fy - 36}" fill="none" stroke="${C.green}" stroke-width="3" marker-end="url(#ag)"/>`);
halo(1115, 506, 240, 16);
txt(1115, 518, "↓ revised doctrine → every sector", C.green, 12, 700, "middle");

// adaptation outcomes
halo(700, 600, 470, 18);
txt(700, 612, "Cambrai 1917: absorbed the tanks ✓   ·   Hundred Days 1918: adapted too slow ✗", C.sub, 12, 700, "middle");

// FOOTER
P(`<line x1="60" y1="790" x2="1540" y2="790" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="828" fill="${C.green}" font-size="12" letter-spacing="3" font-weight="700">DOCTRINE</text>`);
P(`<text x="60" y="860" fill="${C.ink}" font-size="22" font-weight="500">The best defence is not the strongest wall. It is the deepest — and the one that keeps learning.</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "layer-05-military-cartoon.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "layer-05-military-cartoon.png"));
console.log(`Wrote layer-05-military-cartoon.svg and .png (${W * 2}x${H * 2})`);
