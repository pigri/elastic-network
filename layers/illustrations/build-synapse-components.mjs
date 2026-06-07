// Synapse components & layers — one binary, the signal path through a neuron,
// plus the Cortex→Cerebellum CTI loop. Gen0Sec design, SVG→PNG via sharp.
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
const sharp = req("sharp");

const W = 1600, H = 1040;
const C = {
  ink: "#1a1d23", sub: "#5a6178", faint: "#8b92a5", line: "#d5d9e0", grid: "#e8eaef",
  blue: "#006fff", cyan: "#0891b2", green: "#16a34a", purple: "#9333ea", orange: "#d97706", red: "#dc2626", slate: "#8b92a5",
};
const FILL = {
  [C.blue]: "rgba(0,111,255,0.08)", [C.cyan]: "rgba(8,145,178,0.10)", [C.green]: "rgba(22,163,74,0.08)",
  [C.purple]: "rgba(147,51,234,0.08)", [C.orange]: "rgba(217,119,6,0.10)", [C.red]: "rgba(220,38,38,0.07)", [C.slate]: "#eef0f3",
};
const out = [];
const P = (s) => out.push(s);

P(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">`);
P(`<style>text{font-family:'JetBrains Mono',ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace;}</style>`);
P(`<defs>`);
P(`  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.grid}" stroke-width="0.5"/></pattern>`);
for (const [id, col] of [["ah", C.sub], ["ahp", C.purple], ["ahg", C.green], ["aho", C.orange]])
  P(`  <marker id="${id}" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="${col}"/></marker>`);
P(`</defs>`);
P(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
P(`<rect width="${W}" height="${H}" fill="url(#grid)"/>`);

// header
P(`<text x="60" y="52" fill="${C.faint}" font-size="15" letter-spacing="6" font-weight="600">GEN0SEC · ARCHITECTURE</text>`);
P(`<text x="60" y="92" fill="${C.ink}" font-size="30" font-weight="700">Synapse — components &amp; layers</text>`);
P(`<text x="60" y="120" fill="${C.sub}" font-size="14">One binary, six capabilities — the signal path through a neuron: capture → enforce → inspect → learn.</text>`);

// Synapse container
const CX = 50, CY = 185, CW = 1500, CH = 600;
P(`<rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="14" fill="none" stroke="${C.blue}" stroke-width="1.6" stroke-dasharray="8 4"/>`);
P(`<text x="${CX + 24}" y="${CY + 32}" fill="${C.blue}" font-size="15" font-weight="700" letter-spacing="2">SYNAPSE · ONE BINARY</text>`);
P(`<text x="${CX + CW - 24}" y="${CY + 32}" fill="${C.faint}" font-size="12" text-anchor="end">deployed at edge · host · proxy — many points, one agent</text>`);

// card helper
function card(x, y, w, h, { name, role, color, desc = [], chip, tags, dashed }) {
  P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#ffffff"/>`);
  P(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${FILL[color]}" stroke="${color}" stroke-width="1.7"${dashed ? ' stroke-dasharray="6 4"' : ""}/>`);
  P(`<text x="${x + 18}" y="${y + 34}" fill="${C.ink}" font-size="18" font-weight="700">${name}</text>`);
  P(`<text x="${x + 18}" y="${y + 55}" fill="${color}" font-size="12.5" font-weight="600">${role}</text>`);
  desc.forEach((t, i) => P(`<text x="${x + 18}" y="${y + 80 + i * 19}" fill="${C.sub}" font-size="12.5">${t}</text>`));
  if (chip) {
    const cw = chip.length * 8.4 + 16;
    P(`<rect x="${x + w - cw - 14}" y="${y + 14}" width="${cw}" height="22" rx="11" fill="${color}"/>`);
    P(`<text x="${x + w - cw / 2 - 14}" y="${y + 29}" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">${chip}</text>`);
  }
  if (tags) P(`<text x="${x + 18}" y="${y + h - 16}" fill="${color}" font-size="11" font-weight="600">${tags}</text>`);
}

// pipeline (signal path)
const py = 255, ph = 170, pw = 300, midY = py + ph / 2; // 340
const xs = [128, 476, 824, 1172];
const cen = xs.map((x) => x + pw / 2); // 278,626,974,1322
card(xs[0], py, pw, ph, { name: "Dendrite", role: "capture", color: C.blue, desc: ["Sees every flow.", "JA4+ fingerprints,", "telemetry."], chip: "L01", tags: "capture · JA4+" });
card(xs[1], py, pw, ph, { name: "Hillock", role: "enforcing firewall", color: C.blue, desc: ["Stateless L3/L4 rules", "in XDP / eBPF.", "Wire speed."], chip: "L02·L03", tags: "XDP · eBPF" });
card(xs[2], py, pw, ph, { name: "Amygdala", role: "smart firewall", color: C.red, desc: ["Blocks on JA4+", "fingerprints &amp;", "Cerebellum CTI."], chip: "L02·L03", tags: "JA4+ · CTI" });
card(xs[3], py, pw, ph, { name: "Thalamus", role: "IDS / NDR", color: C.cyan, desc: ["Suricata-grade rules,", "app-layer parsers,", "east-west microseg."], chip: "L03", tags: "IDS · microseg" });

// forwarding-path arrows
P(`<text x="60" y="${midY - 12}" fill="${C.faint}" font-size="12">traffic</text>`);
P(`<line x1="62" y1="${midY}" x2="${xs[0] - 4}" y2="${midY}" stroke="${C.sub}" stroke-width="1.8" marker-end="url(#ah)"/>`);
for (let i = 0; i < 3; i++)
  P(`<line x1="${xs[i] + pw + 4}" y1="${midY}" x2="${xs[i + 1] - 4}" y2="${midY}" stroke="${C.sub}" stroke-width="1.8" marker-end="url(#ah)"/>`);

// verdict pill (below Thalamus)
const vpx = 1172, vpy = 470, vpw = 300, vph = 46;
P(`<line x1="${cen[3]}" y1="${py + ph}" x2="${cen[3]}" y2="${vpy - 4}" stroke="${C.sub}" stroke-width="1.8" marker-end="url(#ah)"/>`);
P(`<rect x="${vpx}" y="${vpy}" width="${vpw}" height="${vph}" rx="23" fill="#ffffff" stroke="${C.sub}" stroke-width="1.5"/>`);
P(`<text x="${vpx + vpw / 2}" y="${vpy + 29}" fill="${C.ink}" font-size="13" font-weight="700" text-anchor="middle">verdict: drop · pass · tag</text>`);

// WAF (proxy-mode capability, hangs off enforcement)
const wx = 824, wy = 470, ww = 300, wh = 110;
P(`<line x1="${cen[2]}" y1="${py + ph}" x2="${cen[2]}" y2="${wy - 4}" stroke="${C.orange}" stroke-width="1.6" stroke-dasharray="6 4" marker-end="url(#aho)"/>`);
P(`<text x="${cen[2] + 10}" y="${wy - 10}" fill="${C.orange}" font-size="11" font-weight="600">proxy mode</text>`);
card(wx, wy, ww, wh, { name: "WAF", role: "web app firewall", color: C.orange, desc: ["L7 HTTP filtering. CTI-driven."], chip: "L02", tags: "PROXY MODE ONLY", dashed: true });

// telemetry rail → Cortex
const railY = 446;
P(`<path d="M 200 ${railY} H 1400" fill="none" stroke="${C.purple}" stroke-width="1.4" stroke-dasharray="3 5" opacity="0.8"/>`);
for (const cx of cen) P(`<line x1="${cx}" y1="${py + ph}" x2="${cx}" y2="${railY}" stroke="${C.purple}" stroke-width="1.2" stroke-dasharray="3 4" opacity="0.7"/>`);
P(`<text x="1410" y="${railY + 4}" fill="${C.purple}" font-size="11" font-weight="600">telemetry</text>`);

// Cortex (wide learning strip)
const coY = 605, coH = 130, coX = 110, coW = 1100;
P(`<line x1="206" y1="${railY}" x2="206" y2="${coY - 4}" stroke="${C.purple}" stroke-width="1.4" stroke-dasharray="3 5" marker-end="url(#ahp)"/>`);
card(coX, coY, coW, coH, { name: "Cortex", role: "per-sensor ML engine", color: C.purple, desc: ["Runs on every Synapse — learns locally from the whole path.", "Ships findings up to Cerebellum. Does not produce CTI itself."], chip: "→ L05", tags: "ML · anomaly · clustering" });

// Cerebellum (backend — outside the binary)
const ceX = 350, ceY = 850, ceW = 900, ceH = 130;
P(`<rect x="${ceX}" y="${ceY}" width="${ceW}" height="${ceH}" rx="10" fill="#ffffff"/>`);
P(`<rect x="${ceX}" y="${ceY}" width="${ceW}" height="${ceH}" rx="10" fill="${FILL[C.green]}" stroke="${C.green}" stroke-width="1.8"/>`);
P(`<text x="${ceX + 22}" y="${ceY + 36}" fill="${C.ink}" font-size="19" font-weight="700">Cerebellum</text>`);
P(`<text x="${ceX + 22}" y="${ceY + 58}" fill="${C.green}" font-size="12.5" font-weight="600">backend platform — not part of the Synapse binary</text>`);
P(`<text x="${ceX + 22}" y="${ceY + 84}" fill="${C.sub}" font-size="12.5">CTI engine &amp; fleet brain. Produces CTI verdicts, clusters behaviour,</text>`);
P(`<text x="${ceX + 22}" y="${ceY + 103}" fill="${C.sub}" font-size="12.5">generates Thalamus rules + Hillock policy, pushes them fleet-wide.</text>`);
const cw2 = 30;
P(`<rect x="${ceX + ceW - cw2 - 14}" y="${ceY + 16}" width="${cw2}" height="22" rx="11" fill="${C.green}"/>`);
P(`<text x="${ceX + ceW - cw2 / 2 - 14}" y="${ceY + 31}" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">L05</text>`);

// Cortex → Cerebellum (telemetry up to the fleet brain)
P(`<line x1="660" y1="${coY + coH}" x2="660" y2="${ceY - 4}" stroke="${C.purple}" stroke-width="1.8" marker-end="url(#ahp)"/>`);
P(`<text x="672" y="${(coY + coH + ceY) / 2 + 4}" fill="${C.purple}" font-size="11.5" font-weight="600">findings → fleet brain</text>`);

// Cerebellum → binary (CTI / rules / policy pushed back into the path)
P(`<path d="M ${ceX + ceW} ${ceY + 40} H 1500 V ${midY} H ${xs[3] + pw + 4}" fill="none" stroke="${C.green}" stroke-width="1.8" marker-end="url(#ahg)"/>`);
P(`<text x="1496" y="${ceY - 6}" fill="${C.green}" font-size="11.5" font-weight="600" text-anchor="end">CTI · rules · policy → Hillock · Amygdala · Thalamus · WAF</text>`);

// footer
P(`<text x="60" y="${H - 26}" fill="${C.faint}" font-size="12">One Synapse is a neuron; many Synapses wired together are the nervous system. CTI is produced by Cerebellum — Cortex only feeds it.</text>`);
P(`</svg>`);

const svg = out.join("\n");
await writeFile(path.join(here, "synapse-components.svg"), svg);
await sharp(Buffer.from(svg), { density: 200 })
  .resize({ width: W * 2, height: H * 2, fit: "fill" })
  .png({ compressionLevel: 9 })
  .toFile(path.join(here, "synapse-components.png"));
console.log(`Wrote synapse-components.svg and .png (${W * 2}x${H * 2})`);
