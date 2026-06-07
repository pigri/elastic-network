// Gen0Sec "depth map" diagram template.
// Copy to your target dir as build-<name>.mjs, then adapt: scale, zones, units, arrows.
// Run: node build-<name>.mjs  → writes <name>.svg and <name>.png (2× viewBox).
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
// sharp is borrowed from the landing app — do not install. If moved, find with:
//   ls /home/pigri/work/gen0sec/*/node_modules/.pnpm/ | grep sharp
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
const sharp = req("sharp");

const NAME = "depth-map"; // <-- output basename
const W = 1600, H = 1240;

const C = {
  ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", line: "#d5d9e0", grid: "#e8eaef",
  blue: "#006fff", cyan: "#0891b2", green: "#16a34a", purple: "#9333ea", orange: "#d97706", red: "#dc2626", slate: "#8b92a5",
};

// ── primary axis: domain unit → x. Adapt MIN/PX. ──────────────────────
const AXIS_MIN = -2, AXIS_MAX = 20, MARGIN = 150, PX = 63.2; // px per unit
const x = (v) => MARGIN + (v - AXIS_MIN) * PX;

const MAP_TOP = 232, MAP_BOT = 1058;
const out = [];
const P = (s) => out.push(s);

// ── frame, defs, header ───────────────────────────────────────────────
P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="atk" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`  <marker id="ctr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.blue}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);
P(`<text x="60" y="52" fill="${C.faint}" font-size="15" letter-spacing="6" font-weight="600">GEN0SEC · DOCTRINE</text>`);
P(`<text x="60" y="92" fill="${C.ink}" font-size="30" font-weight="700">Diagram title</text>`);
P(`<text x="60" y="120" fill="${C.sub}" font-size="14">One-line subtitle describing what the figure shows.</text>`);

// ── zone background bands ─────────────────────────────────────────────
const band = (a, b, fill) => P(`<rect x="${x(a).toFixed(1)}" y="${MAP_TOP}" width="${(x(b) - x(a)).toFixed(1)}" height="${MAP_BOT - MAP_TOP}" fill="${fill}"/>`);
band(-2, 0, "rgba(139,146,165,0.06)");
band(0, 6.5, "rgba(0,111,255,0.05)");
band(6.5, 20, "rgba(8,145,178,0.045)");

// ── wavy vertical "position" lines ────────────────────────────────────
function wavyV(cx, y0, y1, amp, step = 26) {
  let d = `M ${cx.toFixed(1)} ${y0}`, dir = 1;
  for (let y = y0; y < y1; y += step) {
    const ny = Math.min(y + step, y1), cxp = cx + dir * amp;
    d += ` Q ${cxp.toFixed(1)} ${((y + ny) / 2).toFixed(1)} ${cx.toFixed(1)} ${ny}`; dir *= -1;
  }
  return d;
}
const defLine = (v, { color = C.blue, w = 1.4, op = 0.5, amp = 7 } = {}) =>
  P(`<path d="${wavyV(x(v), MAP_TOP + 6, MAP_BOT - 6, amp)}" fill="none" stroke="${color}" stroke-width="${w}" opacity="${op}"/>`);
defLine(0, { color: C.red, w: 2.4, op: 0.85, amp: 9 });
defLine(3, { color: C.cyan, op: 0.5 });

// ── named vertical guides with bottom labels ──────────────────────────
function namedLine(v, lines) {
  const xx = x(v);
  P(`<line x1="${xx.toFixed(1)}" y1="${MAP_TOP}" x2="${xx.toFixed(1)}" y2="${MAP_BOT}" stroke="${C.line}" stroke-width="1" stroke-dasharray="2 5"/>`);
  lines.forEach((t, i) => P(`<text x="${xx.toFixed(1)}" y="${MAP_BOT + 22 + i * 15}" fill="${C.sub}" font-size="11.5" text-anchor="middle">${t}</text>`));
}
namedLine(0, ["Front", "line"]);

// ── lateral boundaries (dashed, echelon marks with sized white halos) ─
function boundary(y, ech, atVals) {
  P(`<line x1="${x(AXIS_MIN + 0.2).toFixed(1)}" y1="${y}" x2="${x(AXIS_MAX - 0.5).toFixed(1)}" y2="${y}" stroke="${C.faint}" stroke-width="1.2" stroke-dasharray="7 5"/>`);
  for (const v of atVals) {
    const xx = x(v), hw = ech.length * 4.4 + 12;
    P(`<rect x="${(xx - hw).toFixed(1)}" y="${y - 9}" width="${(hw * 2).toFixed(1)}" height="18" fill="#ffffff"/>`);
    P(`<text x="${xx.toFixed(1)}" y="${y + 4}" fill="${C.faint}" font-size="12" letter-spacing="3" text-anchor="middle" font-weight="600">${ech}</text>`);
  }
}
boundary(255, "XXX", [-1, 4, 11, 16]);
boundary(650, "XX", [-1, 4, 11, 16]);
boundary(1045, "XXX", [-1, 4, 11, 16]);

// ── column headers (term + small gloss) ───────────────────────────────
function colHead(v, term, gloss, color) {
  P(`<text x="${x(v).toFixed(1)}" y="168" fill="${color}" font-size="12.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">${term}</text>`);
  P(`<text x="${x(v).toFixed(1)}" y="186" fill="${C.faint}" font-size="10.5" text-anchor="middle">${gloss}</text>`);
}
colHead(3, "ZONE NAME", "english gloss", C.blue);

// ── top brackets (super-zones); halo sized to label length ────────────
function bracket(a, b, label, color) {
  const x0 = x(a), x1 = x(b), y = 210, hw = label.length * 4.9 + 16;
  P(`<path d="M ${x0.toFixed(1)} ${y - 8} L ${x0.toFixed(1)} ${y} L ${x1.toFixed(1)} ${y} L ${x1.toFixed(1)} ${y - 8}" fill="none" stroke="${color}" stroke-width="1.4"/>`);
  P(`<rect x="${((x0 + x1) / 2 - hw).toFixed(1)}" y="${y - 9}" width="${(hw * 2).toFixed(1)}" height="18" fill="#ffffff"/>`);
  P(`<text x="${((x0 + x1) / 2).toFixed(1)}" y="${y + 4}" fill="${color}" font-size="13" font-weight="700" letter-spacing="2" text-anchor="middle">${label}</text>`);
}
bracket(-2, 6.5, "FORWARD ZONE", C.blue);
bracket(6.5, 20, "REAR ZONE", C.cyan);

// ── unit symbols ──────────────────────────────────────────────────────
// types: infantry | armor | mech | arty | mg | mortar | ssm | at | antiland | cp
function unit({ km, cy, type, ech = "", label = [], color, uw = 50, uh = 32 }) {
  const cx = x(km), left = cx - uw / 2, top = cy - uh / 2, g = [];
  g.push(`<rect x="${left.toFixed(1)}" y="${top.toFixed(1)}" width="${uw}" height="${uh}" rx="3" fill="#ffffff" stroke="${color}" stroke-width="1.7"/>`);
  if (type === "infantry") {
    g.push(`<line x1="${left + 4}" y1="${top + 4}" x2="${left + uw - 4}" y2="${top + uh - 4}" stroke="${color}" stroke-width="1.5"/>`);
    g.push(`<line x1="${left + uw - 4}" y1="${top + 4}" x2="${left + 4}" y2="${top + uh - 4}" stroke="${color}" stroke-width="1.5"/>`);
  } else if (type === "armor" || type === "mech") {
    g.push(`<ellipse cx="${cx.toFixed(1)}" cy="${cy}" rx="19" ry="10" fill="none" stroke="${color}" stroke-width="1.5"/>`);
    if (type === "mech") g.push(`<line x1="${left + 4}" y1="${top + uh - 4}" x2="${left + uw - 4}" y2="${top + 4}" stroke="${color}" stroke-width="1.4"/>`);
  } else if (type === "arty") {
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy}" r="7" fill="${color}"/>`);
  } else if (type === "mg") {
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy}" r="4.5" fill="${color}"/>`);
  } else if (type === "mortar") {
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy + 1}" r="7" fill="none" stroke="${color}" stroke-width="1.6"/>`);
    g.push(`<line x1="${cx.toFixed(1)}" y1="${cy + 5}" x2="${cx.toFixed(1)}" y2="${cy - 9}" stroke="${color}" stroke-width="1.6"/>`);
  } else if (type === "ssm") {
    g.push(`<line x1="${cx.toFixed(1)}" y1="${cy + 10}" x2="${cx.toFixed(1)}" y2="${cy - 7}" stroke="${color}" stroke-width="1.8"/>`);
    g.push(`<polygon points="${(cx - 5).toFixed(1)},${cy - 5} ${(cx + 5).toFixed(1)},${cy - 5} ${cx.toFixed(1)},${cy - 12}" fill="${color}"/>`);
    g.push(`<line x1="${cx - 9}" y1="${cy + 10}" x2="${cx + 9}" y2="${cy + 10}" stroke="${color}" stroke-width="1.8"/>`);
  } else if (type === "at") {
    g.push(`<path d="M ${cx - 13} ${cy + 9} L ${cx.toFixed(1)} ${cy - 9} L ${cx + 13} ${cy + 9}" fill="none" stroke="${color}" stroke-width="1.8"/>`);
  } else if (type === "antiland") {
    g.push(`<path d="M ${cx - 15} ${cy} q 5 -8 10 0 q 5 8 10 0" fill="none" stroke="${color}" stroke-width="1.8"/>`);
  } else if (type === "cp") {
    g.push(`<line x1="${left + 8}" y1="${top + 6}" x2="${left + 8}" y2="${top + uh - 6}" stroke="${color}" stroke-width="1.6"/>`);
    g.push(`<path d="M ${left + 8} ${top + 6} L ${left + 22} ${top + 10} L ${left + 8} ${top + 14} Z" fill="${color}"/>`);
  }
  if (ech) g.push(`<text x="${cx.toFixed(1)}" y="${top - 5}" fill="${color}" font-size="11" letter-spacing="2.5" text-anchor="middle" font-weight="700">${ech}</text>`);
  label.forEach((t, i) => g.push(`<text x="${cx.toFixed(1)}" y="${top + uh + 16 + i * 14}" fill="${C.sub}" font-size="11" text-anchor="middle">${t}</text>`));
  P(`<g>${g.join("")}</g>`);
}

