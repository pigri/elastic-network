// Convert article-draft.md → article-draft.html (Substack-friendly HTML).
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/documentation/node_modules/.pnpm/marked@16.4.2/node_modules/marked/package.json",
);
const { marked } = req("marked");

const src = path.join(here, "article-draft.md");
const dst = path.join(here, "article-draft.html");

const md = await readFile(src, "utf8");

marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
const body = marked.parse(md);

// Substack accepts pasted HTML fragments. No need to wrap in full doctype.
await writeFile(dst, body);
console.log(`Wrote ${dst}`);
