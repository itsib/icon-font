import { Command } from 'commander';
import { loadConfig } from '../utils/load-config.ts';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { slugify } from '../utils/slugify.js';
import { Logger } from '../utils/logger.js';
import { StreamReadIconFiles } from '../streams/stream-read-icon-files/stream-read-icon-files.ts';
import { TransformPrepareIcons } from '../streams/transform-prepare-icons/transform-prepare-icons.ts';
import { TransformToCss } from '../streams/transform-to-css/transform-to-css.ts';
import { AppConfig } from '../types';
import { compileCss, compileEot, compileSvg, compileTtf, compileWoff, compileWoff2 } from '../compilers.ts';

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
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.svg`);

              compileSvg(
                config.name,
                new StreamReadIconFiles(config.input),
                createWriteStream(filename),
                config.iconsTune,
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                }
              )
            });
            break;
          }
          case 'ttf': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.ttf`);

              compileTtf(
                config.name,
                new StreamReadIconFiles(config.input),
                createWriteStream(filename),
                config.iconsTune,
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                }
              )
            });
            break;
          }
          case 'eot': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.eot`);

              compileEot(
                config.name,
                new StreamReadIconFiles(config.input),
                createWriteStream(filename),
                config.iconsTune,
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                }
              )
            });
            break;
          }
          case 'woff': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.woff`);

              compileWoff(
                config.name,
                new StreamReadIconFiles(config.input),
                createWriteStream(filename),
                config.iconsTune,
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                }
              )
            });
            break;
          }
          case 'woff2': {
            await new Promise<void>((resolve, reject) => {
              const filename = path.join(config.output, `${slug}.woff2`);

              compileWoff2(
                config.name,
                new StreamReadIconFiles(config.input),
                createWriteStream(filename),
                config.iconsTune,
                error => {
                  if (error) {
                    return reject(error);
                  }
                  Logger.created(filename);
                  resolve();
                }
              );
            });
            break;
          }
        }
      }

      const filenameCss = path.join(config.output, `${slug}.css`);

      await new Promise<void>((resolve, reject) => {
        compileCss(
          config,
          new StreamReadIconFiles(config.input),
          createWriteStream(filenameCss, 'utf8'),
          error => {
            if (error) {
              return reject(error);
            }
            Logger.created(filenameCss);
            resolve();
          }
        )
      })

      Logger.done(Date.now() - start);
    });

  return subprogram;
}