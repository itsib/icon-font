import { Command } from 'commander';
import { PublicExplorer } from 'cosmiconfig';
import { ConfigKeys, IconFontConfig } from '../types.ts';
import { loadConfig, mergeConfig, searchConfig } from '../utils/read-config.ts';
import { DEFAULT_CONFIG } from '../default-config.ts';
import { createServer } from '../server/server.ts';
import { Logger } from '../utils/logger.ts';

export function createDemoCommand(): Command {
  const subprogram = new Command();
  subprogram
    .name('demo')
    .alias('serve')
    .alias('d')
    .description('run web server with the icon font demo')
    .action(async (args: Omit<IconFontConfig, 'output'> & { config?: string, cwd?: string }, command) => {
      const { config: configFilePath, cwd, ...configArgs } = args;
      const configFile = configFilePath ? await loadConfig(configFilePath) : await searchConfig(process.cwd());
      const requiredFields: ConfigKeys[] = ['input', 'name', 'prefix', 'types', 'fontUrl']
      const config = mergeConfig(requiredFields, configArgs, configFile, DEFAULT_CONFIG);

      const server = createServer(config);
      server.on('listening', () => {
          Logger.serverListen(config.port)
      });
      server.listen(config.port);
    });

  return subprogram;
}