import { AppConfig } from './types/app-config.ts';

export const DEFAULT_CONFIG: Omit<AppConfig, 'input' | 'output'> = {
  name: 'IconFont',
  prefix: 'icon',
  types: [ 'woff2', 'woff', 'ttf', 'eot'],
  port: 9001,
  fontUrl: './',
}