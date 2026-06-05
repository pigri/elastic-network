// Generate the "operational zone of defense" layout in the Gen0Sec design
// system, then render it to PNG. Faithful recast of the classic Soviet
// defense-in-depth diagram for the elastic-defense doctrine series.
import { writeFile, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
const sharp = req("sharp");

const W = 1600;
const H = 1240;

// ── palette ──────────────────────────────────────────────────────────
const C = {
  ink: "#1a1d23",
  sub: "#5a6178",
  faint: "#8b92a5",
  line: "#d5d9e0",
  grid: "#e8eaef",
  blue: "#006fff",
  cyan: "#0891b2",
  green: "#16a34a",
  purple: "#9333ea",
  orange: "#d97706",
  red: "#dc2626",
  slate: "#8b92a5",
};

// ── depth scale: km → x ──────────────────────────────────────────────
const MX = 150; // x at km -50
const PXKM = 3.97; // px per km
const x = (km) => MX + (km + 50) * PXKM;

// map vertical extent
const MAP_TOP = 232;
const MAP_BOT = 1058;
const Y_TOPB = 255; // top army-group boundary
const Y_MIDB = 650; // army boundary
const Y_BOTB = 1045; // bottom army-group boundary

const out = [];
const P = (s) => out.push(s);

// ── header / frame ───────────────────────────────────────────────────
P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
P(`  <marker id="atk" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${C.red}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// eyebrow + title
P(`<text x="60" y="52" fill="${C.faint}" font-size="15" letter-spacing="6" font-weight="600">GEN0SEC · DOCTRINE</text>`);
P(`<text x="60" y="92" fill="${C.ink}" font-size="30" font-weight="700">Defense in depth — the operational layout</text>`);
P(`<text x="60" y="120" fill="${C.sub}" font-size="14">How an army group layers its defensive zones, reserves, and counterstrike echelons across 300 km.</text>`);

// ── zone background bands ────────────────────────────────────────────
function band(km0, km1, fill) {
  P(`<rect x="${x(km0).toFixed(1)}" y="${MAP_TOP}" width="${(x(km1) - x(km0)).toFixed(1)}" height="${MAP_BOT - MAP_TOP}" fill="${fill}"/>`);
}
band(-50, 0, "rgba(139,146,165,0.06)"); // security zone
band(0, 100, "rgba(0,111,255,0.05)"); // tactical
band(100, 200, "rgba(8,145,178,0.045)"); // operational 1st
band(200, 300, "rgba(22,163,74,0.045)"); // operational 2nd

// ── wavy defensive "position" lines ──────────────────────────────────
function wavyV(cx, y0, y1, amp, step = 26) {
  let d = `M ${cx.toFixed(1)} ${y0}`;
  let dir = 1;
  for (let y = y0; y < y1; y += step) {
    const ny = Math.min(y + step, y1);
    const cxp = cx + dir * amp;
    d += ` Q ${cxp.toFixed(1)} ${((y + ny) / 2).toFixed(1)} ${cx.toFixed(1)} ${ny}`;
    dir *= -1;
  }
  return d;
}
function defLine(km, { color = C.blue, w = 1.4, op = 0.5, amp = 7 } = {}) {
  P(`<path d="${wavyV(x(km), MAP_TOP + 6, MAP_BOT - 6, amp)}" fill="none" stroke="${color}" stroke-width="${w}" opacity="${op}"/>`);
}
defLine(-40, { color: C.slate, op: 0.45 });
defLine(0, { color: C.red, w: 2.4, op: 0.85, amp: 9 }); // forward edge / FEBA
defLine(30, { color: C.blue, op: 0.4 });
defLine(50, { color: C.blue, op: 0.55 });
defLine(150, { color: C.cyan, op: 0.55 });
defLine(250, { color: C.green, op: 0.55 });
defLine(290, { color: C.slate, op: 0.35 });

// ── vertical guides + bottom labels for named defensive lines ────────
function namedLine(km, lines) {
  const xx = x(km);
  P(`<line x1="${xx.toFixed(1)}" y1="${MAP_TOP}" x2="${xx.toFixed(1)}" y2="${MAP_BOT}" stroke="${C.line}" stroke-width="1" stroke-dasharray="2 5"/>`);
  lines.forEach((t, i) =>
    P(`<text x="${xx.toFixed(1)}" y="${MAP_BOT + 22 + i * 15}" fill="${C.sub}" font-size="11.5" text-anchor="middle">${t}</text>`),
  );
}
namedLine(0, ["Forward", "Edge"]);
namedLine(50, ["Army Third", "Defensive Line"]);
namedLine(150, ["Army Group First", "Defensive Line"]);
namedLine(250, ["Army Group Second", "Defensive Line"]);

// ── lateral unit boundaries (horizontal, echelon X marks) ────────────
function boundary(y, ech) {
  P(`<line x1="${x(-48).toFixed(1)}" y1="${y}" x2="${x(298).toFixed(1)}" y2="${y}" stroke="${C.faint}" stroke-width="1.2" stroke-dasharray="7 5"/>`);
  for (const km of [-25, 70, 175, 275]) {
    const xx = x(km);
    P(`<rect x="${(xx - 26).toFixed(1)}" y="${y - 9}" width="52" height="18" fill="#ffffff"/>`);
    P(`<text x="${xx.toFixed(1)}" y="${y + 4}" fill="${C.faint}" font-size="12" letter-spacing="3" text-anchor="middle" font-weight="600">${ech}</text>`);
  }
}
boundary(Y_TOPB, "XXXXX");
boundary(Y_MIDB, "XXXX");
boundary(Y_BOTB, "XXXXX");

// ── column headers ───────────────────────────────────────────────────
function colHead(km, lines, color) {
  lines.forEach((t, i) =>
    P(`<text x="${x(km).toFixed(1)}" y="${168 + i * 17}" fill="${color}" font-size="12.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">${t}</text>`),
  );
}
colHead(-25, ["SECURITY", "ZONE"], C.slate);
colHead(25, ["ARMY FIRST &amp; SECOND", "DEFENSIVE ZONES"], C.blue);
colHead(75, ["ARMY THIRD", "DEFENSIVE ZONE"], C.blue);
colHead(175, ["ARMY GROUP FIRST", "DEFENSIVE ZONE"], C.cyan);
colHead(275, ["ARMY GROUP SECOND", "DEFENSIVE ZONE"], C.green);

// ── top brackets: tactical vs operational zone ───────────────────────
function bracket(km0, km1, label, color) {
  const x0 = x(km0), x1 = x(km1), y = 210;
  P(`<path d="M ${x0.toFixed(1)} ${y - 8} L ${x0.toFixed(1)} ${y} L ${x1.toFixed(1)} ${y} L ${x1.toFixed(1)} ${y - 8}" fill="none" stroke="${color}" stroke-width="1.4"/>`);
  P(`<rect x="${((x0 + x1) / 2 - 150).toFixed(1)}" y="${y - 9}" width="300" height="18" fill="#ffffff"/>`);
  P(`<text x="${((x0 + x1) / 2).toFixed(1)}" y="${y + 4}" fill="${color}" font-size="13" font-weight="700" letter-spacing="2" text-anchor="middle">${label}</text>`);
}
bracket(0, 100, "TACTICAL ZONE OF DEFENSE", C.blue);
bracket(100, 300, "OPERATIONAL ZONE OF DEFENSE", C.cyan);

// ── unit symbols ─────────────────────────────────────────────────────
const UW = 50, UH = 32;
function unit({ km, cy, type, ech = "", label = [], color }) {
  const cx = x(km);
  const left = cx - UW / 2, top = cy - UH / 2;
  const g = [];
  g.push(`<rect x="${left.toFixed(1)}" y="${top.toFixed(1)}" width="${UW}" height="${UH}" rx="3" fill="#ffffff" stroke="${color}" stroke-width="1.7"/>`);
  if (type === "armor" || type === "mech") {
    g.push(`<ellipse cx="${cx.toFixed(1)}" cy="${cy}" rx="19" ry="10" fill="none" stroke="${color}" stroke-width="1.5"/>`);
    if (type === "mech") g.push(`<line x1="${left + 4}" y1="${top + UH - 4}" x2="${left + UW - 4}" y2="${top + 4}" stroke="${color}" stroke-width="1.4"/>`);
  } else if (type === "infantry") {
    g.push(`<line x1="${left + 4}" y1="${top + 4}" x2="${left + UW - 4}" y2="${top + UH - 4}" stroke="${color}" stroke-width="1.5"/>`);
    g.push(`<line x1="${left + UW - 4}" y1="${top + 4}" x2="${left + 4}" y2="${top + UH - 4}" stroke="${color}" stroke-width="1.5"/>`);
  } else if (type === "ssm") {
    g.push(`<line x1="${cx.toFixed(1)}" y1="${cy + 10}" x2="${cx.toFixed(1)}" y2="${cy - 7}" stroke="${color}" stroke-width="1.8"/>`);
    g.push(`<polygon points="${(cx - 5).toFixed(1)},${cy - 5} ${(cx + 5).toFixed(1)},${cy - 5} ${cx.toFixed(1)},${cy - 12}" fill="${color}"/>`);
    g.push(`<line x1="${cx - 9}" y1="${cy + 10}" x2="${cx + 9}" y2="${cy + 10}" stroke="${color}" stroke-width="1.8"/>`);
  } else if (type === "at") {
    g.push(`<path d="M ${cx - 13} ${cy + 9} L ${cx.toFixed(1)} ${cy - 9} L ${cx + 13} ${cy + 9}" fill="none" stroke="${color}" stroke-width="1.8"/>`);
  } else if (type === "antiland") {
    g.push(`<path d="M ${cx - 15} ${cy} q 5 -8 10 0 q 5 8 10 0" fill="none" stroke="${color}" stroke-width="1.8"/>`);
  } else if (type === "cp") {
    g.push(`<line x1="${left + 8}" y1="${top + 6}" x2="${left + 8}" y2="${top + UH - 6}" stroke="${color}" stroke-width="1.6"/>`);
    g.push(`<path d="M ${left + 8} ${top + 6} L ${left + 20} ${top + 9} L ${left + 8} ${top + 12} Z" fill="${color}"/>`);
  }
  if (ech) g.push(`<text x="${cx.toFixed(1)}" y="${top - 5}" fill="${color}" font-size="11" letter-spacing="2.5" text-anchor="middle" font-weight="700">${ech}</text>`);
  label.forEach((t, i) =>
    g.push(`<text x="${cx.toFixed(1)}" y="${top + UH + 16 + i * 14}" fill="${C.sub}" font-size="11" text-anchor="middle">${t}</text>`),
  );
  P(`<g>${g.join("")}</g>`);
}

// ── converging counterstrike / SSM strike fans (dashed, toward FEBA) ──
function fan(originKm, originY, color = C.red) {
  const ox = x(originKm);
  for (const [dkm, dy] of [[-55, -50], [-60, -16], [-62, 18], [-58, 52]]) {
    const tx = x(originKm + dkm), ty = originY + dy;
    P(`<line x1="${ox.toFixed(1)}" y1="${originY}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="${color}" stroke-width="1.4" stroke-dasharray="6 5" opacity="0.7" marker-end="url(#atk)"/>`);
  }
}
fan(108, 372);
fan(108, 905);

// ── units (upper army sector) ────────────────────────────────────────
unit({ km: 8, cy: 360, type: "armor", ech: "X", color: C.blue });
unit({ km: 32, cy: 360, type: "mech", ech: "X", color: C.blue });
unit({ km: 45, cy: 470, type: "cp", ech: "XXXXX", label: ["Forward"], color: C.slate });
unit({ km: 92, cy: 330, type: "ssm", label: ["Army Group", "SSM Brigade"], color: C.orange });
unit({ km: 112, cy: 300, type: "at", ech: "X", label: ["Army Group AT", "Reserve + MOD"], color: C.red });
unit({ km: 150, cy: 360, type: "armor", ech: "XX", label: ["Army Group", "Reserve"], color: C.purple });
unit({ km: 150, cy: 480, type: "cp", label: ["Main"], color: C.blue });
unit({ km: 190, cy: 520, type: "antiland", label: ["Army Group", "Antilanding Reserve"], color: C.cyan });
unit({ km: 270, cy: 360, type: "infantry", ech: "XXXX", label: ["Army Group", "second echelon"], color: C.green });

// ── units (lower army sector) ────────────────────────────────────────
unit({ km: 8, cy: 905, type: "armor", ech: "X", color: C.blue });
unit({ km: 32, cy: 905, type: "mech", ech: "X", color: C.blue });
unit({ km: 92, cy: 880, type: "ssm", label: ["Army Group", "SSM Brigade"], color: C.orange });
unit({ km: 112, cy: 950, type: "at", ech: "X", label: ["Army Group AT", "Reserve + MOD"], color: C.red });
unit({ km: 150, cy: 840, type: "armor", ech: "XX", label: ["Army Group", "Reserve"], color: C.purple });
unit({ km: 255, cy: 840, type: "infantry", ech: "XXXX", label: ["Army Group", "second echelon"], color: C.green });
unit({ km: 272, cy: 960, type: "cp", ech: "XXXXX", label: ["Rear"], color: C.slate });

// ── depth ruler ──────────────────────────────────────────────────────
const RY = 1110;
P(`<line x1="${x(-50).toFixed(1)}" y1="${RY}" x2="${x(300).toFixed(1)}" y2="${RY}" stroke="${C.sub}" stroke-width="1.4"/>`);
for (let km = -50; km <= 300; km += 50) {
  const xx = x(km);
  P(`<line x1="${xx.toFixed(1)}" y1="${RY}" x2="${xx.toFixed(1)}" y2="${RY + 8}" stroke="${C.sub}" stroke-width="1.4"/>`);
  P(`<text x="${xx.toFixed(1)}" y="${RY + 26}" fill="${C.sub}" font-size="12" text-anchor="middle">${Math.abs(km)}</text>`);
  // alternating scale-bar segment
  if (km < 300) {
    const seg = km >= 0 && (km / 50) % 2 === 0;
    P(`<rect x="${xx.toFixed(1)}" y="${RY - 5}" width="${(x(km + 50) - xx).toFixed(1)}" height="5" fill="${seg ? C.ink : "#ffffff"}" stroke="${C.sub}" stroke-width="0.6"/>`);
  }
}
P(`<text x="${(x(300) + 18).toFixed(1)}" y="${RY + 26}" fill="${C.sub}" font-size="12">km</text>`);

// ── footer ───────────────────────────────────────────────────────────
P(`<text x="60" y="${H - 26}" fill="${C.faint}" font-size="12">After Soviet operational defense doctrine — recast for the Gen0Sec elastic-defense series.</text>`);

P(`</svg>`);

// ── write + render ───────────────────────────────────────────────────
const svg = out.join("\n");
const svgPath = path.join(here, "operational-defense.svg");
await writeFile(svgPath, svg);
const png = path.join(here, "operational-defense.png");
await sharp(Buffer.from(svg), { density: 200 })
  .resize({ width: W * 2, height: H * 2, fit: "fill" })
  .png({ compressionLevel: 9 })
  .toFile(png);
console.log(`Wrote ${svgPath}`);
console.log(`Wrote ${png}  ${W * 2}x${H * 2}`);
