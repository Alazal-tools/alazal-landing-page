import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4198);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};
http
  .createServer(async (req, res) => {
    try {
      let url = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (url.endsWith("/")) url += "index.html";
      const file = path.resolve(root, "." + url);
      const relative = path.relative(root, file);
      if (
        relative.startsWith("..") ||
        path.isAbsolute(relative) ||
        relative
          .split(path.sep)
          .some((part) => part.startsWith(".") || part === "node_modules")
      ) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      const data = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Alazal preview: http://127.0.0.1:${port}`),
  );
