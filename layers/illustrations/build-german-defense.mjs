// Generate the German WWI elastic-defense layout (Verteidigung in der Tiefe,
// 1916-1918) in the Gen0Sec design system, then render to PNG. Companion to
// operational-defense.svg (the Soviet operational-scale recast); this one is
// tactical-scale and matches the doctrine articles' terminology.
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
const sharp = req("sharp");

const W = 1600;
const H = 1240;

const C = {
  ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", line: "#d5d9e0", grid: "#e8eaef",
  blue: "#006fff", cyan: "#0891b2", green: "#16a34a", purple: "#9333ea", orange: "#d97706", red: "#dc2626", slate: "#8b92a5",
};

// depth scale: km -2 (outpost, forward of the line) … 20 km (rear)
const MX = 150, PXKM = 63.2;
const x = (km) => MX + (km + 2) * PXKM;

const MAP_TOP = 232, MAP_BOT = 1058;
const Y_TOPB = 255, Y_MIDB = 650, Y_BOTB = 1045;

const out = [];
const P = (s) => out.push(s);

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
P(`<text x="60" y="92" fill="${C.ink}" font-size="30" font-weight="700">Elastic defense — the German layout (1917)</text>`);
P(`<text x="60" y="120" fill="${C.sub}" font-size="14"><tspan font-style="italic">Verteidigung in der Tiefe</tspan>: how a defending corps echeloned its zones, positions, and counterattack divisions in depth.</text>`);

function band(km0, km1, fill) {
  P(`<rect x="${x(km0).toFixed(1)}" y="${MAP_TOP}" width="${(x(km1) - x(km0)).toFixed(1)}" height="${MAP_BOT - MAP_TOP}" fill="${fill}"/>`);
}
band(-2, 0, "rgba(139,146,165,0.06)");   // Vorpostenzone
band(0, 1.5, "rgba(0,111,255,0.05)");    // Vorfeldzone
band(1.5, 6.5, "rgba(8,145,178,0.05)");  // Hauptkampffeld
band(6.5, 15.5, "rgba(147,51,234,0.045)"); // Eingreifzone
band(15.5, 20, "rgba(22,163,74,0.05)");  // Generalstab

function wavyV(cx, y0, y1, amp, step = 26) {
  let d = `M ${cx.toFixed(1)} ${y0}`; let dir = 1;
  for (let y = y0; y < y1; y += step) {
    const ny = Math.min(y + step, y1), cxp = cx + dir * amp;
    d += ` Q ${cxp.toFixed(1)} ${((y + ny) / 2).toFixed(1)} ${cx.toFixed(1)} ${ny}`; dir *= -1;
  }
  return d;
}
function defLine(km, { color = C.blue, w = 1.4, op = 0.5, amp = 7 } = {}) {
  P(`<path d="${wavyV(x(km), MAP_TOP + 6, MAP_BOT - 6, amp)}" fill="none" stroke="${color}" stroke-width="${w}" opacity="${op}"/>`);
}
defLine(-1, { color: C.slate, op: 0.45 });
defLine(0, { color: C.red, w: 2.4, op: 0.85, amp: 9 });   // vordere Linie / FEBA
defLine(0.7, { color: C.blue, op: 0.4 });
defLine(1.5, { color: C.cyan, op: 0.55 });                // I. Stellung
defLine(3, { color: C.cyan, op: 0.5 });                   // II. Stellung
defLine(5, { color: C.cyan, op: 0.45 });                  // III. Stellung
defLine(7, { color: C.orange, op: 0.4 });                 // Artillerie-Schutzstellung
defLine(16, { color: C.green, op: 0.35 });

function namedLine(km, lines) {
  const xx = x(km);
  P(`<line x1="${xx.toFixed(1)}" y1="${MAP_TOP}" x2="${xx.toFixed(1)}" y2="${MAP_BOT}" stroke="${C.line}" stroke-width="1" stroke-dasharray="2 5"/>`);
  lines.forEach((t, i) => P(`<text x="${xx.toFixed(1)}" y="${MAP_BOT + 22 + i * 15}" fill="${C.sub}" font-size="11.5" text-anchor="middle">${t}</text>`));
}
namedLine(0, ["Vordere", "Linie"]);
namedLine(1.5, ["I.", "Stellung"]);
namedLine(3, ["II.", "Stellung"]);
namedLine(5, ["III.", "Stellung"]);
namedLine(7, ["Artillerie-", "Schutzstellung"]);

function boundary(y, ech) {
  P(`<line x1="${x(-1.8).toFixed(1)}" y1="${y}" x2="${x(19.5).toFixed(1)}" y2="${y}" stroke="${C.faint}" stroke-width="1.2" stroke-dasharray="7 5"/>`);
  for (const km of [-1, 4, 11, 18]) {
    const xx = x(km);
    P(`<rect x="${(xx - 24).toFixed(1)}" y="${y - 9}" width="48" height="18" fill="#ffffff"/>`);
    P(`<text x="${xx.toFixed(1)}" y="${y + 4}" fill="${C.faint}" font-size="12" letter-spacing="3" text-anchor="middle" font-weight="600">${ech}</text>`);
  }
}
boundary(Y_TOPB, "XXX");  // corps boundary
boundary(Y_MIDB, "XX");   // division boundary
boundary(Y_BOTB, "XXX");

