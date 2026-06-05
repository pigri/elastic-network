// Render the Elastic Defense comparison SVG to PNGs.
//   - elastic-defense-comparison-1600.png  (native landscape, docs/decks)
//   - elastic-defense-comparison-1080x1350.png  (Instagram/LinkedIn portrait)
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const req = createRequire(
  "/home/pigri/work/gen0sec/core/landing/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/package.json",
);
const sharp = req("sharp");

const SRC = path.join(here, "elastic-defense-comparison.svg");
const svg = await readFile(SRC);

async function render({ name, contentW, canvasW, canvasH }) {
  const raster = await sharp(svg, { density: 300 })
    .resize({ width: contentW })
    .png()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = raster.info;
  const top = Math.max(0, Math.round((canvasH - height) / 2));
  const bottom = Math.max(0, canvasH - height - top);
  const left = Math.max(0, Math.round((canvasW - width) / 2));
  const right = Math.max(0, canvasW - width - left);
  await sharp(raster.data)
    .extend({ top, bottom, left, right, background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(here, name));
  console.log(`  ${name}  ${canvasW}x${canvasH}  (content ${width}x${height})`);
}

console.log("Rendering Elastic Defense comparison:");
await render({
  name: "elastic-defense-comparison-1600.png",
  contentW: 1600,
  canvasW: 1600,
  canvasH: 1470,
});
await render({
  name: "elastic-defense-comparison-1080x1350.png",
  contentW: 1040,
  canvasW: 1080,
  canvasH: 1350,
});
await render({
  name: "elastic-defense-comparison-3200.png",
  contentW: 3200,
  canvasW: 3200,
  canvasH: 2940,
});
