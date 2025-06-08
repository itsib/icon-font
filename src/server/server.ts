import type { Server } from 'node:http';
import http from 'node:http';
import { ServerConfig } from '../types';
import { Watcher } from './watcher.ts';
import { Logger } from '../utils/logger.ts';
import { healthMiddleware, routeMiddleware } from './middlewares';

export type DemoServer = Server & { shouldReload?: boolean, config?: ServerConfig };

export function createServer(config: ServerConfig): DemoServer {
  const watcher = new Watcher(config.input);

  const server: DemoServer = http.createServer(callback);
  server.config = config;

  watcher.on('change', () => { server.shouldReload = true });

  return server;
}

async function callback(this: DemoServer, req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) {
  Logger.route(req.method || 'GET', req.url || '/');

  const config = this.config!;

  await healthMiddleware(req, res, this)
  await routeMiddleware(req, res, config)
}