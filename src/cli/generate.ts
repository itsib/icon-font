import { Command } from 'commander';
import { loadConfig, mergeConfig, searchConfig } from '../utils/read-config.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { generateFontSvg } from '../generators/font-svg/font-svg.js';
import { generateFontTtf } from '../generators/font-ttf/font-ttf.js';
import { slugify } from '../utils/slugify.js';
import { generateFontEotByTtf } from '../generators/font-eot/font-eot.js';
import { generateFontWoffByTtf } from '../generators/font-woff/font-woff.js';
import { generateFontWoff2ByTtf } from '../generators/font-woff2/font-woff2.js';
import { generateStyleCss } from '../generators/style-css/style-css.js';
import { Logger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../default-config.ts';
import { readFiles } from '../utils/read-files.ts';
import { AppConfigKeys } from '../types';

export function createGenerateCommand(): Command {
  const subprogram = new Command();

  subprogram
    .name('generate')
    .alias('g')
    .alias('gen')
    .description('Generate icon font')
    .action(async (args: any, command: Command) => {
      const start = Date.now();

      const { config: configFilePath, cwd, ...configArgs } = args;
      const configFile = configFilePath ? await loadConfig(configFilePath) : await searchConfig(process.cwd());
      const requiredFields: AppConfigKeys[] = ['input', 'output', 'name', 'prefix', 'types', 'port']
      const config = mergeConfig(requiredFields, configArgs, configFile, DEFAULT_CONFIG);

      await fs.rm(config.output, { recursive: true, force: true });
      await fs.mkdir(config.output, { recursive: true });

      const slug = slugify(config.name);
      const files = await readFiles(config.input);
      const fontSvg = await generateFontSvg(config);
      const fontTtf = await generateFontTtf(config);

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

  return subprogram;
}