import { Command } from 'commander';
import { pipeline } from 'node:stream/promises';
import { loadConfig } from '../utils/load-config.ts';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { slugify } from '../utils/slugify.js';
import { Logger } from '../utils/logger.js';
import { AppConfig } from '../types';
import { prepare, read, toCss, toSvg, toTtf, ttfToEot, ttfToWoff, ttfToWoff2 } from '../index.ts';

export function createGenerateCommand(): Command {
  const subprogram = new Command();

  subprogram
    .name('generate')
    .alias('g')
    .alias('gen')
    .description('Generate icon font')
    .action(async (args: any) => {
      const start = Date.now();

      const { config: configFile, cwd, ...configArgs } = args;
      const config = await loadConfig(cwd, configFile, configArgs as Partial<AppConfig>);

      await fs.rm(config.output, { recursive: true, force: true });
      await fs.mkdir(config.output, { recursive: true });
      const slug = slugify(config.name);

      for await (const type of config.types) {
        switch (type) {
          case 'svg': {
            const filename = path.join(config.output, `${slug}.svg`);

            await pipeline(
              read(config.input),
              prepare(config.iconsTune, config.shapeSizeAdjust, config.startUnicode),
              toSvg('config.name'),
              createWriteStream(filename),
            )
            break;
          }
          case 'ttf': {
            const filename = path.join(config.output, `${slug}.ttf`);

            await pipeline(
              read(config.input),
              prepare(config.iconsTune, config.shapeSizeAdjust, config.startUnicode),
              toTtf('config.name'),
              createWriteStream(filename),
            )
            Logger.created(filename);
            break;
          }
          case 'eot': {
            const filename = path.join(config.output, `${slug}.eot`);

            await pipeline(
              read(config.input),
              prepare(config.iconsTune, config.shapeSizeAdjust, config.startUnicode),
              toTtf('config.name'),
              ttfToEot(),
              createWriteStream(filename),
            )
            Logger.created(filename);
            break;
          }
          case 'woff': {
            const filename = path.join(config.output, `${slug}.woff`);

            await pipeline(
              read(config.input),
              prepare(config.iconsTune, config.shapeSizeAdjust, config.startUnicode),
              toTtf('config.name'),
              ttfToWoff(),
              createWriteStream(filename),
            )
            Logger.created(filename);
            break;
          }
          case 'woff2': {
            const filename = path.join(config.output, `${slug}.woff2`);

            await pipeline(
              read(config.input),
              prepare(config.iconsTune, config.shapeSizeAdjust, config.startUnicode),
              toTtf('config.name'),
              ttfToWoff2(),
              createWriteStream(filename),
            )
            Logger.created(filename);
            break;
          }
        }
      }

      const filenameCss = path.join(config.output, `${slug}.css`);

      await pipeline(
        read(config.input),
        prepare(config.iconsTune, config.shapeSizeAdjust, config.startUnicode),
        toCss(config.name, config.types, config.prefix, config.fontUrl, config.fontUrlHash),
        createWriteStream(filenameCss, 'utf8'),
      )
      Logger.created(filenameCss);
      Logger.done(Date.now() - start);
    });

  return subprogram;
}