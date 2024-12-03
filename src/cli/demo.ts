import { Command } from '@commander-js/extra-typings';
import { createServer } from '../server/server.js';
import { readConfig } from '../utils/read-config.js';
import { InvalidArgumentError } from 'commander';
import { Logger } from '../utils/logger.js';

const subprogram = new Command();
subprogram
  .name('demo')
  .alias('serve')
  .alias('d')
  .description('run web server with the icon font demo')
  .option('-p, --port <port>', 'Local server port', (value) => {
      const port = parseInt(value, 10);
      if (isNaN(port)) {
          throw new InvalidArgumentError('Invalid port value');
      }
      return port;
  }, 9000)
  .action(async (_args , command) => {
    const args = command.optsWithGlobals() as { config?: string };
    const config = await readConfig(args.config);
    config.port = _args.port || config.port;

    const server = createServer(config);

    server.on('listening', () => {
        Logger.serverListen(config.port)
    });
    server.listen(config.port);
  });

export default subprogram;