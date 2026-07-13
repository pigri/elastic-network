// Layer 03 microsegmentation mesh — "there is no inside; every workload boundary
// is another wall." Gen0Sec architecture figure (companion to L02's edge-funnel).
// SVG → PNG via sharp.
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
const C = { ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", grid: "#e8eaef", line: "#d5d9e0", blue: "#006fff", green: "#16a34a", red: "#dc2626" };

// grid geometry
const colX = [360, 555, 750, 945];
const rowY = [322, 444, 566];
const CW = 165, CH = 94;
const cx = (c) => colX[c] + CW / 2;
const cy = (r) => rowY[r] + CH / 2;
const right = (c) => colX[c] + CW;
const left = (c) => colX[c];
const top = (r) => rowY[r];
const bot = (r) => rowY[r] + CH;

const o = [];
const P = (s) => o.push(s);
const halo = (xc, y, w, h = 16) => P(`<rect x="${xc - w / 2}" y="${y - 12}" width="${w}" height="${h}" fill="#ffffff" opacity="0.92"/>`);
const lblC = (xc, y, t, col, sz = 11, wt = 700) => { halo(xc, y, t.length * sz * 0.62 + 10, sz + 5); P(`<text x="${xc}" y="${y}" fill="${col}" font-size="${sz}" font-weight="${wt}" text-anchor="middle">${t}</text>`); };

// cells: [col,row,name,identity,popped?]
const cells = [
  [0, 0, "web-frontend", "ingress · public", true],
  [1, 0, "api-gateway", "svc · authn", false],
  [2, 0, "auth-svc", "svc · OIDC", false],
  [3, 0, "session-cache", "redis :6379", false],
  [0, 1, "orders-api", "svc · signed", false],
  [1, 1, "payments-api", "svc · PCI", false],
  [2, 1, "inventory", "svc", false],
  [3, 1, "message-queue", "amqp :5672", false],
  [0, 2, "orders-db", "pg :5432", false],
  [1, 2, "payments-db", "pg :5432 · PCI", false],
  [2, 2, "inventory-db", "pg :5432", false],
  [3, 2, "audit-log", "append-only", false],
];

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="ar-green" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.green}"/></marker>`);
P(`  <marker id="ar-red" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`  <marker id="ar-blue" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.blue}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// HEADER
P(`<text x="60" y="56" fill="${C.faint}" font-size="16" letter-spacing="6" font-weight="600">GEN0SEC · ARCHITECTURE</text>`);
P(`<rect x="60" y="100" width="68" height="68" rx="10" fill="${C.blue}"/>`);
P(`<text x="94" y="144" fill="#ffffff" font-size="28" font-weight="700" text-anchor="middle">03</text>`);
P(`<text x="148" y="124" fill="${C.blue}" font-size="14" letter-spacing="4" font-weight="600">LAYER 03 · MAIN DEFENSIVE ZONE</text>`);
P(`<text x="148" y="158" fill="${C.ink}" font-size="32" font-weight="700">There is no inside. Every boundary is another wall.</text>`);
P(`<text x="148" y="190" fill="${C.sub}" font-size="16">Per-workload deny-by-default. Lateral movement costs evidence and time at every hop.</text>`);

P(`<text x="${cx(0)}" y="262" fill="${C.faint}" font-size="13" letter-spacing="2">EAST-WEST · DENY-BY-DEFAULT · WORKLOAD-SCOPED</text>`);

