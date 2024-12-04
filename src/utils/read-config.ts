import { cosmiconfig } from 'cosmiconfig';
import { ConfigKeys, IconFontConfig } from '../types.js';
import { Logger } from './logger.ts';

const FIELDS: ConfigKeys[] = ['input', 'output', 'name', 'fontUrl', 'prefix', 'types', 'port'];

const Seeker = cosmiconfig(__APP_NAME__, {
  searchStrategy: 'project',
});

export async function searchConfig(cwd: string): Promise<Partial<IconFontConfig | undefined>> {
  try {
    const result = await Seeker.search(cwd);
    return !result?.isEmpty && result?.config ? result?.config?.default : undefined;
  } catch(error: any) {
    Logger.warn(`Config file not found, default config will be used.`);
    return undefined;
  }
}

export async function loadConfig(path: string): Promise<Partial<IconFontConfig | undefined>> {
  try {
    const result = await Seeker.load(path);
    return !result?.isEmpty && result?.config ? result?.config?.default : undefined;
  } catch {
    Logger.warn(`Config file ${path} not found.`);
    return undefined;
  }
}

export function mergeConfig(required: ConfigKeys[], ..._configs: Partial<IconFontConfig | undefined>[]): Required<IconFontConfig> {
  const configs = [..._configs].reverse();
  const result: Partial<IconFontConfig> = {};

  for (const key of required) {
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];

      if (config && config?.[key] != null) {
        result[key] = config![key] as any;
        break;
      }
    }
    if (result[key] == null && required.indexOf(key) >= 0) {
      throw new TypeError(`no config property ${key} found.`);
    }
  }

  return result as Required<IconFontConfig>;
}