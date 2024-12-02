import http from 'node:http';
import url from 'node:url';
import path from 'node:path';
import { IconFile, IconFontConfig } from '../types.js';
import { handleRoute } from './router.js';
import { Watcher } from './watcher.js';
import { readFiles } from '../utils/read-files.js';

export function createServer(config: Required<IconFontConfig>) {
  let shouldReload = false;
  const watcher = new Watcher(config);
  watcher.on('change', () => {
    console.log('change');
    shouldReload = true;
  });

  return http.createServer(async function server(this: http.Server, req, res) {
    const files = await readFiles(config.input);
    const parsedUrl = req.url && new url.URL(`http://localhost:${req.socket.localPort}${req.url}`) || null;
    if (!parsedUrl) {
      throw new Error(`URL not parsable`);
    }

    let routePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');

    if (routePath === '/healthcheck') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: shouldReload ? 'reload' : 'ok',
      }));
    } else {
      if (routePath === '/' || routePath === '/index.html') {
        shouldReload = false;
      }

      await handleRoute(routePath, req, res, config, files);
    }
  });
}