// CELLS
for (const [c, r, name, id, popped] of cells) {
  const x = left(c), y = top(r);
  const fill = popped ? "rgba(220,38,38,0.07)" : "#ffffff";
  const stroke = popped ? C.red : C.line;
  P(`<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="${popped ? 2 : 1.5}"/>`);
  // small "wall" tick marks on each side to read the border as a wall
  P(`<g stroke="${popped ? C.red : C.line}" stroke-width="1" opacity="0.7"><line x1="${x}" y1="${y + CH / 2 - 7}" x2="${x}" y2="${y + CH / 2 + 7}"/><line x1="${x + CW}" y1="${y + CH / 2 - 7}" x2="${x + CW}" y2="${y + CH / 2 + 7}"/></g>`);
  P(`<text x="${x + CW / 2}" y="${y + 38}" fill="${popped ? C.red : C.ink}" font-size="14.5" font-weight="700" text-anchor="middle">${name}</text>`);
  P(`<text x="${x + CW / 2}" y="${y + 60}" fill="${C.faint}" font-size="11" text-anchor="middle">${id}</text>`);
  if (popped) {
    P(`<rect x="${x + CW / 2 - 36}" y="${y + 70}" width="72" height="16" rx="3" fill="${C.red}"/>`);
    P(`<text x="${x + CW / 2}" y="${y + 82}" fill="#ffffff" font-size="10" font-weight="700" letter-spacing="1" text-anchor="middle">POPPED</text>`);
  } else {
    P(`<text x="${x + CW / 2}" y="${y + 80}" fill="${C.green}" font-size="9.5" text-anchor="middle">deny-by-default</text>`);
  }
}

// ALLOWED edges (green) — the explicit allowlist
// web→api (H), api→auth (H), api→payments-api (V), payments-api→payments-db (V)
function hEdge(c0, c1, r, port, col, marker, dash) {
  const y = cy(r);
  P(`<line x1="${right(c0)}" y1="${y}" x2="${left(c1) - 2}" y2="${y}" stroke="${col}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""} marker-end="url(#${marker})"/>`);
  lblC((right(c0) + left(c1)) / 2, y - 8, port, col, 10);
}
function vEdge(c, r0, r1, port, col, marker, dash) {
  const x = cx(c);
  P(`<line x1="${x}" y1="${bot(r0)}" x2="${x}" y2="${top(r1) - 2}" stroke="${col}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""} marker-end="url(#${marker})"/>`);
  lblC(x, (bot(r0) + top(r1)) / 2 + 4, port, col, 10);
}
hEdge(0, 1, 0, ":443", C.green, "ar-green");
hEdge(1, 2, 0, ":8443", C.green, "ar-green");
vEdge(1, 0, 1, ":8080", C.green, "ar-green");
vEdge(1, 1, 2, ":5432", C.green, "ar-green");

// BLOCKED lateral attempts (red dashed → wall, X at target)
function xMark(x, y, col) { P(`<g stroke="${col}" stroke-width="2.6"><line x1="${x - 9}" y1="${y - 9}" x2="${x + 9}" y2="${y + 9}"/><line x1="${x + 9}" y1="${y - 9}" x2="${x - 9}" y2="${y + 9}"/></g>`); }
// web(0,0) → orders-api(0,1): straight down, blocked
P(`<line x1="${cx(0)}" y1="${bot(0)}" x2="${cx(0)}" y2="${top(1) - 4}" stroke="${C.red}" stroke-width="2" stroke-dasharray="6,5" marker-end="url(#ar-red)" opacity="0.85"/>`);
xMark(cx(0), top(1) - 6, C.red);
// web(0,0) → payments-api(1,1): diagonal, blocked
P(`<line x1="${right(0) - 16}" y1="${bot(0) - 8}" x2="${left(1) + 6}" y2="${top(1) + 8}" stroke="${C.red}" stroke-width="2" stroke-dasharray="6,5" marker-end="url(#ar-red)" opacity="0.85"/>`);
xMark(left(1) + 10, top(1) + 14, C.red);
// api-gateway(1,0) → payments-db(1,2): deep pivot routed through the col1/col2 gutter,
// dropped at payments-db on identity. Caption lives in the whitespace above the grid.
const GUT = (right(1) + left(2)) / 2; // clean vertical channel between columns 1 and 2
P(`<path d="M ${right(1) - 18} ${bot(0)} L ${GUT} ${bot(0) + 14} L ${GUT} ${top(2) - 16} L ${right(1) - 18} ${top(2) - 4}" fill="none" stroke="${C.red}" stroke-width="2" stroke-dasharray="6,5" marker-end="url(#ar-red)" opacity="0.85"/>`);
xMark(right(1) - 18, top(2) - 6, C.red);
P(`<line x1="${GUT}" y1="296" x2="${GUT}" y2="${bot(0) + 6}" stroke="${C.red}" stroke-width="1" stroke-dasharray="2,3" opacity="0.55"/>`);
lblC(GUT, 290, "api → db pivot: blocked on identity", C.red, 11);

