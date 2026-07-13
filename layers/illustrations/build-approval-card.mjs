// Outcome-approval card — "approve the outcome, not the alert" showcase for Layer 04.
// A Workflow → Slack approval prompt: the action, its blast radius, the confidence,
// the provenance, and a yes/no on the effect. Synthetic (TLP:CLEAR); RFC 5737 range.
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
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", line: "#d5d9e0", grid: "#e8eaef", purple: "#9333ea", green: "#16a34a", red: "#dc2626", orange: "#d97706", blue: "#006fff" };

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
P(`<text x="60" y="56" fill="${C.faint}" font-size="15" letter-spacing="6" font-weight="600">GEN0SEC · WORKFLOW — OUTCOME APPROVAL</text>`);
// bot identity row
P(`<rect x="60" y="80" width="44" height="44" rx="9" fill="${C.purple}"/>`);
P(`<text x="82" y="108" fill="#ffffff" font-size="20" font-weight="700" text-anchor="middle">W</text>`);
P(`<text x="118" y="100" fill="${C.ink}" font-size="18" font-weight="700">Workflow</text>`);
P(`<text x="210" y="100" fill="${C.faint}" font-size="13">bot · #soc-actions · 02:14 UTC</text>`);
P(`<text x="118" y="120" fill="${C.sub}" font-size="13">Counterstrike ready — needs a decision on the outcome.</text>`);
// status badge
P(`<rect x="1150" y="78" width="290" height="48" rx="10" fill="rgba(217,119,6,0.08)" stroke="${C.orange}" stroke-width="2"/>`);
P(`<circle cx="1180" cy="102" r="7" fill="${C.orange}"/>`);
P(`<text x="1198" y="107" fill="${C.orange}" font-size="15" letter-spacing="2" font-weight="700">AWAITING APPROVAL</text>`);

// the ASK
P(`<rect x="60" y="150" width="1380" height="96" rx="12" fill="rgba(147,51,234,0.04)" stroke="${C.purple}" stroke-width="1.6"/>`);
P(`<rect x="60" y="150" width="6" height="96" rx="3" fill="${C.purple}"/>`);
lbl(88, 184, C.purple, "PROPOSED ACTION");
P(`<text x="88" y="222" fill="${C.ink}" font-size="30" font-weight="700">Block 198.51.100.0/24 across all 14 sensors</text>`);

// ── ROW 1 — why, effect ──
panel(60, 268, 680, 230);
lbl(88, 304, C.blue, "WHY — TRIGGER");
kv(88, 344, "DETECTION");
val(88, 366, "JA4T match → scanner cluster");
kv(88, 406, "CEREBELLUM");
mono(88, 428, "SCAN-CLUSTER-07 · confidence 0.94", 16);
kv(88, 466, "CORROBORATION");
val(88, 488, "seen on 9 tenants / 7 days", C.sub, 14);

panel(760, 268, 680, 230, "rgba(22,163,74,0.04)");
lbl(788, 304, C.green, "EFFECT — BLAST RADIUS");
kv(788, 344, "INBOUND AFFECTED");
mono(788, 366, "~6 connections / hour", 16);
kv(788, 406, "KNOWN CUSTOMERS HIT");
mono(788, 428, "0 — no customer fingerprints", 16, C.green);
kv(788, 466, "ROLLBACK");
val(788, 488, "fleet-wide · 1 click", C.green, 14);

// ── ROW 2 — provenance, scope ──
panel(60, 520, 680, 200);
lbl(88, 556, C.sub, "PROVENANCE — AUDITABLE");
kv(88, 596, "DETECTION ID");
mono(88, 622, "det_8f3a…  → playbook pb-scan-block", 15);
kv(88, 664, "RULE ID");
mono(88, 690, "rule_2f9c · authored by Cerebellum", 15);

panel(760, 520, 680, 200);
lbl(788, 556, C.purple, "SCOPE — FLEET");
kv(788, 596, "TARGETS");
mono(788, 622, "14 Cerebrum + Synapse", 16);
kv(788, 664, "PROPAGATION");
mono(788, 690, "compiled &amp; pushed in &lt; 1 s", 16, C.purple);

// decision buttons
P(`<rect x="60" y="752" width="320" height="64" rx="10" fill="${C.green}"/>`);
P(`<text x="220" y="792" fill="#ffffff" font-size="20" font-weight="700" text-anchor="middle">✓ Approve outcome</text>`);
P(`<rect x="400" y="752" width="220" height="64" rx="10" fill="#ffffff" stroke="${C.sub}" stroke-width="1.6"/>`);
P(`<text x="510" y="792" fill="${C.sub}" font-size="20" font-weight="700" text-anchor="middle">Reject</text>`);
P(`<text x="660" y="784" fill="${C.ink}" font-size="16" font-weight="700">You approve the effect —</text>`);
P(`<text x="660" y="806" fill="${C.sub}" font-size="14">not a triage of the evidence. The question is “should we”, not “is it real”.</text>`);

// footer
P(`<line x1="60" y1="922" x2="1440" y2="922" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="956" fill="${C.faint}" font-size="13">High-confidence actions auto-execute; this one crossed the human-approval threshold · audit feeds Cerebellum (L05) · synthetic example (RFC 5737) · TLP:CLEAR</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "outcome-approval-card.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "outcome-approval-card.png"));
console.log(`Wrote outcome-approval-card.svg and .png (${W * 2}x${H * 2})`);