function colHead(km, term, gloss, color) {
  P(`<text x="${x(km).toFixed(1)}" y="168" fill="${color}" font-size="12.5" font-weight="700" text-anchor="middle" letter-spacing="0.5">${term}</text>`);
  P(`<text x="${x(km).toFixed(1)}" y="186" fill="${C.faint}" font-size="10.5" text-anchor="middle">${gloss}</text>`);
}
colHead(-1, "VORPOSTENZONE", "outpost screen", C.slate);
colHead(0.75, "VORFELDZONE", "forward belt", C.blue);
colHead(4, "HAUPTKAMPFFELD", "main battle zone", C.cyan);
colHead(11, "EINGREIFZONE", "counterattack reserves", C.purple);
colHead(17.75, "GENERALSTAB", "operational staff", C.green);

function bracket(km0, km1, label, color) {
  const x0 = x(km0), x1 = x(km1), y = 210;
  P(`<path d="M ${x0.toFixed(1)} ${y - 8} L ${x0.toFixed(1)} ${y} L ${x1.toFixed(1)} ${y} L ${x1.toFixed(1)} ${y - 8}" fill="none" stroke="${color}" stroke-width="1.4"/>`);
  P(`<rect x="${((x0 + x1) / 2 - 140).toFixed(1)}" y="${y - 9}" width="280" height="18" fill="#ffffff"/>`);
  P(`<text x="${((x0 + x1) / 2).toFixed(1)}" y="${y + 4}" fill="${color}" font-size="13" font-weight="700" letter-spacing="2" text-anchor="middle">${label}</text>`);
}
bracket(-2, 6.5, "KAMPFZONE  ·  BATTLE ZONE", C.blue);
bracket(6.5, 20, "RÜCKWÄRTIGE TIEFE  ·  REAR DEPTH", C.cyan);

function unit({ km, cy, type, ech = "", label = [], color, uw = 50, uh = 32 }) {
  const cx = x(km), left = cx - uw / 2, top = cy - uh / 2, g = [];
  g.push(`<rect x="${left.toFixed(1)}" y="${top.toFixed(1)}" width="${uw}" height="${uh}" rx="3" fill="#ffffff" stroke="${color}" stroke-width="1.7"/>`);
  if (type === "infantry") {
    g.push(`<line x1="${left + 4}" y1="${top + 4}" x2="${left + uw - 4}" y2="${top + uh - 4}" stroke="${color}" stroke-width="1.5"/>`);
    g.push(`<line x1="${left + uw - 4}" y1="${top + 4}" x2="${left + 4}" y2="${top + uh - 4}" stroke="${color}" stroke-width="1.5"/>`);
  } else if (type === "arty") {
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy}" r="7" fill="${color}"/>`);
  } else if (type === "mg") {
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy}" r="4.5" fill="${color}"/>`);
  } else if (type === "mortar") {
    g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy + 1}" r="7" fill="none" stroke="${color}" stroke-width="1.6"/>`);
    g.push(`<line x1="${cx.toFixed(1)}" y1="${cy + 5}" x2="${cx.toFixed(1)}" y2="${cy - 9}" stroke="${color}" stroke-width="1.6"/>`);
  } else if (type === "cp") {
    g.push(`<line x1="${left + 8}" y1="${top + 6}" x2="${left + 8}" y2="${top + uh - 6}" stroke="${color}" stroke-width="1.6"/>`);
    g.push(`<path d="M ${left + 8} ${top + 6} L ${left + 22} ${top + 10} L ${left + 8} ${top + 14} Z" fill="${color}"/>`);
  }
  if (ech) g.push(`<text x="${cx.toFixed(1)}" y="${top - 5}" fill="${color}" font-size="11" letter-spacing="2.5" text-anchor="middle" font-weight="700">${ech}</text>`);
  label.forEach((t, i) => g.push(`<text x="${cx.toFixed(1)}" y="${top + uh + 16 + i * 14}" fill="${C.sub}" font-size="11" text-anchor="middle">${t}</text>`));
  P(`<g>${g.join("")}</g>`);
}

// ── attacker thrust (red →) absorbed in the Hauptkampffeld, upper sector ──
for (const [y0, y1] of [[360, 420], [440, 450], [520, 470]]) {
  P(`<line x1="${x(-2).toFixed(1)}" y1="${y0}" x2="${x(4.3).toFixed(1)}" y2="${y1}" stroke="${C.red}" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.75" marker-end="url(#atk)"/>`);
}
// ── Eingreif counterstrike (blue ←) into the overextended penetration ──
for (const [y0, y1] of [[330, 430], [365, 450], [400, 468]]) {
  P(`<line x1="${x(11).toFixed(1)}" y1="${y0}" x2="${x(5).toFixed(1)}" y2="${y1}" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="6 5" opacity="0.8" marker-end="url(#ctr)"/>`);
}

