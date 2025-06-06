import { Command } from 'commander';
import { loadConfig } from '../utils/load-config.ts';
import { createServer } from '../server/server.ts';
import { Logger } from '../utils/logger.ts';
import { scanAvailablePort } from '../server/scan-available-port.ts';
import { AppConfig } from '../types';

export function createDemoCommand(): Command {
  const subprogram = new Command();
  subprogram
    .name('demo')
    .alias('serve')
    .alias('d')
    .description('run web server with the icon font demo')
    .action(async (args: Omit<AppConfig, 'output'> & { config?: string, cwd?: string }) => {
      const { config: configFile, cwd, ...configArgs } = args;

      const config = await loadConfig(cwd, configFile, configArgs);

      const server = createServer({ ...config, types: ['eot', 'woff', 'woff2', 'ttf', 'svg'] } as any);

      scanAvailablePort(config.port, (error, port) => {
        if (error || !port) {
          console.error(error);
          return process.exit(1);
        }

        server.listen(port);
        Logger.serverListen(port)
      });
    });

  return subprogram;
}