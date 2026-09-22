import { build } from "esbuild";
import { stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import './render-arrival.mjs';

await build({
  entryPoints: ["src/brand-scene.js", "src/arrival.js", "src/analytics.js"],
  outdir: "public",
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  legalComments: "eof",
});
// Include the Pixel configuration in the bundle and version its URL so returning
// visitors cannot mix a new page with an older, disabled Pixel configuration.
const analyticsVersion = createHash('sha256').update(readFileSync('public/analytics.js')).digest('hex').slice(0, 12);
await writeFile('index.html', readFileSync('index.html', 'utf8').replace(
  /src="public\/analytics\.js(?:\?v=[a-f0-9]+)?"/,
  `src="public/analytics.js?v=${analyticsVersion}"`,
));
const output = "public/brand-scene.js";
console.log(
  `3D module: ${Math.round((await stat(output)).size / 1024)} KB / ${Math.round(gzipSync(readFileSync(output)).length / 1024)} KB gzip`,
);
console.log(
  "Static site ready. The committed bundle requires no build on the hosting server.",
);
