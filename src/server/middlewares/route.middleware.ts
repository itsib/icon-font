import http from 'node:http';
import { slugify } from '../../utils/slugify.js';
import { FAVICON } from '../../utils/constants.ts';
import { FontType, ServerConfig } from '../../types';
import { TransformToHtml } from '../../streams/transform-to-html/transform-to-html';
import { TransformToNuxt } from '../../streams/transform-to-nuxt/transform-to-nuxt';
import { prepare, read, toCss, toSvg, toTtf, ttfToEot, ttfToWoff, ttfToWoff2 } from '../../index.ts';

type Req = http.IncomingMessage;
type Res = http.ServerResponse;

export const FONT_TYPES: FontType[] = ['woff2', 'woff', 'ttf', 'eot', 'svg'];

async function indexHandler(_req: Req, res: Res, config: ServerConfig) {
  const base = config.base;

  const htmlStyleStream = base
    ? new TransformToNuxt(config.name, FONT_TYPES, config.prefix, base)
    : new TransformToHtml(config.name, FONT_TYPES, config.prefix, base);

  res.writeHead(200, { 'Content-Type': 'text/html' });

  read(config.input).pipe(prepare(config.iconsTune)).pipe(htmlStyleStream).pipe(res as any);
}

async function stylesCssHandler(_req: Req, res: Res, config: ServerConfig) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
    'Server': 'Dev Server'
  });

  await read(config.input)
    .pipe(prepare(config.iconsTune))
    .pipe(toCss(config.name, FONT_TYPES, config.prefix, config.base || '/', false))
    .pipe(res as any);
}

async function faviconHandler(_req: Req, res: Res) {
  res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
  res.write(FAVICON);
  res.end();
}

async function svgFontHandler(_req: Req, res: Res, config: ServerConfig) {
  res.writeHead(200, {
    'Content-Type': 'font/svg+xml',
    'Server': 'Dev Server'
  });

  await read(config.input)
    .pipe(prepare(config.iconsTune))
    .pipe(toSvg(config.name))
    .pipe(res as any);
}

async function ttfFontHandler(_req: Req, res: Res, config: ServerConfig) {
  res.writeHead(200, {
    'Content-Type': 'application/x-font-ttf',
    'Server': 'Dev Server'
  });

  await read(config.input)
    .pipe(prepare(config.iconsTune))
    .pipe(toTtf(config.name))
    .pipe(res as any);
}

async function woffFontHandler(_req: Req, res: Res, config: ServerConfig) {
  res.writeHead(200, {
    'Content-Type': 'font/woff',
    'Server': 'Dev Server'
  });

  await read(config.input)
    .pipe(prepare(config.iconsTune))
    .pipe(toTtf(config.name))
    .pipe(ttfToWoff())
    .pipe(res as any);
}

async function woff2FontHandler(_req: Req, res: Res, config: ServerConfig) {
  res.writeHead(200, {
    'Content-Type': 'font/woff2',
    'Server': 'Dev Server'
  });

  await read(config.input)
    .pipe(prepare(config.iconsTune))
    .pipe(toTtf(config.name))
    .pipe(ttfToWoff2())
    .pipe(res as any);
}

async function eotFontHandler(_req: Req, res: Res, config: ServerConfig) {
  res.writeHead(200, {
    'Content-Type': 'application/vnd.ms-fontobject',
    'Server': 'Dev Server'
  });

  await read(config.input)
    .pipe(prepare(config.iconsTune))
    .pipe(toTtf(config.name))
    .pipe(ttfToEot())
    .pipe(res as any);
}

async function error404Handler(_req: Req, res: Res) {
  res.writeHead(404);
  res.end('Not Found');
}

export async function routeMiddleware(req: Req, res: Res, config: ServerConfig) {
  if (res.writableEnded) return;

  const slug = slugify(config.name);

  try {
    switch (req.url) {
      case '/':
      case '/index.html':
        return await indexHandler(req, res, config);
      case '/favicon.svg':
        return await faviconHandler(req, res);
      case '/style.css':
        return await stylesCssHandler(req, res, config);
      case `/${slug}.svg`:
        return await svgFontHandler(req, res, config);
      case `/${slug}.ttf`:
        return await ttfFontHandler(req, res, config);
      case `/${slug}.woff`:
        return await woffFontHandler(req, res, config);
      case `/${slug}.woff2`:
        return await woff2FontHandler(req, res, config);
      case `/${slug}.eot`:
        return await eotFontHandler(req, res, config);
      default:
        return await error404Handler(req, res);
    }
  } catch (error: any) {
    console.error(error);
  }
}