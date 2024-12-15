import { Command } from 'commander';
import { pipeline } from 'node:stream';
import { loadConfig } from '../utils/load-config.ts';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { slugify } from '../utils/slugify.js';
import { Logger } from '../utils/logger.js';
import { StreamRead } from '../streams/stream-read/stream-read.ts';
import { TransformPrepareIcons } from '../streams/transform-prepare-icons/transform-prepare-icons.ts';
import { TransformToSvg } from '../streams/transform-to-svg/transform-to-svg.ts';
import { TransformToTtf } from '../streams/transform-to-ttf/transform-to-ttf.ts';
import { TransformTtfToEot } from '../streams/transform-ttf-to-eot/transform-ttf-to-eot.ts';
import { TransformToCss } from '../streams/transform-to-css/transform-to-css.ts';
import { TransformTtfToWoff } from '../streams/transform-ttf-to-woff/transform-ttf-to-woff.ts';
import { TransformTtfToWoff2 } from '../streams/transform-ttf-to-woff2/transform-ttf-to-woff2.ts';

export function createGenerateCommand(): Command {
  const subprogram = new Command();

  subprogram
    .name('generate')
    .alias('g')
    .alias('gen')
    .description('Generate icon font')
    .action(async (args: any, command: Command) => {
      const start = Date.now();

      const { config: configFile, cwd, ...configArgs } = args;
      const config = await loadConfig(cwd, configFile, configArgs);

      await fs.rm(config.output, { recursive: true, force: true });
      await fs.mkdir(config.output, { recursive: true });
      const slug = slugify(config.name);

      for await (const type of config.types) {
        switch (type) {
          case 'svg': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.svg`);
              pipeline(
                new StreamRead(config.input),
                new TransformPrepareIcons(),
                new TransformToSvg(config.name),
                createWriteStream(filename),
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                },
              );
            });
            break;
          }
          case 'ttf': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.ttf`);
              pipeline(
                new StreamRead(config.input),
                new TransformPrepareIcons(),
                new TransformToTtf(config.name),
                createWriteStream(filename),
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                },
              );
            });
            break;
          }
          case 'eot': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.eot`);
              pipeline(
                new StreamRead(config.input),
                new TransformPrepareIcons(),
                new TransformToTtf(config.name),
                new TransformTtfToEot(),
                createWriteStream(filename),
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                },
              );
            });
            break;
          }
          case 'woff': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.woff`);
              pipeline(
                new StreamRead(config.input),
                new TransformPrepareIcons(),
                new TransformToTtf(config.name),
                new TransformTtfToWoff(),
                createWriteStream(filename),
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                },
              );
            });
            break;
          }
          case 'woff2': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.woff2`);
              pipeline(
                new StreamRead(config.input),
                new TransformPrepareIcons(),
                new TransformToTtf(config.name),
                new TransformTtfToWoff2(),
                createWriteStream(filename),
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                },
              );
            });
            break;
          }
        }
      }

      const filenameCss = path.join(config.output, `${slug}.css`);
      new StreamRead(config.input)
        .pipe(new TransformPrepareIcons())
        .pipe(new TransformToCss(config.name, config.types, config.prefix, config.fontUrl))
        .pipe(createWriteStream(filenameCss, 'utf8'));

      Logger.created(filenameCss);

      Logger.done(Date.now() - start);
    });

  return subprogram;
}