// legend for edge colors
P(`<line x1="380" y1="700" x2="420" y2="700" stroke="${C.green}" stroke-width="2" marker-end="url(#ar-green)"/>`);
P(`<text x="430" y="704" fill="${C.sub}" font-size="12">explicit allow (workload · port · identity)</text>`);
P(`<line x1="780" y1="700" x2="820" y2="700" stroke="${C.red}" stroke-width="2" stroke-dasharray="6,5" marker-end="url(#ar-red)"/>`);
P(`<text x="830" y="704" fill="${C.sub}" font-size="12">lateral attempt → dropped at the wall</text>`);

// RIGHT PANEL — enforced per workload (the chain)
const PX = 1170, PW = 372;
P(`<rect x="${PX}" y="300" width="${PW}" height="360" rx="12" fill="rgba(0,111,255,0.04)" stroke="${C.line}" stroke-width="1.5"/>`);
P(`<text x="${PX + PW / 2}" y="334" fill="${C.blue}" font-size="13" letter-spacing="2" font-weight="700" text-anchor="middle">ENFORCED ON EVERY SYNAPSE</text>`);
const chain = [
  ["Amygdala", "decides — wirefilter over fingerprints", C.blue],
  ["Hillock", "executes the drop — eBPF, in-kernel", C.blue],
  ["Thalamus", "sees the attempt — IDS telemetry", C.sub],
  ["Cortex → Cerebellum", "local ML ships findings up → L05", C.green],
];
let yy = 372;
chain.forEach(([t, d, col], i) => {
  P(`<rect x="${PX + 24}" y="${yy}" width="${PW - 48}" height="50" rx="8" fill="#ffffff" stroke="${C.line}" stroke-width="1.2"/>`);
  P(`<text x="${PX + 40}" y="${yy + 22}" fill="${col}" font-size="15" font-weight="700">${t}</text>`);
  P(`<text x="${PX + 40}" y="${yy + 40}" fill="${C.sub}" font-size="11">${d}</text>`);
  if (i < chain.length - 1) P(`<line x1="${PX + PW / 2}" y1="${yy + 50}" x2="${PX + PW / 2}" y2="${yy + 62}" stroke="${C.faint}" stroke-width="1.5" marker-end="url(#ar-blue)"/>`);
  yy += 68;
});

// FOOTER
P(`<line x1="60" y1="790" x2="1540" y2="790" stroke="${C.grid}" stroke-width="1"/>`);
P(`<text x="60" y="828" fill="${C.blue}" font-size="12" letter-spacing="3" font-weight="700">DOCTRINE</text>`);
P(`<text x="60" y="860" fill="${C.ink}" font-size="22" font-weight="500">Pop one workload and you have popped one workload. The next wall is still deny-by-default.</text>`);

P(`</svg>`);
const svg = o.join("\n");
await writeFile(path.join(here, "layer-03-microseg-mesh.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 }).resize({ width: W * 2, height: H * 2, fit: "fill" }).png({ compressionLevel: 9 }).toFile(path.join(here, "layer-03-microseg-mesh.png"));
console.log(`Wrote layer-03-microseg-mesh.svg and .png (${W * 2}x${H * 2})`);
