import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGzip } from "node:zlib";

const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const root = path.join(project, "dist");
const port = Number(process.env.PORT || 5174);
if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error("Run npm run build before npm start.");
  process.exit(1);
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};
const server = http.createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname === "/__portfolio/health") {
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(
        JSON.stringify({
          app: "fieldnotes-portfolio-v2",
          root: project,
          pid: process.pid,
        }),
      );
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes("\0") || pathname.includes("\\")) {
      response.writeHead(400);
      response.end();
      return;
    }
    const file = path.resolve(
      root,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    if (!file.startsWith(root + path.sep)) {
      response.writeHead(403);
      response.end();
      return;
    }
    let stat;
    try {
      stat = await fs.promises.stat(file);
    } catch {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    if (!stat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const headers = {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
      "Cache-Control": pathname.startsWith("/assets/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    };
    let start = 0,
      end = stat.size - 1,
      status = 200;
    if (request.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      if (!range || (!range[1] && !range[2])) {
        response.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        response.end();
        return;
      }
      if (!range[1]) start = Math.max(0, stat.size - Number(range[2]));
      else {
        start = Number(range[1]);
        if (range[2]) end = Math.min(Number(range[2]), end);
      }
      if (start > end || start >= stat.size) {
        response.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
        response.end();
        return;
      }
      status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers["Content-Length"] = Math.max(0, end - start + 1);
    const compress =
      status === 200 &&
      /\b(?:gzip)\b/.test(request.headers["accept-encoding"] || "") &&
      /\.(js|css|html|json|svg|txt)$/.test(file) &&
      stat.size > 1024;
    if (compress) {
      headers["Content-Encoding"] = "gzip";
      headers.Vary = "Accept-Encoding";
      delete headers["Content-Length"];
    }
    response.writeHead(status, headers);
    if (request.method === "HEAD" || stat.size === 0) {
      response.end();
      return;
    }
    const stream = fs.createReadStream(file, { start, end });
    stream.on("error", () => response.destroy());
    response.on("close", () => stream.destroy());
    if (compress) {
      const zipper = createGzip();
      zipper.on("error", () => response.destroy());
      response.on("close", () => zipper.destroy());
      stream.pipe(zipper).pipe(response);
    } else stream.pipe(response);
  } catch {
    if (!response.headersSent) response.writeHead(400);
    response.end("Invalid request");
  }
});
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${port} is in use. Choose another PORT or reuse the existing preview.`
      : error.message,
  );
  process.exit(1);
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Project archive is running at http://127.0.0.1:${port}/`),
);
