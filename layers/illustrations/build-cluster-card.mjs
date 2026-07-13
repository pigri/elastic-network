// Adversary-cluster card — "what Cerebellum emits" showcase for Layer 05. A behavioural
// cluster assembled across the fleet, scored, and turned into policy + a written
// explanation. Same card language as cti-verdict / ja4 cards. Synthetic; TLP:CLEAR.
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
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", line: "#d5d9e0", grid: "#e8eaef", green: "#16a34a", blue: "#006fff", cyan: "#0891b2", purple: "#9333ea", orange: "#d97706", red: "#dc2626" };

const o = [];
const P = (s) => o.push(s);
const lbl = (x, y, col, t) => P(`<text x="${x}" y="${y}" fill="${col}" font-size="13" letter-spacing="3" font-weight="700">${t}</text>`);
const mono = (x, y, t, sz = 16, col = C.ink) => P(`<text x="${x}" y="${y}" fill="${col}" font-size="${sz}" font-weight="700">${t}</text>`);
const kv = (x, y, k) => P(`<text x="${x}" y="${y}" fill="${C.faint}" font-size="12" letter-spacing="2">${k}</text>`);
const val = (x, y, t, col = C.ink, sz = 15) => P(`<text x="${x}" y="${y}" fill="${col}" font-size="${sz}">${t}</text>`);
const panel = (x, y, w, h, tint) => P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${tint || "#ffffff"}" stroke="${C.line}" stroke-width="1.5"/>`);

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern></defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/><rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// header
P(`<text x="60" y="56" fill="${C.faint}" font-size="15" letter-spacing="6" font-weight="600">GEN0SEC · CEREBELLUM — ADVERSARY CLUSTER</text>`);
P(`<text x="60" y="128" fill="${C.ink}" font-size="50" font-weight="700" letter-spacing="-0.01em">SCAN-CLUSTER-07</text>`);
P(`<text x="60" y="162" fill="${C.sub}" font-size="16">A behavioural cluster, assembled across the fleet — not an IP list · last updated 2026-06-21 02:40 UTC</text>`);
// badge
P(`<rect x="1140" y="70" width="300" height="84" rx="12" fill="rgba(22,163,74,0.07)" stroke="${C.green}" stroke-width="2"/>`);
P(`<circle cx="1186" cy="112" r="9" fill="${C.green}"/>`);
P(`<text x="1212" y="106" fill="${C.green}" font-size="13" letter-spacing="3" font-weight="700">STATUS</text>`);
P(`<text x="1212" y="138" fill="${C.green}" font-size="28" font-weight="700">POLICY EMITTED</text>`);

// ── ROW 1 — what, shape, confidence ──
panel(60, 210, 430, 300);
lbl(84, 246, C.cyan, "WHAT IT IS");
kv(84, 292, "CATEGORY");
mono(84, 318, "scanner · recon", 18);
kv(84, 364, "UNIT OF RECOGNITION");
val(84, 390, "the adversary's shape,");
val(84, 412, "not a single packet or IP");
kv(84, 458, "FIRST CLUSTERED");
val(84, 484, "7 days ago · still active", C.cyan, 15);

panel(520, 210, 430, 300);
lbl(544, 246, C.cyan, "SHAPE — MEMBERS");
kv(544, 292, "JA4");
mono(544, 316, "t13d1516h2_8daaf…", 15);
kv(544, 356, "JA4T / JA4H");
mono(544, 380, "64240_2-4-8… / ge11nn…", 15);
kv(544, 420, "FINGERPRINTS");
mono(544, 444, "312 variants", 17);
kv(544, 480, "SPREAD");
val(544, 504, "9 tenants · 12 sites", C.cyan, 15);

panel(980, 210, 460, 300);
lbl(1004, 246, C.purple, "CONFIDENCE");
kv(1004, 292, "SCORE");
mono(1004, 320, "0.93", 26);
kv(1004, 368, "TRAINED ON");
val(1004, 394, "outcomes — blocks that held,");
val(1004, 416, "overrides that didn't");
kv(1004, 462, "REASON CODE");
mono(1004, 486, "MULTI_RECENT_SIGNALS", 15, C.purple);

// ── ROW 2 — emitted policy, explanation, propagation ──
panel(60, 540, 430, 300);
lbl(84, 576, C.green, "EMITTED POLICY");
const arts = ["Thalamus rule  rule_2f9c", "Hillock blocklist entry", "JA4+ classification: scanner", "Workflow playbook trigger", "CTI verdict (Layer 01)"];
arts.forEach((t, i) => {
  const y = 614 + i * 36;
  P(`<text x="84" y="${y}" fill="${C.green}" font-size="15" font-weight="700">✓</text>`);
  P(`<text x="108" y="${y}" fill="${C.ink}" font-size="14">${t}</text>`);
});

panel(520, 540, 430, 300);
lbl(544, 576, C.orange, "EXPLANATION — GENERATED");
val(544, 612, "“Automated recon stack");
val(544, 634, "probing exposed admin and");
val(544, 656, "login endpoints across the");
val(544, 678, "fleet. Non-browser JA4T,");
val(544, 700, "datacenter origin. Block on");
val(544, 722, "fingerprint, pre-handshake.”");
kv(544, 770, "THIS IS THE AUDIT TRAIL");
val(544, 796, "institutional memory, per artifact", C.sub, 13);

panel(980, 540, 460, 300, "rgba(22,163,74,0.04)");
lbl(1004, 576, C.green, "PROPAGATION");
kv(1004, 616, "PUSHED TO FLEET IN");
mono(1004, 644, "1.8 s", 24);
kv(1004, 692, "REACH");
val(1004, 718, "every Cerebrum + Synapse,");
val(1004, 740, "including never-attacked tenants");
kv(1004, 786, "EFFECT");
val(1004, 812, "the 101st is protected day one", C.green, 15);

// footer
P(`<line x1="60" y1="922" x2="1440" y2="922" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="956" fill="${C.faint}" font-size="13">Clustered on aggregated fingerprint &amp; behavioural data — never payload · confidence trained on outcomes · synthetic example · TLP:CLEAR</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "adversary-cluster-card.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "adversary-cluster-card.png"));
console.log(`Wrote adversary-cluster-card.svg and .png (${W * 2}x${H * 2})`);
