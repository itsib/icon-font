import { IconFontConfig } from './types.js';

export const DEFAULT_CONFIG: Omit<IconFontConfig, 'input' | 'output'> = {
  name: 'IconFont',
  prefix: 'icon',
  types: ['eot', 'woff2', 'woff', 'ttf'],
  port: 9000,
  fontUrl: './',
}