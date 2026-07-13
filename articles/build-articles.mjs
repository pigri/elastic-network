// Convert every layer article (01..05) from markdown to Substack-ready HTML.
import { readdir, readFile, writeFile } from "node:fs/promises";
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

const files = (await readdir(here))
  .filter((f) => /^\d{2}-.*\.md$/.test(f))
  .sort();

console.log(`Converting ${files.length} articles:`);
for (const file of files) {
  const md = await readFile(path.join(here, file), "utf8");
  const html = marked.parse(md);
  const out = path.join(here, file.replace(".md", ".html"));
  await writeFile(out, html);
  console.log(`  ${path.basename(out)}`);
}
