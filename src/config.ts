import path from 'node:path';
import { IconFontConfig } from './types.js';
import os from 'node:os';

export default {
  name: 'IconFont',
  prefix: 'icon',
  input: path.resolve(process.cwd(), 'svg-icons'),
  output: path.resolve(process.cwd(), 'dist/fonts/icon-font'),
  types: ['eot', 'woff2', 'woff', 'ttf'],
  port: 9000,
  fontUrl: './',
} as IconFontConfig;