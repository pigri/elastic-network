// JA4+ connection-fingerprint card — "what the edge tags" showcase for Layer 02.
// Same card language as cti-verdict-card. Synthetic example (TLP:CLEAR);
// source IP is RFC 5737 documentation space. SVG → PNG via sharp.
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
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
P(`<text x="60" y="56" fill="${C.faint}" font-size="15" letter-spacing="6" font-weight="600">GEN0SEC · CONNECTION FINGERPRINT</text>`);
P(`<text x="60" y="128" fill="${C.ink}" font-size="52" font-weight="700" letter-spacing="-0.01em">203.0.113.47 → :443</text>`);
P(`<text x="60" y="162" fill="${C.sub}" font-size="16">TLS 1.3 flow · classified at the edge, no decryption · 2026-06-21 09:14 UTC</text>`);
// verdict badge
P(`<rect x="1140" y="70" width="300" height="84" rx="12" fill="rgba(220,38,38,0.07)" stroke="${C.red}" stroke-width="2"/>`);
P(`<circle cx="1186" cy="112" r="9" fill="${C.red}"/>`);
P(`<text x="1212" y="106" fill="${C.red}" font-size="13" letter-spacing="3" font-weight="700">EDGE ACTION</text>`);
P(`<text x="1212" y="138" fill="${C.red}" font-size="32" font-weight="700">BLOCK</text>`);

// panel helper
function panel(x, y, w, h, tint) {
  P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${tint || "#ffffff"}" stroke="${tint ? C.red : C.line}" stroke-width="1.5"/>`);
}
const lbl = (x, y, col, t) => P(`<text x="${x}" y="${y}" fill="${col}" font-size="13" letter-spacing="3" font-weight="700">${t}</text>`);
const mono = (x, y, t, sz = 16) => P(`<text x="${x}" y="${y}" fill="${C.ink}" font-size="${sz}" font-weight="700">${t}</text>`);
const kv = (x, y, k) => P(`<text x="${x}" y="${y}" fill="${C.faint}" font-size="12" letter-spacing="2">${k}</text>`);
const val = (x, y, t, col = C.ink, sz = 15) => P(`<text x="${x}" y="${y}" fill="${col}" font-size="${sz}">${t}</text>`);

// ── ROW 1 — fingerprint dimensions ──
// JA4 · TLS CLIENT
panel(60, 210, 430, 300);
lbl(84, 246, C.cyan, "JA4 · TLS CLIENT");
mono(84, 290, "t13d1516h2_8daaf6152771", 16);
mono(84, 314, "_b186095e22b6", 16);
kv(84, 360, "DECODES TO");
val(84, 386, "TLS 1.3 · 21 ciphers · ALPN h2 · SNI set");
kv(84, 432, "IDENTIFIES");
val(84, 458, "Go net/http stack —", C.cyan, 16);
val(84, 480, "common in scanners &amp; bots", C.cyan, 16);

// JA4T · TCP SYN
panel(520, 210, 430, 300);
lbl(544, 246, C.cyan, "JA4T · TCP SYN");
mono(544, 290, "64240_2-4-8-1-3_1460_8", 16);
kv(544, 360, "DECODES TO");
val(544, 386, "window 64240 · MSS 1460 · 5 opts");
kv(544, 432, "IDENTIFIES");
val(544, 458, "Linux 5.x network stack", C.cyan, 16);

// JA4H · HTTP
panel(980, 210, 460, 300);
lbl(1004, 246, C.cyan, "JA4H · HTTP REQUEST");
mono(1004, 290, "ge11nn04enus", 16);
mono(1004, 314, "_1b2c3d4e5f60", 16);
kv(1004, 360, "DECODES TO");
val(1004, 386, "GET · HTTP/1.1 · no cookie/referer");
val(1004, 408, "4 headers · accept-lang en-US");
kv(1004, 454, "IDENTIFIES");
val(1004, 480, "minimal, non-browser client", C.cyan, 16);

// ── ROW 2 — distance, match, action ──
// JA4L · LATENCY
panel(60, 540, 430, 300);
lbl(84, 576, C.purple, "JA4L · LATENCY / DISTANCE");
kv(84, 624, "ROUND-TRIP");
mono(84, 652, "~12 ms", 22);
kv(84, 700, "TTL / HOPS");
mono(84, 728, "54 · ~10 hops", 22);
kv(84, 776, "INFERS");
val(84, 802, "hosted / datacenter origin", C.purple, 16);

// CEREBELLUM MATCH
panel(520, 540, 430, 300);
lbl(544, 576, C.purple, "CEREBELLUM MATCH");
kv(544, 624, "CLUSTER");
mono(544, 652, "SCAN-CLUSTER-07", 20);
kv(544, 700, "CONFIDENCE");
mono(544, 728, "0.91", 22);
kv(544, 776, "CORROBORATION");
val(544, 802, "seen on 9 other tenants this week", C.sub, 15);

// EDGE ACTION
panel(980, 540, 460, 300, "rgba(220,38,38,0.05)");
lbl(1004, 576, C.red, "EDGE ACTION");
kv(1004, 624, "ENFORCED BY");
mono(1004, 652, "Amygdala — inline, no static rule", 17);
kv(1004, 700, "TAG TO LAYER 03");
mono(1004, 728, "scanner → Thalamus", 17);
kv(1004, 776, "DECIDED IN");
val(1004, 802, "&lt; 1 ms · pre-handshake · no plaintext read", C.red, 15);

// footer
P(`<line x1="60" y1="922" x2="1440" y2="922" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="956" fill="${C.faint}" font-size="13">JA4+ suite · fingerprinted pre-handshake · zero decryption · synthetic example (RFC 5737 address) · TLP:CLEAR</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "ja4-fingerprint-card.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "ja4-fingerprint-card.png"));
console.log(`Wrote ja4-fingerprint-card.svg and .png (${W * 2}x${H * 2})`);
