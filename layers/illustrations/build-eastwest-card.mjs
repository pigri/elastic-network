// East-west verdict card — "a blocked lateral move" showcase for Layer 03.
// Same card language as ja4-fingerprint-card / cti-verdict-card. Synthetic example
// (TLP:CLEAR); workload names and fingerprints are illustrative. SVG → PNG via sharp.
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

const W = 1500, H = 1000;
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", line: "#d5d9e0", grid: "#e8eaef", blue: "#006fff", cyan: "#0891b2", green: "#16a34a", purple: "#9333ea", orange: "#d97706", red: "#dc2626" };

const o = [];
const P = (s) => o.push(s);
P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern></defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/><rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// header
P(`<text x="60" y="56" fill="${C.faint}" font-size="15" letter-spacing="6" font-weight="600">GEN0SEC · EAST-WEST VERDICT</text>`);
P(`<text x="60" y="126" fill="${C.ink}" font-size="42" font-weight="700" letter-spacing="-0.01em">web-frontend → payments-db:5432</text>`);
P(`<text x="60" y="160" fill="${C.sub}" font-size="16">Lateral attempt inside the Hauptkampffeld · inspected without decryption · 2026-06-21 02:14 UTC</text>`);
// verdict badge
P(`<rect x="1140" y="70" width="300" height="84" rx="12" fill="rgba(220,38,38,0.07)" stroke="${C.red}" stroke-width="2"/>`);
P(`<circle cx="1186" cy="112" r="9" fill="${C.red}"/>`);
P(`<text x="1212" y="106" fill="${C.red}" font-size="13" letter-spacing="3" font-weight="700">EAST-WEST</text>`);
P(`<text x="1212" y="138" fill="${C.red}" font-size="32" font-weight="700">DROP</text>`);

// panel + text helpers
function panel(x, y, w, h, tint) {
  P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${tint || "#ffffff"}" stroke="${tint ? C.red : C.line}" stroke-width="1.5"/>`);
}
const lbl = (x, y, col, t) => P(`<text x="${x}" y="${y}" fill="${col}" font-size="13" letter-spacing="3" font-weight="700">${t}</text>`);
const mono = (x, y, t, sz = 16, col = C.ink) => P(`<text x="${x}" y="${y}" fill="${col}" font-size="${sz}" font-weight="700">${t}</text>`);
const kv = (x, y, k) => P(`<text x="${x}" y="${y}" fill="${C.faint}" font-size="12" letter-spacing="2">${k}</text>`);
const val = (x, y, t, col = C.ink, sz = 15) => P(`<text x="${x}" y="${y}" fill="${col}" font-size="${sz}">${t}</text>`);

// ── ROW 1 — who, what, the rule ──
// SOURCE WORKLOAD
panel(60, 210, 430, 300);
lbl(84, 246, C.cyan, "SOURCE WORKLOAD");
mono(84, 288, "web-frontend-7c9f8", 18);
kv(84, 334, "KUBERNETES");
val(84, 360, "ns=prod · app=web · tier=frontend");
kv(84, 406, "IMAGE");
val(84, 432, "registry/web@sha256:4e… · public");
kv(84, 478, "IDENTITY");
val(84, 504, "ingress pod — no DB grant", C.cyan, 16);

// TARGET WORKLOAD
panel(520, 210, 430, 300);
lbl(544, 246, C.cyan, "TARGET WORKLOAD");
mono(544, 288, "payments-db :5432", 18);
kv(544, 334, "ZONE");
val(544, 360, "PCI · deny-by-default");
kv(544, 406, "ALLOWED CALLERS");
val(544, 432, "payments-api only");
kv(544, 478, "CONDITION");
val(544, 504, "signed build · port 5432", C.cyan, 16);

// WIREFILTER RULE
panel(980, 210, 460, 300);
lbl(1004, 246, C.blue, "WIREFILTER RULE");
mono(1004, 286, "allow tcp/5432 if", 15, C.sub);
mono(1004, 308, "  src.svc == \"payments-api\"", 15, C.ink);
mono(1004, 330, "  &amp;&amp; src.signed", 15, C.ink);
mono(1004, 352, "  &amp;&amp; dst == payments-db", 15, C.ink);
kv(1004, 404, "CALLER MATCHED?");
val(1004, 430, "no — web-frontend not in allowlist", C.red, 15);
kv(1004, 478, "DEFAULT ACTION");
mono(1004, 504, "deny", 18, C.red);

// ── ROW 2 — detection, fingerprint, decision ──
// THALAMUS IDS
panel(60, 540, 430, 300);
lbl(84, 576, C.purple, "THALAMUS · IDS");
kv(84, 622, "APP-LAYER PARSER");
mono(84, 648, "PGSQL startup intercepted", 16);
kv(84, 698, "SIGNATURE");
mono(84, 724, "LATERAL pg-client-anomaly", 15);
kv(84, 776, "VERDICT");
val(84, 802, "lateral movement · flow tracked", C.purple, 15);

// FINGERPRINT + CEREBELLUM
panel(520, 540, 430, 300);
lbl(544, 576, C.purple, "FINGERPRINT · CEREBELLUM");
kv(544, 622, "AT THE DOOR (L02)");
val(544, 648, "JA4 looked ordinary — passed", 16);
kv(544, 698, "INSIDE CLUSTER");
mono(544, 724, "LM-CLUSTER-03", 18);
kv(544, 776, "CONFIDENCE");
mono(544, 802, "0.88 · seen east-west on 6 hosts", 15);

// EAST-WEST ACTION
panel(980, 540, 460, 300, "rgba(220,38,38,0.05)");
lbl(1004, 576, C.red, "EAST-WEST ACTION");
kv(1004, 622, "DECIDED BY");
mono(1004, 648, "Amygdala — no static rule", 16);
kv(1004, 698, "EXECUTED BY");
mono(1004, 724, "Hillock — eBPF, in-kernel", 16);
kv(1004, 776, "INCIDENT");
val(1004, 802, "opened in Workflow (L04) · &lt; 1 ms", C.red, 15);

// footer
P(`<line x1="60" y1="922" x2="1440" y2="922" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="956" fill="${C.faint}" font-size="13">Per-workload deny-by-default · inspected without decryption · same Synapse binary as the edge, deployed at an inside chokepoint · synthetic example · TLP:CLEAR</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "eastwest-block-card.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "eastwest-block-card.png"));
console.log(`Wrote eastwest-block-card.svg and .png (${W * 2}x${H * 2})`);
