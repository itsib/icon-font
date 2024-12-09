import http from 'node:http';
import { SymbolMetadata } from '../types/types.ts';
import { slugify } from '../utils/slugify.js';
import { generateIndexHtml, generateLogoSvg } from '../generators';
import { generateStyleCss } from '../generators/style-css/style-css.js';
import { generateFontSvg } from '../generators/font-svg/font-svg.js';
import { generateFontTtf } from '../generators/font-ttf/font-ttf.js';
import { generateFontWoff } from '../generators/font-woff/font-woff.js';
import { generateFontWoff2 } from '../generators/font-woff2/font-woff2.js';
import { generateFontEot } from '../generators/font-eot/font-eot.js';
import { Logger } from '../utils/logger.js';
import { LOGO_ICON } from '../utils/constants.ts';
import { AppConfig } from '../types';

async function indexHandler(_req: http.IncomingMessage, res: http.ServerResponse, fontName: string, prefix: string, files: SymbolMetadata[]) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(generateIndexHtml(fontName, prefix, files));
  res.end();
}

async function logoHandler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
  res.end(generateLogoSvg());
}

async function stylesCssHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>, files: SymbolMetadata[]) {
  res.writeHead(200, { 'Content-Type': 'text/css' });
  res.write(generateStyleCss(config.name, config.prefix, config.types, files, '/'));
  res.end();
}

async function faviconHandler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
  res.write(LOGO_ICON);
  res.end();
}

async function svgFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  res.writeHead(200, {
    'Content-Type': 'font/svg+xml',
    'Server': 'Dev Server',
  });
  res.write(await generateFontSvg(config));
  res.end();
}

async function ttfFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  res.writeHead(200, {
    'Content-Type': 'application/x-font-ttf',
    'Server': 'Dev Server',
  });
  res.write(await generateFontTtf(config));
  res.end();
}

async function woffFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  res.writeHead(200, {
    'Content-Type': 'font/woff',
    'Server': 'Dev Server',
  });
  res.write(await generateFontWoff(config));
  res.end();
}

async function woff2FontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  res.writeHead(200, {
    'Content-Type': 'font/woff2',
    'Server': 'Dev Server',
  });
  res.write(await generateFontWoff2(config));
  res.end();
}

async function eotFontHandler(_req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>) {
  res.writeHead(200, {
    'Content-Type': 'application/vnd.ms-fontobject',
    'Server': 'Dev Server',
  });
  res.write(await generateFontEot(config));
  res.end();
}

async function error404Handler(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(404);
  res.end('Not Found');
}

export async function handleRoute(path: string, req: http.IncomingMessage, res: http.ServerResponse, config: Omit<AppConfig, 'output'>, files: SymbolMetadata[]) {
  const slug = slugify(config.name);
  Logger.route(req.method || 'GET', req.url || '/');

  try {
    switch (path) {
      case '/':
      case '/index.html':
        return await indexHandler(req, res, config.name, config.prefix, files);
      case '/logo.svg':
        return await logoHandler(req, res);
      case '/favicon.svg':
        return await faviconHandler(req, res);
      case '/style.css':
        return await stylesCssHandler(req, res, config, files);
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