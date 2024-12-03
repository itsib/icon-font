import { Command } from '@commander-js/extra-typings';
import { readConfig } from '../utils/read-config.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { generateFontSvg } from '../generators/font-svg/font-svg.js';
import { readFiles } from '../utils/read-files.js';
import { generateFontTtfBySvg } from '../generators/font-ttf/font-ttf.js';
import { slugify } from '../utils/slugify.js';
import { generateFontEotByTtf } from '../generators/font-eot/font-eot.js';
import { generateFontWoffByTtf } from '../generators/font-woff/font-woff.js';
import { generateFontWoff2ByTtf } from '../generators/font-woff2/font-woff2.js';
import { generateStyleCss } from '../generators/style-css/style-css.js';
import { Logger } from '../utils/logger.js';

const subprogram = new Command();

subprogram
  .name('generate')
  .alias('g')
  .alias('gen')
  .description('Generate icon font')
  .option('--cwd <path>', 'pass specified current working directory ', process.cwd())
  .action(async (_args: any, command) => {
    const start = Date.now();
    const args = command.optsWithGlobals() as { config?: string };
    const config = await readConfig(args.config);

    await fs.rm(config.output, { recursive: true, force: true });
    await fs.mkdir(config.output, { recursive: true });

    const slug = slugify(config.name);
    const files = await readFiles(config.input);
    const fontSvg = await generateFontSvg(config, files);
    const fontTtf = await generateFontTtfBySvg(fontSvg);

    for (const type of config.types) {
      const filename = path.join(config.output, `${slug}.${type}`);

      switch (type) {
        case 'svg':
          await fs.writeFile(filename, fontSvg, 'utf8');
          break;
        case 'ttf':
          await fs.writeFile(filename, fontTtf);
          break;
        case 'eot':
          const fontEot = await generateFontEotByTtf(fontTtf);
          await fs.writeFile(filename, fontEot);
          break;
        case 'woff':
          const fontWoff = await generateFontWoffByTtf(fontTtf);
          await fs.writeFile(filename, fontWoff);
          break;
        case 'woff2':
          const fontWoff2 = await generateFontWoff2ByTtf(fontTtf);
          await fs.writeFile(filename, fontWoff2);
          break;
      }
      Logger.created(filename);
    }

    const styleCss = generateStyleCss(config.name, config.prefix, config.types, files, config.fontUrl);
    const filenameCss = path.join(config.output, `${slug}.css`);
    await fs.writeFile(filenameCss, styleCss, 'utf8');
    Logger.created(filenameCss);

    Logger.done(Date.now() - start, files.length);
  });


export default subprogram;