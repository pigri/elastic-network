// Generate a syntax-highlighted "raw JSON" card SVG in the Gen0Sec deck style.
import { writeFile } from "node:fs/promises";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);

// The verdict, formatted with short arrays inline to keep the card compact.
const JSON_TEXT = `{
  "schema_version": "1.0",
  "tenant_id": "684498c1-6a6b-4241-ab0c-793a4dab13ca",
  "ip": "176.65.139.130",
  "intel": {
    "score": 94,
    "confidence": 0.94,
    "score_version": "2025-09-01",
    "categories": ["botnet", "brute_force", "c2", "default", "malware", "scanner"],
    "tags": ["default"],
    "first_seen": "2026-05-25T11:20:46Z",
    "last_seen": "2026-06-05T18:14:26Z",
    "source_count": 14,
    "reason_code": "MULTI_RECENT_SIGNALS",
    "reason_summary": "Block IPs from threat intelligence feeds",
    "rule_id": "fdf885f0-ff3c-48d7-98af-d0ca4389625b"
  },
  "context": {
    "asn": 214472,
    "org": "Offshore LC",
    "ip_version": 4,
    "geo": {"country": "The Netherlands", "iso_code": "NL", "asniso_code": "NL"}
  },
  "advice": "block",
  "ttl_s": 43200,
  "generated_at": "2026-06-05T18:21:57Z"
}`;

// Colours tuned for the dark code panel (#0f172a).
const C = {
  key: "#7dd3fc",     // keys
  string: "#86efac",  // string values
  number: "#fcd34d",  // numbers
  bool: "#d8b4fe",    // booleans / null
  punct: "#64748b",   // braces, brackets, colons, commas
  plain: "#a5b0c7",   // fallback
};

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Tokenise one line of JSON into {text, color} spans. */
function tokenise(line) {
  const tokens = [];
  let rest = line;

  const ws = rest.match(/^\s*/)[0];
  if (ws) tokens.push({ text: ws, color: null });
  rest = rest.slice(ws.length);

  // key: "..." followed by colon
  const keyMatch = rest.match(/^("(?:[^"\\]|\\.)*")(\s*:)/);
  if (keyMatch) {
    tokens.push({ text: keyMatch[1], color: C.key });
    tokens.push({ text: keyMatch[2], color: C.punct });
    rest = rest.slice(keyMatch[0].length);
  }

  while (rest.length) {
    let m;
    if ((m = rest.match(/^"(?:[^"\\]|\\.)*"/))) {
      tokens.push({ text: m[0], color: C.string });
    } else if ((m = rest.match(/^-?\d+(?:\.\d+)?/))) {
      tokens.push({ text: m[0], color: C.number });
    } else if ((m = rest.match(/^(?:true|false|null)\b/))) {
      tokens.push({ text: m[0], color: C.bool });
    } else if ((m = rest.match(/^[{}[\],:]/))) {
      tokens.push({ text: m[0], color: C.punct });
    } else if ((m = rest.match(/^\s+/))) {
      tokens.push({ text: m[0], color: null });
    } else {
      tokens.push({ text: rest[0], color: C.plain });
      rest = rest.slice(1);
      continue;
    }
    rest = rest.slice(m[0].length);
  }
  return tokens;
}

const lines = JSON_TEXT.split("\n");

// ── Layout ──
const W = 1500;
const PANEL_X = 60;
const PANEL_Y = 200;
const PANEL_W = W - PANEL_X * 2;
const CODE_X = PANEL_X + 96;     // after the line-number gutter
const CODE_TOP = PANEL_Y + 52;
const LINE_H = 27;
const FONT = 17;
const PANEL_H = CODE_TOP - PANEL_Y + lines.length * LINE_H + 30;
const H = PANEL_Y + PANEL_H + 120;

const codeLines = lines
  .map((line, i) => {
    const y = CODE_TOP + i * LINE_H;
    const num = String(i + 1).padStart(2, "0");
    const spans = tokenise(line)
      .map((t) => (t.color ? `<tspan fill="${t.color}">${esc(t.text)}</tspan>` : esc(t.text)))
      .join("");
    return (
      `  <text x="${PANEL_X + 32}" y="${y}" fill="#475569" font-size="${FONT}" xml:space="preserve">${num}</text>\n` +
      `  <text x="${CODE_X}" y="${y}" font-size="${FONT}" xml:space="preserve">${spans}</text>`
    );
  })
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="'JetBrains Mono', ui-monospace, monospace">
  <style>text { font-family: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace; }</style>
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e8eaef" stroke-width="0.5"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <!-- Header -->
  <text x="60" y="56" fill="#8b92a5" font-size="15" letter-spacing="6" font-family="Orbitron, 'JetBrains Mono', monospace" font-weight="600">GEN0SEC · CYBER THREAT INTELLIGENCE</text>
  <text x="60" y="124" fill="#1a1d23" font-size="46" font-weight="700">Raw verdict payload</text>
  <text x="60" y="158" fill="#5a6178" font-size="16">176.65.139.130 · application/json · CORTEX intel output</text>

  <!-- Verdict chip (top-right) -->
  <rect x="1168" y="88" width="272" height="60" rx="10" fill="rgba(220,38,38,0.07)" stroke="#dc2626" stroke-width="1.8"/>
  <circle cx="1204" cy="118" r="7" fill="#dc2626"/>
  <text x="1224" y="125" fill="#dc2626" font-size="20" font-weight="700">advice: block</text>

  <!-- Code panel -->
  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Title bar -->
  <circle cx="${PANEL_X + 26}" cy="${PANEL_Y + 26}" r="6" fill="#ff5f57"/>
  <circle cx="${PANEL_X + 46}" cy="${PANEL_Y + 26}" r="6" fill="#febc2e"/>
  <circle cx="${PANEL_X + 66}" cy="${PANEL_Y + 26}" r="6" fill="#28c840"/>
  <text x="${PANEL_X + PANEL_W - 24}" y="${PANEL_Y + 31}" fill="#64748b" font-size="14" text-anchor="end">verdict.json</text>
  <line x1="${PANEL_X}" y1="${PANEL_Y + 44}" x2="${PANEL_X + PANEL_W}" y2="${PANEL_Y + 44}" stroke="#1e293b" stroke-width="1"/>
  <!-- Gutter divider -->
  <line x1="${PANEL_X + 84}" y1="${PANEL_Y + 44}" x2="${PANEL_X + 84}" y2="${PANEL_Y + PANEL_H}" stroke="#1e293b" stroke-width="1"/>

${codeLines}

  <!-- Footer -->
  <line x1="60" y1="${H - 56}" x2="${W - 60}" y2="${H - 56}" stroke="#e8eaef" stroke-width="1"/>
  <text x="60" y="${H - 24}" fill="#8b92a5" font-size="13">schema 1.0 · ${lines.length} lines · same payload as the verdict card · syntax: key · string · number · bool</text>
</svg>
`;

const out = path.join(here, "cti-raw-json.svg");
await writeFile(out, svg);
console.log(`Wrote ${out} (${lines.length} lines, canvas ${W}x${H})`);
