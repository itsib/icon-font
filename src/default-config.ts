import { AppConfig } from './types/app-config.ts';

export const DEFAULT_CONFIG: Omit<AppConfig, 'input' | 'output'> = {
  name: 'IconFont',
  prefix: 'icon',
  types: ['ttf'],
  port: 9000,
  fontUrl: './',
}