// ── converging arrows (keep line stroke == arrowhead fill) ────────────
// Attacker thrust (red →) and counterstrike (blue ←) converging in the middle:
for (const [y0, y1] of [[360, 420], [440, 450], [520, 470]])
  P(`<line x1="${x(-2).toFixed(1)}" y1="${y0}" x2="${x(4.3).toFixed(1)}" y2="${y1}" stroke="${C.red}" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.75" marker-end="url(#atk)"/>`);
for (const [y0, y1] of [[330, 430], [365, 450], [400, 468]])
  P(`<line x1="${x(11).toFixed(1)}" y1="${y0}" x2="${x(5).toFixed(1)}" y2="${y1}" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="6 5" opacity="0.8" marker-end="url(#ctr)"/>`);

// ── units (example placement) ─────────────────────────────────────────
unit({ km: -1, cy: 360, type: "infantry", ech: "II", label: ["Forward", "screen"], color: C.slate });
unit({ km: 3, cy: 360, type: "infantry", ech: "XX", label: ["Holding", "force"], color: C.cyan });
unit({ km: 5, cy: 545, type: "arty", ech: "III", label: ["Artillery"], color: C.orange });
unit({ km: 11, cy: 380, type: "infantry", ech: "XX", label: ["Reserve"], color: C.purple });
unit({ km: 18, cy: 555, type: "cp", ech: "XXXX", label: ["Staff", "HQ"], color: C.green, uw: 66, uh: 40 });

