// Render every SVG illustration in this folder to PNG (1600x900).
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
const sharp = req("sharp");

const files = (await readdir(here)).filter((f) => f.endsWith(".svg")).sort();

console.log(`Rendering ${files.length} illustration(s):`);
for (const file of files) {
  const buf = await readFile(path.join(here, file));
  // Render at native viewBox size × 2 for crisp output (no forced aspect).
  const m = buf.toString("utf8").match(/viewBox="0 0 (\d+) (\d+)"/);
  const w = m ? Number(m[1]) * 2 : 3200;
  const h = m ? Number(m[2]) * 2 : 1800;
  const out = path.join(here, file.replace(".svg", ".png"));
  await sharp(buf, { density: 200 })
    .resize({ width: w, height: h, fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  ${path.basename(out)}  ${w}x${h}`);
}