// ── units: upper sector ──
unit({ km: -1, cy: 360, type: "infantry", ech: "II", label: ["Vorposten", "outpost bn"], color: C.slate });
unit({ km: 0.75, cy: 320, type: "mg", label: ["MG-Nest"], color: C.blue });
unit({ km: 1.1, cy: 480, type: "mortar", label: ["Minenwerfer", "trench mortar"], color: C.orange });
unit({ km: 3, cy: 360, type: "infantry", ech: "XX", label: ["Stellungs-", "division (holding)"], color: C.cyan });
unit({ km: 5, cy: 480, type: "arty", ech: "III", label: ["Feldartillerie"], color: C.orange });
unit({ km: 9, cy: 300, type: "infantry", ech: "II", label: ["Sturm-", "bataillon"], color: C.red });
unit({ km: 11, cy: 380, type: "infantry", ech: "XX", label: ["Eingreif-", "division"], color: C.purple });
unit({ km: 13.5, cy: 490, type: "infantry", ech: "XX", label: ["Korps-", "Reserve"], color: C.green });

// ── units: lower sector ──
unit({ km: -1, cy: 905, type: "infantry", ech: "II", label: ["Vorposten", "outpost bn"], color: C.slate });
unit({ km: 3, cy: 905, type: "infantry", ech: "XX", label: ["Stellungs-", "division (holding)"], color: C.cyan });
unit({ km: 5, cy: 795, type: "arty", ech: "III", label: ["Feldartillerie"], color: C.orange });
unit({ km: 9, cy: 950, type: "infantry", ech: "II", label: ["Sturm-", "bataillon"], color: C.red });
unit({ km: 11, cy: 880, type: "infantry", ech: "XX", label: ["Eingreif-", "division"], color: C.purple });

// ── the operational brain ──
unit({ km: 18, cy: 620, type: "cp", ech: "XXXX", label: ["Generalstab", "Armee-Oberkommando (AOK)"], color: C.green, uw: 66, uh: 40 });

// ── depth ruler ──
const RY = 1110;
P(`<line x1="${x(-2).toFixed(1)}" y1="${RY}" x2="${x(20).toFixed(1)}" y2="${RY}" stroke="${C.sub}" stroke-width="1.4"/>`);
for (let km = -2; km <= 20; km += 2) {
  const xx = x(km);
  P(`<line x1="${xx.toFixed(1)}" y1="${RY}" x2="${xx.toFixed(1)}" y2="${RY + 8}" stroke="${C.sub}" stroke-width="1.4"/>`);
  P(`<text x="${xx.toFixed(1)}" y="${RY + 26}" fill="${C.sub}" font-size="12" text-anchor="middle">${Math.abs(km)}</text>`);
  if (km < 20) {
    const seg = km >= 0 && (km / 2) % 2 === 0;
    P(`<rect x="${xx.toFixed(1)}" y="${RY - 5}" width="${(x(km + 2) - xx).toFixed(1)}" height="5" fill="${seg ? C.ink : "#ffffff"}" stroke="${C.sub}" stroke-width="0.6"/>`);
  }
}
P(`<text x="${(x(20) + 18).toFixed(1)}" y="${RY + 26}" fill="${C.sub}" font-size="12">km</text>`);

// ── legend for the two arrow types ──
P(`<line x1="${x(7)}" y1="${1118}" x2="${x(7) + 34}" y2="${1118}" stroke="${C.red}" stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#atk)"/>`);
P(`<text x="${x(7) + 42}" y="${1122}" fill="${C.sub}" font-size="11">attacker thrust</text>`);
P(`<line x1="${x(11.5)}" y1="${1118}" x2="${x(11.5) + 34}" y2="${1118}" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#ctr)"/>`);
P(`<text x="${x(11.5) + 42}" y="${1122}" fill="${C.sub}" font-size="11">Eingreif counterstrike</text>`);

P(`<text x="60" y="${H - 26}" fill="${C.faint}" font-size="12">After German elastic-defense doctrine — <tspan font-style="italic">Verteidigung in der Tiefe</tspan>, 1916–1918. Gen0Sec elastic-defense series.</text>`);

P(`</svg>`);

const svg = out.join("\n");
const svgPath = path.join(here, "german-defense.svg");
await writeFile(svgPath, svg);
const png = path.join(here, "german-defense.png");
await sharp(Buffer.from(svg), { density: 200 })
  .resize({ width: W * 2, height: H * 2, fit: "fill" })
  .png({ compressionLevel: 9 })
  .toFile(png);
console.log(`Wrote ${svgPath}`);
console.log(`Wrote ${png}  ${W * 2}x${H * 2}`);
