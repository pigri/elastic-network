// Convert the standalone (non-layer) articles from markdown to self-contained
// HTML pages. Unlike build-articles.mjs, which emits bare Substack fragments,
// these are full documents with the shared inline stylesheet — they are meant to
// be opened directly. Images stay as relative paths into ./images, so the .html
// and the images/ directory travel together.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
// Resolve marked from whichever environment is building this (Linux box or local Mac).
const MARKED_PKGS = [
  "/home/pigri/work/gen0sec/core/documentation/node_modules/.pnpm/marked@16.4.2/node_modules/marked/package.json",
  "/Users/davidpapp/Tresorit/Projects/enterprise/src/arxignis/arxignis/core/documentation/node_modules/.pnpm/marked@16.4.2/node_modules/marked/package.json",
];
const req = createRequire(MARKED_PKGS.find(existsSync) ?? MARKED_PKGS[0]);
const { marked } = req("marked");

marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });

// <title> is not derived from the H1 — the H1 is a full headline, the title is
// the short form that belongs in a browser tab.
const ARTICLES = [
  {
    slug: "openai-huggingface-incident",
    title: "The OpenAI–Hugging Face incident: what happened",
  },
  {
    slug: "gen0sec-machine-speed-defense",
    title: "Gen0Sec against machine-speed exploitation",
  },
];

const CSS = `
:root{--bg:#ffffff;--ink:#1a1d23;--sub:#5a6178;--faint:#8b92a5;--line:#e2e5ec;--blue:#006fff;--code:#f4f5f8;}
*{box-sizing:border-box}
body{margin:0;background:#f6f7f9;color:var(--ink);font:17px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:760px;margin:0 auto;padding:56px 24px 96px;background:var(--bg)}
h1{font-size:2.05rem;line-height:1.2;letter-spacing:-.02em;margin:0 0 1.1rem}
h2{font-size:1.4rem;letter-spacing:-.01em;margin:2.6rem 0 .9rem;padding-top:.4rem;border-top:1px solid var(--line)}
h2:first-of-type{border-top:none}
p{margin:0 0 1.15rem}
a{color:var(--blue);text-decoration:none}
a:hover{text-decoration:underline}
strong{font-weight:650}
ul,ol{margin:0 0 1.2rem;padding-left:1.4rem}
li{margin:.35rem 0}
img{max-width:100%;height:auto;display:block;margin:1.6rem auto;border:1px solid var(--line);border-radius:8px}
em{color:var(--sub)}
p > em:only-child{display:block;font-size:.92rem;color:var(--sub);text-align:center;margin:-.6rem auto 1.8rem;max-width:640px;line-height:1.5}
code{background:var(--code);padding:.12em .4em;border-radius:4px;font-size:.88em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
table{border-collapse:collapse;width:100%;margin:1.4rem 0;font-size:.92rem;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:.55rem .7rem;text-align:left;vertical-align:top}
th{background:var(--code);font-weight:650}
hr{border:none;border-top:1px solid var(--line);margin:2.6rem 0}
h2 + p em:only-child, main > p:last-child em{color:var(--faint)}
`.trim();

console.log(`Converting ${ARTICLES.length} standalone articles:`);
for (const { slug, title } of ARTICLES) {
  const md = await readFile(path.join(here, `${slug}.md`), "utf8");
  const body = marked.parse(md);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>
${CSS}
</style></head>
<body><main>${body}</main></body></html>
`;
  const out = path.join(here, `${slug}.html`);
  await writeFile(out, html);
  console.log(`  ${path.basename(out)}`);
}
