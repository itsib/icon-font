import { Command } from '@commander-js/extra-typings';
import { readConfig } from '../utils/read-config.js';
import fs from 'node:fs/promises';
import { generateFontSvg } from '../generators/font-svg/font-svg.js';
// import { slugify } from '../utils/slugify.js';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { readFiles } from '../utils/read-files.js';
import { generateFontTtfBySvg } from '../generators/font-ttf/font-ttf.js';
import { slugify } from '../utils/slugify.js';
import { generateFontEotByTtf } from '../generators/font-eot/font-eot.js';
import { generateFontWoffByTtf } from '../generators/font-woff/font-woff.js';
import { generateFontWoff2ByTtf } from '../generators/font-woff2/font-woff2.js';
import { generateStyleCss } from '../generators/style-css/style-css.js';

const subprogram = new Command();

subprogram
  .name('generate')
  .description('Generate icon font')
  .action(async (_args: any, command) => {
    const args = command.optsWithGlobals() as { config?: string };
    const config = await readConfig(args.config);

    await fs.rm(config.output, { recursive: true, force: true });
    await fs.mkdir(config.output, { recursive: true });

    const slug = slugify(config.name);
    const files = await readFiles(config.input);
    const fontSvg = await generateFontSvg(config, files);
    const fontTtf = await generateFontTtfBySvg(fontSvg);

    for (const type of config.types) {
      switch (type) {
        case 'svg':
          await fs.writeFile(path.join(config.output, `${slug}.svg`), fontSvg, 'utf8');
          break;
        case 'ttf':
          await fs.writeFile(path.join(config.output, `${slug}.ttf`), fontTtf);
          break;
        case 'eot':
          const fontEot = await generateFontEotByTtf(fontTtf);
          await fs.writeFile(path.join(config.output, `${slug}.eot`), fontEot);
          break;
        case 'woff':
          const fontWoff = await generateFontWoffByTtf(fontTtf);
          await fs.writeFile(path.join(config.output, `${slug}.woff`), fontWoff);
          break;
        case 'woff2':
          const fontWoff2 = await generateFontWoff2ByTtf(fontTtf);
          await fs.writeFile(path.join(config.output, `${slug}.woff2`), fontWoff2);
          break;
      }
    }

    const styleCss = generateStyleCss(config.name, config.prefix, config.types, files, config.fontUrl);
    await fs.writeFile(path.join(config.output, `${slug}.css`), styleCss, 'utf8');
  });


export default subprogram;