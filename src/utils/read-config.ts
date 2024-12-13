import { cosmiconfig } from 'cosmiconfig';
import { Logger } from './logger.ts';
import { AppConfig, AppConfigKeys } from '../types/app-config.ts';

const FIELDS: AppConfigKeys[] = ['input', 'output', 'name', 'fontUrl', 'prefix', 'types', 'port'];

const Seeker = cosmiconfig(__APP_NAME__, {
  searchStrategy: 'project',
});

export async function searchConfig(cwd: string): Promise<Partial<AppConfig | undefined>> {
  try {
    const result = await Seeker.search(cwd);
    return result?.config || result?.config?.default;
  } catch(error: any) {
    Logger.warn(`Config file not found, default config will be used.`);
    return undefined;
  }
}

export async function loadConfig(path: string): Promise<Partial<AppConfig | undefined>> {
  try {
    const result = await Seeker.load(path);
    return !result?.isEmpty && result?.config ? result?.config?.default : undefined;
  } catch {
    Logger.warn(`Config file ${path} not found.`);
    return undefined;
  }
}

export function mergeConfig(required: AppConfigKeys[], ...configs: Partial<AppConfig | undefined>[]): Required<AppConfig> {
  const result: Partial<AppConfig> = {};

  for (const key of required) {
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];

      if (config && config[key] != null) {
        result[key] = config![key] as any;
      }
    }
    if (result[key] == null && required.indexOf(key) >= 0) {
      throw new TypeError(`no config property ${key} found.`);
    }
  }

  return result as Required<AppConfig>;
}