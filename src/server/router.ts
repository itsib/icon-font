import http from 'node:http';
import { slugify } from '../utils/slugify.js';
import { Logger } from '../utils/logger.js';
import { FAVICON } from '../constants.ts';
import { AppConfig } from '../types';
import { StreamRead } from '../streams/stream-read/stream-read.ts';
import { TransformPrepareIcons } from '../streams/transform-prepare-icons/transform-prepare-icons.ts';
import { TransformToTtf } from '../streams/transform-to-ttf/transform-to-ttf.ts';
import { TransformToSvg } from '../streams/transform-to-svg/transform-to-svg.ts';
import { TransformToCss } from '../streams/transform-to-css/transform-to-css.ts';
import { TransformToHtml } from '../streams/transform-to-html/transform-to-html.ts';
import { TransformTtfToEot } from '../streams/transform-ttf-to-eot/transform-ttf-to-eot.ts';
import { TransformTtfToWoff2 } from '../streams/transform-ttf-to-woff2/transform-ttf-to-woff2.ts';
import { TransformTtfToWoff } from '../streams/transform-ttf-to-woff/transform-ttf-to-woff.ts';

async function indexHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  const filesReadStream = new StreamRead(config.input);
  const prepareStream = new TransformPrepareIcons(config.iconsTune);
  const htmlStyleStream = new TransformToHtml(config.name, config.types, config.prefix, '/');

  res.writeHead(200, { 'Content-Type': 'text/html' });

  filesReadStream.pipe(prepareStream).pipe(htmlStyleStream).pipe(res);
}

async function stylesCssHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  const filesReadStream = new StreamRead(config.input);
  const prepareStream = new TransformPrepareIcons(config.iconsTune);
  const cssStyleStream = new TransformToCss(config.name, config.types, config.prefix, '/', false);

  res.writeHead(200, {
    'Content-Type': 'text/css',
    'Server': 'Dev Server',
  });
  filesReadStream.pipe(prepareStream).pipe(cssStyleStream).pipe(res);
}

async function faviconHandler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
  res.write(FAVICON);
  res.end();
}

async function svgFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  const filesReadStream = new StreamRead(config.input);
  const prepareStream = new TransformPrepareIcons(config.iconsTune);
  const svgFontStream = new TransformToSvg(config.name);

  res.writeHead(200, {
    'Content-Type': 'font/svg+xml',
    'Server': 'Dev Server',
  });

  filesReadStream.pipe(prepareStream).pipe(svgFontStream).pipe(res);
}

async function ttfFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  const filesReadStream = new StreamRead(config.input);
  const prepareStream = new TransformPrepareIcons(config.iconsTune);
  const ttfFontStream = new TransformToTtf(config.name);

  res.writeHead(200, {
    'Content-Type': 'application/x-font-ttf',
    'Server': 'Dev Server',
  });

  filesReadStream.pipe(prepareStream).pipe(ttfFontStream).pipe(res);
}

async function woffFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  const filesReadStream = new StreamRead(config.input);
  const prepareStream = new TransformPrepareIcons(config.iconsTune);
  const ttfFontStream = new TransformToTtf(config.name);
  const woffFontStream = new TransformTtfToWoff();

  res.writeHead(200, {
    'Content-Type': 'font/woff',
    'Server': 'Dev Server',
  });
  filesReadStream.pipe(prepareStream).pipe(ttfFontStream).pipe(woffFontStream).pipe(res);
}

async function woff2FontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  const filesReadStream = new StreamRead(config.input);
  const prepareStream = new TransformPrepareIcons(config.iconsTune);
  const ttfFontStream = new TransformToTtf(config.name);
  const woff2FontStream = new TransformTtfToWoff2();

  res.writeHead(200, {
    'Content-Type': 'font/woff2',
    'Server': 'Dev Server',
  });
  filesReadStream.pipe(prepareStream).pipe(ttfFontStream).pipe(woff2FontStream).pipe(res);
}

async function eotFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  const filesReadStream = new StreamRead(config.input);
  const prepareStream = new TransformPrepareIcons(config.iconsTune);
  const ttfFontStream = new TransformToTtf(config.name);
  const eotFontStream = new TransformTtfToEot();

  res.writeHead(200, {
    'Content-Type': 'application/vnd.ms-fontobject',
    'Server': 'Dev Server',
  });

  filesReadStream.pipe(prepareStream).pipe(ttfFontStream).pipe(eotFontStream).pipe(res);
}

async function error404Handler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(404);
  res.end('Not Found');
}

export async function handleRoute(path: string, req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  const slug = slugify(config.name);
  Logger.route(req.method || 'GET', req.url || '/');

  try {
    switch (path) {
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