// ── depth ruler with alternating scale bar ────────────────────────────
const RY = 1110, STEP = 2;
P(`<line x1="${x(AXIS_MIN).toFixed(1)}" y1="${RY}" x2="${x(AXIS_MAX).toFixed(1)}" y2="${RY}" stroke="${C.sub}" stroke-width="1.4"/>`);
for (let v = AXIS_MIN; v <= AXIS_MAX; v += STEP) {
  const xx = x(v);
  P(`<line x1="${xx.toFixed(1)}" y1="${RY}" x2="${xx.toFixed(1)}" y2="${RY + 8}" stroke="${C.sub}" stroke-width="1.4"/>`);
  P(`<text x="${xx.toFixed(1)}" y="${RY + 26}" fill="${C.sub}" font-size="12" text-anchor="middle">${Math.abs(v)}</text>`);
  if (v < AXIS_MAX) {
    const seg = v >= 0 && (v / STEP) % 2 === 0;
    P(`<rect x="${xx.toFixed(1)}" y="${RY - 5}" width="${(x(v + STEP) - xx).toFixed(1)}" height="5" fill="${seg ? C.ink : "#ffffff"}" stroke="${C.sub}" stroke-width="0.6"/>`);
  }
}
P(`<text x="${(x(AXIS_MAX) + 18).toFixed(1)}" y="${RY + 26}" fill="${C.sub}" font-size="12">km</text>`);

// ── legend (only if >2 arrow/element types) ───────────────────────────
P(`<line x1="${x(7)}" y1="1118" x2="${x(7) + 34}" y2="1118" stroke="${C.red}" stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#atk)"/>`);
P(`<text x="${x(7) + 42}" y="1122" fill="${C.sub}" font-size="11">attacker thrust</text>`);
P(`<line x1="${x(11.5)}" y1="1118" x2="${x(11.5) + 34}" y2="1118" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#ctr)"/>`);
P(`<text x="${x(11.5) + 42}" y="1122" fill="${C.sub}" font-size="11">counterstrike</text>`);

// ── footer ────────────────────────────────────────────────────────────
P(`<text x="60" y="${H - 26}" fill="${C.faint}" font-size="12">Source / attribution line.</text>`);
P(`</svg>`);

// ── write + render at 2× ──────────────────────────────────────────────
const svg = out.join("\n");
await writeFile(path.join(here, `${NAME}.svg`), svg);
await sharp(Buffer.from(svg), { density: 200 })
  .resize({ width: W * 2, height: H * 2, fit: "fill" })
  .png({ compressionLevel: 9 })
  .toFile(path.join(here, `${NAME}.png`));
console.log(`Wrote ${NAME}.svg and ${NAME}.png (${W * 2}x${H * 2})`);
