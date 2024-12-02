import { defineConfig, UserConfig } from 'vite';
import { resolve } from 'node:path';
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
  let watch: any = undefined;
  if (mode === 'development' && command === 'build' && process.argv.some(arg => arg === '--watch' || arg === '-w')) {
    console.log('Watch')
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
      __dirname: JSON.stringify('/'),
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
          ...nodeNativeModules(),
        ],
      },
      watch,
    }
  };
});