import { Command } from '@commander-js/extra-typings';

import generate from './cli/generate.js';
import demo from './cli/demo.js';

const program = new Command();

program.name(__APP_NAME__)
  .version(__APP_VERSION__, '-v, --version', 'output the current version')
  .description(__APP_DESCRIPTION__)
  .allowUnknownOption()
  .configureHelp({
    showGlobalOptions: false,
    sortSubcommands: false,
    sortOptions: false,
  })
  .addCommand(generate)
  .addCommand(demo);

program.commands.forEach(cmd => {
  cmd.option('-c, --config <path>', 'use specified config file');
})

program.parseAsync(process.argv).catch(error => {
  console.error(error);
});
