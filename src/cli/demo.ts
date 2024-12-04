import { Command } from 'commander';
import { ConfigKeys, IconFontConfig } from '../types.ts';
import { loadConfig, mergeConfig, searchConfig } from '../utils/read-config.ts';
import { DEFAULT_CONFIG } from '../default-config.ts';
import { createServer } from '../server/server.ts';
import { Logger } from '../utils/logger.ts';
import { scanAvailablePort } from '../server/scan-available-port.ts';

export function createDemoCommand(): Command {
  const subprogram = new Command();
  subprogram
    .name('demo')
    .alias('serve')
    .alias('d')
    .description('run web server with the icon font demo')
    .action(async (args: Omit<IconFontConfig, 'output'> & { config?: string, cwd?: string }) => {
      const { config: configFilePath, cwd, ...configArgs } = args;
      const configFile = configFilePath ? await loadConfig(configFilePath) : await searchConfig(process.cwd());
      const requiredFields: ConfigKeys[] = ['input', 'name', 'prefix', 'types', 'fontUrl', 'port']
      const config = mergeConfig(requiredFields, configArgs, configFile, DEFAULT_CONFIG);

      const server = createServer(config);

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