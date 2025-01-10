import { AppConfig } from '../types';
import { readdir, readFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { Logger } from './logger.ts';

const ALLOWED_KEYS: (keyof AppConfig)[] = ['input', 'output', 'name', 'prefix', 'types', 'port', 'fontUrl', 'fontUrlHash', 'iconsTune'];

const FILENAMES = ['icon-font.json', '.iconfontrc'];

const DEFAULT: Required<Omit<AppConfig, 'input' | 'output' | 'iconsTune'>> = {
  name: 'IconFont',
  prefix: 'icon',
  types: [ 'woff2', 'woff', 'ttf', 'eot'],
  port: 9001,
  fontUrl: './',
  fontUrlHash: false,
}

async function searchConfig(cwd: string): Promise<string | null> {
  const files = await readdir(cwd, { encoding: 'utf8', withFileTypes: true });
  const filesInConfigDir: string[] = [];
  let packageJsonPath: string | null = null;

  for (let i = 0; i < files.length; i++) {
    const dirent = files[i];
    if (dirent.name === 'package.json') {
      packageJsonPath = join(dirent.parentPath, dirent.name);
    }

    if (dirent.isFile() && FILENAMES.includes(dirent.name)) {
      return join(dirent.parentPath, dirent.name);
    }

    if (dirent.isDirectory() && dirent.name.includes('config')) {
      const found = await searchConfig(join(cwd, dirent.name));
      if (found) {
        filesInConfigDir.push(found);
      }
    }
  }

  return packageJsonPath || filesInConfigDir[0] || null;
}

async function readConfig(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

async function parseConfig(content: string | null, args?: Partial<AppConfig>): Promise<AppConfig> {
  const config = { ...DEFAULT, types: [...DEFAULT.types] } as AppConfig;

  if (content) {
    try {
      let parsed = JSON.parse(content) as AppConfig;
      if ('icon-font' in parsed) {
        parsed = parsed['icon-font'] as AppConfig;
      }


      for (let i = 0; i < ALLOWED_KEYS.length; i++) {
        const key = ALLOWED_KEYS[i];
        if (!(key in parsed)) continue;

        if (key === 'port') {
          if (typeof parsed.port !== 'number') {
            Logger.warn('Field port should be a number');
            continue;
          }
          config.port = parsed.port;
        } else if (key === 'types') {
          if (typeof parsed.types !== 'object' || !Array.isArray(parsed.types) || parsed.types.some(type => typeof type !== 'string')) {
            Logger.warn('Field types should be an array of strings');
            continue;
          }
          config.types = [...parsed.types];
        } else if (key === 'iconsTune') {
          config[key] = parsed[key];
        } else {
          if (typeof parsed[key] !== 'string') {
            Logger.warn(`Field ${key} should be a string`);
            continue;
          }

          config[key] = parsed[key];
        }
      }
    } catch (error: any) {
      throw new Error(`Config content parse error.\n${error.message}`)
    }
  }

  if (args) {
    for (let i = 0; i < ALLOWED_KEYS.length; i++) {
      const key = ALLOWED_KEYS[i];
      if (!(key in args)) continue;

      if (key === 'port') {
        const port = parseInt(`${args[key]}`, 10);
        if (!port) continue;

        config[key] = port;
      } else if (key === 'types') {
        if (typeof args.types !== 'object' || !Array.isArray(args.types)) continue;

        config.types = args.types;
      } else if (key === 'iconsTune') {
        // Cannot pass iconsOptions through cmd args. Skip.
      } else {
        if (typeof args[key] !== 'string') continue;

        config[key] = args[key];
      }
    }
  }

  if (!config.input) {
    throw new Error('Input field is required');
  }

  if (!config.output) {
    throw new Error('Output field is required');
  }

  return config;
}

/**
 * Load and resolve configuration
 * @param cwd
 * @param path
 * @param args
 * Required<AppConfig>
 */
export async function loadConfig(cwd?: string, path?: string, args?: Partial<AppConfig>): Promise<AppConfig> {
  cwd = cwd || process.cwd();

  let configContent: string | null = null;
  if (path) {
    configContent = await readConfig(isAbsolute(path) ? path :  resolve(cwd, path));
    if (!configContent) {
      throw new Error(`Config file "${path}" not found`);
    }
  }

  const configFile = await searchConfig(cwd);
  if (configFile) {
    configContent = await readConfig(configFile);
  }
  return parseConfig(configContent, args);
}