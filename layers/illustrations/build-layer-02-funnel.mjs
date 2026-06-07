// Layer 02 "shedding funnel" — the edge bleeds off the obvious cheaply, a thin
// enriched stream survives to Layer 03. Gen0Sec design, SVG → PNG via sharp.
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
const sharp = req("sharp");
const W = 1600, H = 900;
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", grid: "#e8eaef", orange: "#d97706", red: "#dc2626", green: "#16a34a", blue: "#006fff" };

const X0 = 320, X1 = 1280, TOPL = 300, TOPR = 460, BOTL = 660, BOTR = 500;
const topEdge = (x) => TOPL + ((x - X0) / (X1 - X0)) * (TOPR - TOPL);
const botEdge = (x) => BOTL + ((x - X0) / (X1 - X0)) * (BOTR - BOTL);

const segs = [
  { x0: 320, x1: 460, name: ["Volumetric", "DDoS scrubbing"], shed: "floods · amplification" },
  { x0: 460, x1: 660, name: ["Reputation &amp; geo", "Layer 01 IOCs"], shed: "known-bad IPs · regions" },
  { x0: 660, x1: 860, name: ["JA4+ fingerprint", "Amygdala · CTI"], shed: "flagged stacks · bots" },
  { x0: 860, x1: 1060, name: ["Rate-limit", "per IP / ASN / cred"], shed: "abuse · cred stuffing" },
  { x0: 1060, x1: 1280, name: ["Tag &amp; pass", ""], shed: "" },
];

const out = [];
const P = (s) => out.push(s);
P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="ar-red" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`  <marker id="ar-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${C.orange}"/></marker>`);
P(`  <marker id="ar-green" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.green}"/></marker>`);
P(`  <linearGradient id="fun" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(217,119,6,0.16)"/><stop offset="1" stop-color="rgba(217,119,6,0.05)"/></linearGradient>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// header
P(`<text x="60" y="56" fill="${C.faint}" font-size="16" letter-spacing="6" font-weight="600">GEN0SEC · ARCHITECTURE</text>`);
P(`<rect x="60" y="100" width="68" height="68" rx="10" fill="${C.orange}"/>`);
P(`<text x="94" y="144" fill="#ffffff" font-size="28" font-weight="700" text-anchor="middle">02</text>`);
P(`<text x="148" y="124" fill="${C.orange}" font-size="14" letter-spacing="4" font-weight="600">LAYER 02 · FORWARD DEFENSIVE BELT</text>`);
P(`<text x="148" y="158" fill="${C.ink}" font-size="32" font-weight="700">The edge sheds; it does not analyse.</text>`);
P(`<text x="148" y="190" fill="${C.sub}" font-size="16">Cheap, wire-speed filters bleed off the obvious before the deep layers ever pay for it.</text>`);

P(`<text x="${(X0 + X1) / 2}" y="248" fill="${C.faint}" font-size="13" letter-spacing="2" text-anchor="middle">WIRE-SPEED · NO DECRYPTION · STATELESS WHERE POSSIBLE</text>`);

// funnel body
P(`<polygon points="${X0},${TOPL} ${X1},${TOPR} ${X1},${BOTR} ${X0},${BOTL}" fill="url(#fun)" stroke="${C.orange}" stroke-width="1.6"/>`);

// stage dividers + labels + shed arrows
for (const s of segs) {
  const mx = (s.x0 + s.x1) / 2;
  if (s.x1 < X1) P(`<line x1="${s.x1}" y1="${topEdge(s.x1).toFixed(1)}" x2="${s.x1}" y2="${botEdge(s.x1).toFixed(1)}" stroke="${C.orange}" stroke-width="1" stroke-dasharray="5,5" opacity="0.6"/>`);
  // stage label above, with connector
  P(`<line x1="${mx}" y1="${(topEdge(mx) - 4).toFixed(1)}" x2="${mx}" y2="288" stroke="${C.orange}" stroke-width="0.8" stroke-dasharray="2,3" opacity="0.6"/>`);
  P(`<text x="${mx}" y="276" fill="${C.orange}" font-size="12.5" font-weight="700" text-anchor="middle">${s.name[0]}</text>`);
  if (s.name[1]) P(`<text x="${mx}" y="290" fill="${C.sub}" font-size="10.5" text-anchor="middle">${s.name[1]}</text>`);
  // shed arrow down
  if (s.shed) {
    const by = botEdge(mx);
    P(`<line x1="${mx}" y1="${(by + 4).toFixed(1)}" x2="${mx}" y2="${(by + 56).toFixed(1)}" stroke="${C.red}" stroke-width="1.8" marker-end="url(#ar-red)"/>`);
    P(`<text x="${mx}" y="${(by + 74).toFixed(1)}" fill="${C.red}" font-size="10.5" text-anchor="middle">drop: ${s.shed}</text>`);
  }
}

// entry
P(`<line x1="150" y1="480" x2="${X0 - 6}" y2="480" stroke="${C.orange}" stroke-width="7" marker-end="url(#ar-orange)" opacity="0.9"/>`);
P(`<text x="175" y="462" fill="${C.ink}" font-size="13" font-weight="700">ALL INBOUND</text>`);
P(`<text x="175" y="500" fill="${C.faint}" font-size="12">100% of traffic</text>`);

// exit (thin survivor)
P(`<line x1="${X1 + 4}" y1="480" x2="1372" y2="480" stroke="${C.green}" stroke-width="3" marker-end="url(#ar-green)"/>`);
P(`<text x="1382" y="466" fill="${C.green}" font-size="13" font-weight="700">tag &amp; pass</text>`);
P(`<text x="1382" y="486" fill="${C.sub}" font-size="11">the thin survivor —</text>`);
P(`<text x="1382" y="502" fill="${C.sub}" font-size="11">enriched: JA4+,</text>`);
P(`<text x="1382" y="518" fill="${C.sub}" font-size="11">reputation, ASN</text>`);
P(`<text x="1382" y="540" fill="${C.green}" font-size="12" font-weight="700">→ Layer 03</text>`);

// volume annotations inside funnel
P(`<text x="345" y="${((topEdge(330) + botEdge(330)) / 2 + 5).toFixed(1)}" fill="${C.orange}" font-size="13" font-weight="700">100%</text>`);
P(`<text x="1180" y="476" fill="${C.orange}" font-size="11" font-weight="700">few %</text>`);

// footer
P(`<line x1="60" y1="800" x2="1540" y2="800" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="840" fill="${C.orange}" font-size="12" letter-spacing="3" font-weight="700">DOCTRINE</text>`);
P(`<text x="60" y="872" fill="${C.ink}" font-size="22" font-weight="500">Kill the cheap and obvious at the edge. Spend depth only on what survives.</text>`);

P(`</svg>`);
const svg = out.join("\n");
await writeFile(path.join(here, "layer-02-edge-funnel.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "layer-02-edge-funnel.png"));
console.log(`Wrote layer-02-edge-funnel.svg and .png (${W * 2}x${H * 2})`);
