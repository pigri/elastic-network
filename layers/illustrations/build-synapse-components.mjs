// Synapse components & layers — the single-binary orchestrator's internal flow.
// capture → detect → decide → execute. Matches the authoritative architecture:
// hillock (kernel data-plane) → dendrite (source of truth) → thalamus + cortex
// (detection) → amygdala (decision-maker) → Pingora L7 proxy → backend, with the
// enforcement loop back to hillock. Gen0Sec design, SVG → PNG via sharp.
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

const W = 1500, H = 1620;
const C = {
  ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", line: "#d5d9e0", grid: "#e8eaef",
  blue: "#006fff", cyan: "#0891b2", green: "#16a34a", purple: "#9333ea", orange: "#d97706", red: "#dc2626", slate: "#8b92a5",
};
const FILL = {
  [C.blue]: "rgba(0,111,255,0.07)", [C.cyan]: "rgba(8,145,178,0.09)", [C.green]: "rgba(22,163,74,0.08)",
  [C.purple]: "rgba(147,51,234,0.07)", [C.orange]: "rgba(217,119,6,0.10)", [C.red]: "rgba(220,38,38,0.06)", [C.slate]: "#eef0f3",
};
const o = [];
const P = (s) => o.push(s);

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="ar" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.sub}"/></marker>`);
P(`  <marker id="ar-red" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// header
P(`<text x="60" y="50" fill="${C.faint}" font-size="14" letter-spacing="6" font-weight="600">GEN0SEC · ARCHITECTURE</text>`);
P(`<text x="60" y="88" fill="${C.ink}" font-size="28" font-weight="700">Synapse — one binary: capture → detect → decide → execute</text>`);

// box helper: title + lines, centered at cx
function box(cx, y, w, h, color, title, lines, titleSize = 22) {
  const x = cx - w / 2;
  P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#ffffff"/>`);
  P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${FILL[color]}" stroke="${color}" stroke-width="2"/>`);
  P(`<text x="${cx}" y="${y + 38}" fill="${C.ink}" font-size="${titleSize}" font-weight="700" text-anchor="middle">${title}</text>`);
  lines.forEach((t, i) => P(`<text x="${cx}" y="${y + 38 + 26 + i * 22}" fill="${C.sub}" font-size="13.5" text-anchor="middle">${t}</text>`));
}
const arrow = (x1, y1, x2, y2, label, lx, ly) => {
  P(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.sub}" stroke-width="2" marker-end="url(#ar)"/>`);
  if (label) P(`<text x="${lx}" y="${ly}" fill="${C.sub}" font-size="13">${label}</text>`);
};

const MID = 750;

// orchestrator wrapper
P(`<rect x="40" y="150" width="1420" height="1180" rx="16" fill="rgba(0,111,255,0.025)" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="9 5"/>`);
P(`<text x="70" y="190" fill="${C.blue}" font-size="17" font-weight="700">synapse — orchestrator · single binary (Agent + Proxy modes)</text>`);

// stage labels (left)
const stage = (y, l1, l2) => { P(`<text x="62" y="${y}" fill="${C.faint}" font-size="12" letter-spacing="2" font-weight="700">${l1}</text>`); if (l2) P(`<text x="62" y="${y + 16}" fill="${C.faint}" font-size="12" letter-spacing="2" font-weight="700">${l2}</text>`); };

// Network Traffic (top, outside orchestrator)
box(MID, 210, 460, 80, C.slate, "Network Traffic", ["North–South (perimeter) · East–West (internal)"], 20);

// hillock
stage(258, "KERNEL", "DATA-PLANE");
box(MID, 320, 640, 96, C.orange, "hillock", ["eBPF · TC · XDP — packet taps + kernel enforcement,", "ring events, metrics"]);
arrow(MID, 290, MID, 318, "ingress tap", MID + 14, 308);

// dendrite
stage(486, "CAPTURE /", "FINGERPRINT");
box(MID, 470, 640, 110, C.blue, "dendrite", ["JA4+ capture &amp; parse — the source of truth", "FingerprintInfo + decoder buffers · captures only"]);
arrow(MID, 416, MID, 468, "packets / ring events", MID + 14, 446);

// detection row
stage(700, "DETECTION /", "ANALYSIS");
const TX = 430, CX = 1070;
box(TX, 660, 440, 130, C.red, "thalamus", ["IDS engine", "Suricata-compatible rules", "flow tracking → threat events"]);
box(CX, 660, 440, 130, C.purple, "cortex", ["JA4+ ML classifier", "ONNX inference pool", "classify-and-block verdict"]);
arrow(MID - 120, 580, TX + 90, 658, "decoder buffers", 470, 628);
arrow(MID + 120, 580, CX - 90, 658, "fingerprint suite", 1000, 628);

// amygdala
stage(945, "ENFORCEMENT", "");
box(MID, 880, 720, 116, C.green, "amygdala", ["Smart firewall — wirefilter rules over fingerprints · the decision-maker", "decides drops → dispatches to multi-backend (XDP / nftables / iptables)"]);
arrow(TX + 60, 790, MID - 200, 878, "threat events", 470, 850);
arrow(MID, 580, MID, 878, "", 0, 0);
// dendrite → amygdala label, centered in the gap between thalamus and cortex with a
// white halo so it sits on the arrow without overlapping either detection box
P(`<rect x="${MID - 94}" y="731" width="188" height="18" fill="#ffffff" opacity="0.95"/>`);
P(`<text x="${MID}" y="744" fill="${C.sub}" font-size="13" text-anchor="middle">FingerprintInfo (direct)</text>`);
arrow(CX - 60, 790, MID + 200, 878, "classify + block", 980, 850);

// proxy
stage(1135, "L7 PROXY", "(inline mode)");
box(MID, 1080, 720, 124, C.cyan, "Proxy mode — inline L7 (Pingora reverse proxy)", ["TLS passthrough / termination · WAF (wirefilter) · rate-limit · CAPTCHA · content scan", "load balancing across upstreams → forward to backend"], 21);
arrow(MID, 996, MID, 1078, "inline path (proxy mode)", MID + 14, 1044);

// backend (outside orchestrator)
box(MID, 1380, 420, 86, C.slate, "Backend / Upstream", ["weighted, load-balanced pool"], 20);
arrow(MID, 1204, MID, 1378, "", 0, 0);

// enforcement loop (amygdala → hillock), right gutter, red dashed
P(`<path d="M 1110 938 H 1410 V 368 H 1074" fill="none" stroke="${C.red}" stroke-width="2" stroke-dasharray="8 4" marker-end="url(#ar-red)"/>`);
P(`<text x="1426" y="660" fill="${C.red}" font-size="12.5" font-weight="600" transform="rotate(90 1426 660)" text-anchor="middle">enforce drop → XDP / nftables / iptables</text>`);

// legend
const LY = 1540;
P(`<text x="60" y="${LY + 5}" fill="${C.ink}" font-size="14" font-weight="700">Legend</text>`);
const leg = [["Capture", C.blue], ["IDS", C.red], ["ML", C.purple], ["Firewall", C.green], ["Kernel", C.orange], ["L7 Proxy", C.cyan]];
let lx = 150;
for (const [t, col] of leg) {
  P(`<rect x="${lx}" y="${LY - 12}" width="22" height="22" rx="5" fill="${FILL[col]}" stroke="${col}" stroke-width="1.8"/>`);
  P(`<text x="${lx + 30}" y="${LY + 5}" fill="${C.sub}" font-size="13">${t}</text>`);
  lx += 36 + t.length * 9 + 24;
}
P(`<line x1="${lx}" y1="${LY - 1}" x2="${lx + 34}" y2="${LY - 1}" stroke="${C.red}" stroke-width="2" stroke-dasharray="6 4"/>`);
P(`<text x="${lx + 42}" y="${LY + 5}" fill="${C.sub}" font-size="13">enforcement loop</text>`);
lx += 42 + 16 * 9 + 20;
P(`<rect x="${lx}" y="${LY - 12}" width="22" height="22" rx="5" fill="none" stroke="${C.blue}" stroke-width="1.8" stroke-dasharray="5 3"/>`);
P(`<text x="${lx + 30}" y="${LY + 5}" fill="${C.sub}" font-size="13">synapse orchestrator</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "synapse-components.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "synapse-components.png"));
console.log(`Wrote synapse-components.svg and .png (${W * 2}x${H * 2})`);
