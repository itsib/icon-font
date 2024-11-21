import http from 'node:http';
import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';

const MIME_TYPES: Record<string, string> = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

export function createServer(root: string) {
  return http.createServer(async function server(this: http.Server, req, res) {
    try {
      const parsedUrl = req.url && new url.URL(`http://localhost:${req.socket.localPort}${req.url}`) || null;
      if (!parsedUrl) {
        res.writeHead(500);
        res.end(`URL not parsable`);
        return;
      }


      let fileRelativePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
      if (fileRelativePath === '/') {
        res.writeHead(301, {
          Location: `http://localhost:${req.socket.localPort}/index.html`,
        });
        res.end();
        return;
      }
      const pathname = path.join(root, fileRelativePath);
      const mimeType = MIME_TYPES[path.extname(pathname)] || 'text/plain; charset=utf-8';

      await fs.stat(pathname, { bigint: true });

      let headersSent = false;
      const stream = createReadStream(pathname, { flags: 'r' });

      stream.on('close', () => res.end());

      stream.on('open', () => {
        if (!headersSent) {
          res.writeHead(200, {
            'Content-Type': mimeType,
            'Server': 'Dev Server',
          });
          headersSent = true;
        }
      });

      stream.on('data', chunk => res.write(chunk));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
        res.end();
        return;
      }

      res.writeHead(500);
      res.end(error.message);
      res.end();
    }
  });
}
