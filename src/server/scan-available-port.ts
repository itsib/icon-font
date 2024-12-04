import http from 'node:http';

export function scanAvailablePort(port: number, callback: (error: Error | null, port?: number) => void, attempt = 5): void {
  if (attempt === 0) {
    return callback(new Error('no free ports'));
  }
  const server = http.createServer();

  let debounce: ReturnType<typeof setTimeout> | null = null;

  server.once('listening', () => {
    debounce = setTimeout(() => {
      server.close();
      callback(null, port);
    }, 300);

  });

  server.once('error', (error: any) => {
    if (debounce !== null) {
      clearTimeout(debounce);
    }

    if (error.code !== 'EADDRINUSE') {
      return callback(error);
    }
    server.close();
    scanAvailablePort(port + 1, callback, attempt - 1);
  });

  server.listen(port);
}