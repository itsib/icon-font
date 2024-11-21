import { Command } from '@commander-js/extra-typings';

import generate from './cli/generate.js';
import demo from './cli/demo.js';

const program = new Command();

program.name(__APP_NAME__)
  .version(__APP_VERSION__, '-v, --version', 'output the current version')
  .description(__APP_DESCRIPTION__)
  .allowUnknownOption()
  .option('--root <path>', 'use specified project root directory', process.cwd())
  .option('-c, --config <path>', 'use specified config file')
  .configureHelp({
    showGlobalOptions: true,
    sortSubcommands: false,
    sortOptions: true,
    subcommandTerm(cmd) {
      const name = cmd.name();
      const parent = cmd.parent?.name();
      if (name === 'generate') {
        return '' + parent;
      }

      if (parent) {
        return '' + parent + ' ' + cmd.name();
      }
      return '' + cmd.name();
    }
  })
  .addCommand(generate, {
    isDefault: true
  })
  .addCommand(demo);

program.parseAsync(process.argv).catch(error => {
  console.error(error);
});
