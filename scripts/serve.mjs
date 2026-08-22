import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 4173);
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

function safePath(url) {
  const pathname = decodeURIComponent(new URL(url, "http://127.0.0.1").pathname);
  const candidate = resolve(root, `.${normalize(pathname)}`);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  return candidate;
}

async function resolveFile(url) {
  const candidate = safePath(url);
  if (!candidate) return null;
  try {
    const info = await stat(candidate);
    if (info.isDirectory()) return join(candidate, "index.html");
    return candidate;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  const file = await resolveFile(request.url || "/");
  if (!file) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  try {
    await access(file);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentTypes.get(extname(file).toLowerCase()) || "application/octet-stream"
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static preview server: http://127.0.0.1:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
