import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT ?? 5173);
const host = process.env.HOST ?? '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const getFilePath = async (requestUrl) => {
  const url = new URL(requestUrl ?? '/', `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const safePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = resolve(join(root, safePath));

  if (!filePath.startsWith(root)) {
    return null;
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
    return filePath;
  } catch {
    return join(root, 'index.html');
  }
};

const server = createServer(async (request, response) => {
  const filePath = await getFilePath(request.url);

  if (!filePath) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}/`);
});
