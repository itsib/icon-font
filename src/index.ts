import { Command } from 'commander';
import { cosmiconfig } from 'cosmiconfig';
import { createGenerateCommand } from './cli/generate.js';
import { createDemoCommand } from './cli/demo.js';

const Program = new Command();

Program.name(__APP_NAME__)
  .version(__APP_VERSION__, '-v, --version', 'output the current version')
  .description(__APP_DESCRIPTION__)
  .allowUnknownOption()
  .configureHelp({
    showGlobalOptions: false,
    sortSubcommands: false,
    sortOptions: false,
  })
  .addCommand(createGenerateCommand())
  .addCommand(createDemoCommand());

(async () => {
  Program.commands.forEach(cmd => {
    const commandName = cmd.name();
    const isDemo = commandName === 'demo';
    const isGen = commandName === 'generate';

    isDemo && cmd.option('-p, --port <number>', 'local port for demo server');
    cmd.option('-c, --config <value>', 'use specified config file');
    cmd.option('-i, --input <value>', 'the directory where the source files of the svg icons are located');
    isGen && cmd.option('-o, --output <value>', 'the directory where the generated files will be sent');
    cmd.option('-n, --name <value>', 'your font name, used for generated fonts and files');
    cmd.option('-t, --types <values...>', 'fonts files extension to generate');
    cmd.option('    --cwd <value>', 'pass specified current working directory ', process.cwd());
    isGen && cmd.option('    --font-url <value>', 'this address is set in the @font-face CSS file');
    cmd.option('    --prefix <value>', 'CSS classname prefix for icons');
  });

  await Program.parseAsync(process.argv);
})();



