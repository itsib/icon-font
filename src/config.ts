import path from 'node:path';
import { IconFontConfig } from './types.js';
import os from 'node:os';

export default {
  name: 'IconFont',
  input: path.resolve(process.cwd(), 'svg-icons'),
  output: path.resolve(process.cwd(), 'dist/fonts/icon-font'),
  tmp: path.join(os.tmpdir(), __APP_NAME__),
  types: ['woff2', 'woff', 'ttf', 'eot'],
} as IconFontConfig;