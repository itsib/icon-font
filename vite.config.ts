import { defineConfig, UserConfig } from 'vite';
import { resolve } from 'node:path';
import pkg from './package.json';

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  let watch: any = undefined;
  if (mode === 'development' && command === 'build' && process.argv.some(arg => arg === '--watch' || arg === '-w')) {
    watch = {
      skipWrite: false,
      include: [
        './src/**/*',
        './assets/tmpl/*',
      ],
    };
  }

  return {
    appType: 'custom',
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __APP_NAME__: JSON.stringify(pkg.name),
      __APP_DESCRIPTION__: JSON.stringify(pkg.description),
    },
    publicDir: 'assets',
    esbuild: {
      platform: 'node',
      target: ['node20'],
    },
    server: {
      host: false,
    },
    build: {
      sourcemap: true,
      lib: {
        formats: ['es'],
        name: 'icon-font',
        fileName: 'index',
        entry: resolve(__dirname, './src/index.ts'),
      },
      outDir: './lib',
      rollupOptions: {
        external: [
          ...Object.keys(pkg.dependencies),
          'node:path',
          'node:url',
          'node:os',
          'node:fs',
          'node:http',
          'node:fs/promises',
        ],
      },
      watch: { ...watch },
    }
  };
});