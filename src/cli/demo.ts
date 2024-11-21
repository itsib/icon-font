import { Command } from '@commander-js/extra-typings';
import { createServer } from '../utils/server.js';
import { readConfig } from '../utils/read-config.js';
import { generatorDemo } from '../utils/generator.js';

const subprogram = new Command();
subprogram
  .name('demo')
  .description('run web server with the icon font demo')
  .action(async (_args: any, command) => {
    const args = command.optsWithGlobals() as { config?: string };
    const config = await readConfig(args.config)

    await generatorDemo(config);

    const server = createServer(config.tmp);

    server.on('listening', () => {
        console.log('Demo server listening:');
        console.log(`   http://localhost:${config.port}`);
    })

    server.listen(config.port);
  });

export default subprogram;