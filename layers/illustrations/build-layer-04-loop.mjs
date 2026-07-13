// Layer 04 counterstrike loop — detections enter, a confidence gate routes them:
// high-confidence auto-executes, medium escalates as an OUTCOME (not an alert),
// low only enriches; approved actions push fleet-wide and the audit feeds L05.
// Gen0Sec architecture figure (companion to L02 funnel / L03 mesh). SVG → PNG via sharp.
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
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", grid: "#e8eaef", line: "#d5d9e0", purple: "#9333ea", green: "#16a34a", red: "#dc2626", orange: "#d97706", blue: "#006fff" };

const o = [];
const P = (s) => o.push(s);
function box(x, y, w, h, opt = {}) {
  P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${opt.fill || "#ffffff"}" stroke="${opt.stroke || C.line}" stroke-width="${opt.sw || 1.5}"/>`);
}
const txt = (x, y, t, col, sz = 14, wt = 400, anc = "start") => P(`<text x="${x}" y="${y}" fill="${col}" font-size="${sz}" font-weight="${wt}" text-anchor="${anc}">${t}</text>`);

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="ap" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.purple}"/></marker>`);
P(`  <marker id="ag" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.green}"/></marker>`);
P(`  <marker id="af" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.faint}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// HEADER
P(`<text x="60" y="56" fill="${C.faint}" font-size="16" letter-spacing="6" font-weight="600">GEN0SEC · ARCHITECTURE</text>`);
P(`<rect x="60" y="100" width="68" height="68" rx="10" fill="${C.purple}"/>`);
P(`<text x="94" y="144" fill="#ffffff" font-size="28" font-weight="700" text-anchor="middle">04</text>`);
P(`<text x="148" y="124" fill="${C.purple}" font-size="14" letter-spacing="4" font-weight="600">LAYER 04 · RESERVES &amp; COUNTERATTACK</text>`);
P(`<text x="148" y="158" fill="${C.ink}" font-size="32" font-weight="700">Approve the outcome, not the alert.</text>`);
P(`<text x="148" y="190" fill="${C.sub}" font-size="16">Confidence routes the response. The SOC's tempo is a strategic reserve — spend it only on the decisive call.</text>`);

// ── DETECTIONS (left) ──
txt(70, 268, "DETECTIONS", C.faint, 13, 700);
const dets = [
  ["L02 · edge verdicts", C.orange],
  ["L03 · east-west drops", C.blue],
  ["L01 · CTI indicators", C.green],
];
dets.forEach(([t, col], i) => {
  const y = 300 + i * 64;
  box(70, y, 250, 48, { stroke: col });
  P(`<rect x="70" y="${y}" width="5" height="48" rx="2" fill="${col}"/>`);
  txt(90, y + 29, t, C.ink, 14, 700);
  P(`<line x1="320" y1="${y + 24}" x2="392" y2="${y + 24}" stroke="${C.faint}" stroke-width="1.6" marker-end="url(#af)"/>`);
});

// ── CONFIDENCE GATE ──
box(400, 296, 230, 224, { stroke: C.purple, fill: "rgba(147,51,234,0.04)", sw: 2 });
txt(515, 330, "WORKFLOW", C.purple, 16, 700, "middle");
txt(515, 352, "confidence gate", C.sub, 13, 400, "middle");
txt(515, 392, "is the system sure?", C.ink, 13, 400, "middle");
// three thresholds
txt(420, 432, "HIGH ≥ 0.9", C.green, 13, 700);
txt(420, 466, "MEDIUM", C.orange, 13, 700);
txt(420, 500, "LOW", C.faint, 13, 700);

// gate → three branches
P(`<line x1="630" y1="430" x2="700" y2="378" stroke="${C.green}" stroke-width="1.8" marker-end="url(#ag)"/>`);
P(`<line x1="630" y1="466" x2="700" y2="470" stroke="${C.orange}" stroke-width="1.8" marker-end="url(#af)"/>`);
P(`<line x1="630" y1="500" x2="700" y2="566" stroke="${C.faint}" stroke-width="1.8" marker-end="url(#af)"/>`);

// ── BRANCHES ──
// HIGH → auto-execute
box(704, 344, 300, 70, { stroke: C.green });
txt(724, 374, "AUTO-EXECUTE", C.green, 15, 700);
txt(724, 396, "commit decisively · no human", C.sub, 12);
// MEDIUM → Slack outcome approval
box(704, 436, 300, 70, { stroke: C.orange, fill: "rgba(217,119,6,0.05)" });
txt(724, 466, "SLACK — APPROVE OUTCOME", C.orange, 14, 700);
txt(724, 488, "“should we execute this?” — y/n", C.sub, 12);
// LOW → enrich
box(704, 540, 300, 70, { stroke: C.faint });
txt(724, 570, "ENRICH ONLY", C.faint, 15, 700);
txt(724, 592, "add to the case · do not act", C.sub, 12);

// HIGH and approved-MEDIUM converge → fleet counterstrike
P(`<line x1="1004" y1="379" x2="1090" y2="404" stroke="${C.green}" stroke-width="1.8" marker-end="url(#ag)"/>`);
P(`<line x1="1004" y1="471" x2="1090" y2="446" stroke="${C.purple}" stroke-width="1.8" marker-end="url(#ap)"/>`);
txt(1012, 510, "approved", C.purple, 11, 400);

// ── FLEET-WIDE COUNTERSTRIKE ──
box(1092, 360, 440, 120, { stroke: C.purple, fill: "rgba(147,51,234,0.05)", sw: 2 });
txt(1312, 392, "FLEET-WIDE COUNTERSTRIKE", C.purple, 15, 700, "middle");
txt(1312, 414, "every Cerebrum + Synapse, simultaneously", C.sub, 12, 400, "middle");
// little fleet nodes
for (let i = 0; i < 9; i++) P(`<rect x="${1130 + i * 42}" y="440" width="26" height="20" rx="3" fill="#ffffff" stroke="${C.purple}" stroke-width="1.2"/>`);
P(`<text x="1516" y="455" fill="${C.purple}" font-size="11" font-weight="700" text-anchor="end">+5</text>`);
txt(1312, 500, "policy compiled &amp; pushed in milliseconds — rollback is also fleet-wide", C.purple, 12, 400, "middle");

// ── AUDIT → L05 ──
box(1092, 540, 440, 70, { stroke: C.line });
txt(1112, 570, "AUDIT", C.ink, 14, 700);
txt(1112, 592, "detection · playbook · approver · change · rollback", C.sub, 12);
// feedback arrow audit → Cerebellum, routed below all boxes back into the gate
P(`<path d="M 1300 610 L 1300 662 L 480 662 L 480 522" fill="none" stroke="${C.green}" stroke-width="1.8" stroke-dasharray="6,5" marker-end="url(#ag)"/>`);
P(`<rect x="688" y="650" width="436" height="22" fill="#ffffff" opacity="0.92"/>`);
txt(906, 666, "audit feeds Cerebellum (L05) — retrains the confidence model", C.green, 12, 700, "middle");

// FOOTER
P(`<line x1="60" y1="790" x2="1540" y2="790" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="828" fill="${C.purple}" font-size="12" letter-spacing="3" font-weight="700">DOCTRINE</text>`);
P(`<text x="60" y="860" fill="${C.ink}" font-size="22" font-weight="500">If the system is confident, commit. If it is uncertain, ask about the effect — never make the SOC triage the evidence.</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "layer-04-counterstrike-loop.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "layer-04-counterstrike-loop.png"));
console.log(`Wrote layer-04-counterstrike-loop.svg and .png (${W * 2}x${H * 2})`);
