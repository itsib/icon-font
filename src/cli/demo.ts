import { Command } from '@commander-js/extra-typings';
import { createServer } from '../server/server.js';
import { readConfig } from '../utils/read-config.js';
import { InvalidArgumentError } from 'commander';
import { readFiles } from '../utils/read-files.js';

const subprogram = new Command();
subprogram
  .name('demo')
  .description('run web server with the icon font demo')
  .option('-p, --port <port>', 'Local server port', (value) => {
      const port = parseInt(value, 10);
      if (isNaN(port)) {
          throw new InvalidArgumentError('Invalid port value');
      }
      return port;
  })
  .action(async (_args , command) => {
    const args = command.optsWithGlobals() as { config?: string };
    const config = await readConfig(args.config);

    const files = await readFiles(config.input);

    const port = _args.port || config.port;
    const server = createServer(config, files);

    server.on('listening', () => {
        console.log('Demo server listening:');
        console.log(`http://localhost:${port}`);
    })

    server.listen(port);
  });

export default subprogram;