import http from 'node:http';
import url from 'node:url';
import path from 'node:path';
import { generateIndexHtml, generateLogoSvg } from '../generators/index.js';
import { generateFaviconIco } from '../generators/favicon-ico/favicon-ico.js';
import { IconFile, IconFontConfig } from '../types.js';
import { generateStyleCss } from '../generators/style-css/style-css.js';
import { slugify } from '../utils/slugify.js';
import { generateFontSvg } from '../generators/font-svg/font-svg.js';
import { generateFontTtf } from '../generators/font-ttf/font-ttf.js';
import { generateFontWoff2 } from '../generators/font-woff2/font-woff2.js';
import { generateFontWoff } from '../generators/font-woff/font-woff.js';

async function indexHandler(_req: http.IncomingMessage, res: http.ServerResponse, fontName: string, prefix: string, files: IconFile[]) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(generateIndexHtml(fontName, prefix, files));
  res.end();
}

async function logoHandler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
  res.end(generateLogoSvg());
}

async function stylesCssHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Required<IconFontConfig>, files: IconFile[]) {
  res.writeHead(200, { 'Content-Type': 'text/css' });
  res.write(generateStyleCss(config.name, config.prefix, config.types, files, '/'));
  res.end();
}

async function faviconHandler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
  res.write(generateFaviconIco())
  res.end();
}

async function healthcheckHandler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
  }));
}

async function svgFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Required<IconFontConfig>, files: IconFile[]) {
  res.writeHead(200, {
    'Content-Type': 'font/svg+xml',
    'Server': 'Dev Server',
  });
  res.write(await generateFontSvg(config, files));
  res.end();
}

async function ttfFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Required<IconFontConfig>, files: IconFile[]) {
  res.writeHead(200, {
    'Content-Type': 'application/x-font-ttf',
    'Server': 'Dev Server',
  });
  res.write(await generateFontTtf(config, files));
  res.end();
}

async function woffFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Required<IconFontConfig>, files: IconFile[]) {
  res.writeHead(200, {
    'Content-Type': 'font/woff',
    'Server': 'Dev Server',
  });
  res.write(await generateFontWoff(config, files));
  res.end();
}

async function woff2FontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Required<IconFontConfig>, files: IconFile[]) {
  res.writeHead(200, {
    'Content-Type': 'font/woff2',
    'Server': 'Dev Server',
  });
  res.write(await generateFontWoff2(config, files));
  res.end();
}

async function error404Handler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(404);
  res.end('Not Found');
}

export function createServer(config: Required<IconFontConfig>, files: IconFile[]) {
  const slug = slugify(config.name);

  return http.createServer(async function server(this: http.Server, req, res) {
    try {
      const parsedUrl = req.url && new url.URL(`http://localhost:${req.socket.localPort}${req.url}`) || null;
      if (!parsedUrl) {
        throw new Error(`URL not parsable`);
      }


      if (req.url !== '/healthcheck') {
        console.log(`${req.method}: ${req.url}`);
      }

      let routePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
      switch (routePath) {
        case '/':
        case '/index.html':
          return await indexHandler(req, res, config.name, config.prefix, files);
        case '/logo.svg':
          return await logoHandler(req, res);
        case '/favicon.svg':
          return await faviconHandler(req, res);
        case '/healthcheck':
          return await healthcheckHandler(req, res);
        case '/style.css':
          return await stylesCssHandler(req, res, config, files);
        case `/${slug}.svg`:
          return await svgFontHandler(req, res, config, files);
        case `/${slug}.ttf`:
          return await ttfFontHandler(req, res, config, files);
        case `/${slug}.woff`:
          return await woffFontHandler(req, res, config, files);
        case `/${slug}.woff2`:
          return await woff2FontHandler(req, res, config, files);
        default:
          return await error404Handler(req, res);
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      res.writeHead(500);
      res.end(error.message);
    }
  });
}
