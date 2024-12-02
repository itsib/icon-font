import { Command } from '@commander-js/extra-typings';
import { readConfig } from '../utils/read-config.js';
import fs from 'node:fs/promises';
import { generateFontSvg } from '../generators/font-svg/font-svg.js';
// import { slugify } from '../utils/slugify.js';
import svg2ttf from 'svg2ttf';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { readFiles } from '../utils/read-files.js';

const subprogram = new Command();

subprogram
  .name('generate')
  .description('Generate icon font')
  .action(async (_args: any, command) => {
    const args = command.optsWithGlobals() as { config?: string };
      const config = await readConfig(args.config);
      // const _slug = slugify(config.name);

      await fs.mkdir(config.output, { recursive: true });

      const files = await readFiles(config.input);
      const fontSvg = await generateFontSvg(config, files);

      const ttf = svg2ttf(fontSvg, {});

      await fs.writeFile(path.join(process.cwd(), 'tmp/icon-font.ttf'), Buffer.from(ttf.buffer));

      // console.log(fontSvg);
  });


export default subprogram;