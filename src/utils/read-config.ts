import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import { IconFontConfig } from '../types.js';
import defaultConfig from '../config.js';

const seeker = cosmiconfig(__APP_NAME__, {
  searchStrategy: 'project',
});

export async function readConfig(path?: string): Promise<Required<IconFontConfig>> {
  let result: CosmiconfigResult | null = null;
  if (path) {
    try {
      result = await seeker.load(path);
    } catch {
      console.warn(`Config file ${path} not found.`);
    }
  }

  if (!result) {
    try {
      result = await seeker.search(process.cwd());
    } catch {
      console.warn(`Config file not found, default config will be used.`);
    }
  }
  return { ...defaultConfig, ...(result?.config?.default || result?.config || {}) };
}