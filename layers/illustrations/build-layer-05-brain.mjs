// Layer 05 fleet brain — Cerebellum learns from every sensor at once and pushes the
// lesson to every sensor at once. Cortex feeds it from below; external CTI feeds it
// from the side. The 101st customer is protected on day one. Gen0Sec architecture.
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
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", grid: "#e8eaef", line: "#d5d9e0", green: "#16a34a", blue: "#006fff", purple: "#9333ea", orange: "#d97706", red: "#dc2626" };

const o = [];
const P = (s) => o.push(s);
const txt = (x, y, t, col, sz = 14, wt = 400, anc = "start") => P(`<text x="${x}" y="${y}" fill="${col}" font-size="${sz}" font-weight="${wt}" text-anchor="${anc}">${t}</text>`);

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="ag" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.green}"/></marker>`);
P(`  <marker id="af" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.faint}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// HEADER
P(`<text x="60" y="56" fill="${C.faint}" font-size="16" letter-spacing="6" font-weight="600">GEN0SEC · ARCHITECTURE</text>`);
P(`<rect x="60" y="100" width="68" height="68" rx="10" fill="${C.green}"/>`);
P(`<text x="94" y="144" fill="#ffffff" font-size="28" font-weight="700" text-anchor="middle">05</text>`);
P(`<text x="148" y="124" fill="${C.green}" font-size="14" letter-spacing="4" font-weight="600">LAYER 05 · INTELLIGENCE &amp; ADAPTATION</text>`);
P(`<text x="148" y="158" fill="${C.ink}" font-size="32" font-weight="700">One brain, the whole front.</text>`);
P(`<text x="148" y="190" fill="${C.sub}" font-size="16">Learn from every sensor at once; push the lesson to every sensor at once.</text>`);

// ── CEREBELLUM (top centre) ──
const bx = 560, by = 256, bw = 480, bh = 138;
P(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="14" fill="rgba(22,163,74,0.05)" stroke="${C.green}" stroke-width="2"/>`);
txt(bx + bw / 2, by + 40, "CEREBELLUM", C.green, 22, 700, "middle");
txt(bx + bw / 2, by + 66, "the fleet brain — clusters adversaries, not packets", C.sub, 13, 400, "middle");
txt(bx + bw / 2, by + 96, "confidence model trained on outcomes", C.ink, 13, 700, "middle");
txt(bx + bw / 2, by + 118, "Cortex feeds it from below (ML on each sensor)", C.sub, 11, 400, "middle");

// external CTI in
P(`<rect x="100" y="270" width="250" height="64" rx="10" fill="#ffffff" stroke="${C.line}" stroke-width="1.5"/>`);
txt(225, 300, "EXTERNAL CTI", C.faint, 12, 700, "middle");
txt(225, 322, "feeds · OSINT · ISAC", C.sub, 12, 400, "middle");
P(`<line x1="350" y1="302" x2="${bx - 6}" y2="310" stroke="${C.faint}" stroke-width="1.6" stroke-dasharray="5,4" marker-end="url(#af)"/>`);

// ── TELEMETRY UP (left) ──
txt(150, 432, "TELEMETRY ↑", C.green, 14, 700);
const tel = ["JA4+ fingerprints", "Hillock verdicts", "Thalamus IDS hits", "microseg drops", "Workflow actions"];
tel.forEach((t, i) => txt(150, 462 + i * 26, "· " + t, C.sub, 13, 400));
P(`<path d="M 360 560 C 420 520, 480 460, ${bx + 60} ${by + bh + 6}" fill="none" stroke="${C.green}" stroke-width="2.6" stroke-dasharray="7,5" marker-end="url(#ag)"/>`);

// ── POLICY DOWN (right) ──
txt(1450, 432, "POLICY ↓", C.green, 14, 700, "end");
const pol = ["Thalamus rules", "Hillock blocklist", "JA4+ classification", "Workflow triggers", "CTI verdicts"];
pol.forEach((t, i) => txt(1450, 462 + i * 26, t + " ·", C.green, 13, 700, "end"));
P(`<path d="M ${bx + bw - 60} ${by + bh + 6} C 1140 460, 1200 520, 1240 560" fill="none" stroke="${C.green}" stroke-width="3" marker-end="url(#ag)"/>`);

// ── FLEET (bottom) ──
const fy = 640, n = 9, x0 = 180, dx = 150;
P(`<line x1="120" y1="${fy + 90}" x2="1480" y2="${fy + 90}" stroke="${C.line}" stroke-width="1.2"/>`);
txt(132, fy - 8, "THE FLEET — every Cerebrum + Synapse is also a forward observer", C.faint, 12, 700);
for (let i = 0; i < n; i++) {
  const x = x0 + i * dx;
  const last = i === n - 1;
  P(`<rect x="${x}" y="${fy + 10}" width="120" height="64" rx="9" fill="${last ? "rgba(22,163,74,0.10)" : "#ffffff"}" stroke="${C.green}" stroke-width="${last ? 2.4 : 1.4}"/>`);
  if (last) P(`<rect x="${x - 6}" y="${fy + 4}" width="132" height="76" rx="12" fill="none" stroke="${C.green}" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>`);
  txt(x + 60, fy + 36, last ? "customer" : "Synapse", last ? C.green : C.ink, 12, 700, "middle");
  txt(x + 60, fy + 56, last ? "#101" : "+ Cortex", last ? C.green : C.sub, 12, last ? 700 : 400, "middle");
}
txt(x0 + (n - 1) * dx + 60, fy + 98, "never attacked —", C.green, 11, 700, "middle");
txt(x0 + (n - 1) * dx + 60, fy + 112, "protected on day one", C.green, 11, 700, "middle");

// the lesson reaches the 101st before it is hit
P(`<line x1="1240" y1="566" x2="${x0 + (n - 1) * dx + 60}" y2="${fy + 6}" stroke="${C.green}" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#ag)" opacity="0.85"/>`);

// FOOTER
P(`<line x1="60" y1="790" x2="1540" y2="790" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="828" fill="${C.green}" font-size="12" letter-spacing="3" font-weight="700">DOCTRINE</text>`);
P(`<text x="60" y="860" fill="${C.ink}" font-size="22" font-weight="500">Intelligence built from observing 100 customers is intelligence that protects the 101st on day one.</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "layer-05-fleet-brain.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "layer-05-fleet-brain.png"));
console.log(`Wrote layer-05-fleet-brain.svg and .png (${W * 2}x${H * 2})`);
