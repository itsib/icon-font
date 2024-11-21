import { Command } from '@commander-js/extra-typings';
import { readConfig } from '../utils/read-config.js';
import { generator } from '../utils/generator.js';


const subprogram = new Command();

subprogram
  .name('generate')
  .description('Generate icon font')
  .action(async (_args: any, command) => {
    const args = command.optsWithGlobals() as { config?: string };
    const config = await readConfig(args.config)

    await generator(config);
  });


export default subprogram;