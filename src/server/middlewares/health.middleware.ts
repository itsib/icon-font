import { IncomingMessage, ServerResponse } from 'http';

export async function healthMiddleware(req: InstanceType<typeof IncomingMessage>, res: InstanceType<typeof ServerResponse>, reload: { shouldReload?: boolean }) {
  if (res.writableEnded) return;

  if (req.url === '/healthcheck') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: reload.shouldReload ? 'reload' : 'ok',
    }));
  } else {
    if (req.url === '/' || req.url === '/index.html') {
      reload.shouldReload = false;
    }
  }
}