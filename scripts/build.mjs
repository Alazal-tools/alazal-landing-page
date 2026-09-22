import { build } from "esbuild";
import { stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import './render-arrival.mjs';

await build({
  entryPoints: ["src/brand-scene.js", "src/arrival.js", "src/analytics.js"],
  external: ['../analytics-config.js'],
  outdir: "public",
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  legalComments: "eof",
});
const output = "public/brand-scene.js";
console.log(
  `3D module: ${Math.round((await stat(output)).size / 1024)} KB / ${Math.round(gzipSync(readFileSync(output)).length / 1024)} KB gzip`,
);
console.log(
  "Static site ready. The committed bundle requires no build on the hosting server.",
);
