import { defineConfig, UserConfig } from 'vite';
import { resolve, relative } from 'node:path';
import pkg from './package.json';

function nodeNativeModules(): string[] {
  const moduleLoadList = (process as any).moduleLoadList as string[];
  const nodeExternals: string[] = [];
  for (const mod of moduleLoadList) {
    if (mod.startsWith('NativeModule') && !mod.includes('internal')) {
      const modName = mod.split('NativeModule')[1].trim();
      if (!modName.startsWith('_')) {
        nodeExternals.push('node:' + modName);
      }
    }
  }

  return nodeExternals;
}

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  const appName = pkg.name.split('/')[1];
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
      __APP_NAME__: JSON.stringify(appName),
      __APP_DESCRIPTION__: JSON.stringify(pkg.description),
      __dirname: JSON.stringify('/'),
    },
    resolve: {
      alias: {
        os: 'node:os',
        path: 'node:path',
        fs: 'node:fs',
        util: 'node:util',
        module: 'node:module',
        url: 'node:url',
        stream: 'node:stream',
      }
    },
    publicDir: 'assets',
    esbuild: {
        legalComments: 'none',
        platform: 'node',
        target: ['node20'],
    },
    server: {
      host: false,
    },
    build: {
      minify: mode === 'production',
      watch,
      outDir: './lib',
      sourcemap: true,
      lib: {
        formats: ['cjs', 'es'],
        name: appName,
        entry: {
          index: resolve(__dirname, './src/index.ts'),
          'cli/index': resolve(__dirname, './src/cli/index.ts'),
        },
      },
      rollupOptions: {
        output: {
          compact: true,
          // chunkFileNames: '[name].[format].js',
          manualChunks: (id) => {
            id = id.replace(__dirname + '/', '')
            if (!/^src/.test(id)) {
              return 'vendor';
            }
            if (/^src\/cli/.test(id)) {
              return 'cli/index';
            }

            return 'index';
          }
        },
        external: [
          ...nodeNativeModules(),
          'typescript',
          'string_decoder',
          'stream',
        ],
      },
    },
    plugins: []
  };
});