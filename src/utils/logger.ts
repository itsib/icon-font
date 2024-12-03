import path from 'node:path';

export const Logger = {
  serverListen(port: number) {
    console.log('');
    console.log(`  \x1b[1;32m${__APP_NAME__.toUpperCase()} v${__APP_VERSION__}\x1b[0m`);
    console.log(`  \x1b[0;37mDemo Server\x1b[0m http://localhost:${port}`);
    console.log('');
  },
  route(method: string, url: string) {
    console.log(`\x1b[0;33m${method}:\x1b[0m \x1b[0;37m${url}\x1b[0m`);
  },
  changes(file: string) {
    console.log(`\x1b[0;31mCHANGED:\x1b[0m \x1b[0;37m${file}\x1b[0m`);
  },
  created(file: string) {
    file = path.relative(process.cwd(), file);
    const dirname = path.dirname(file);
    const basename = path.basename(file);
    const extname = path.extname(file);

    let color: string;
    switch (extname) {
      case '.css':
        color = '\x1b[0;35m';
        break;
      default:
        color = '\x1b[0;32m';
        break;
    }

    console.log(`\x1b[0;37m${dirname}${path.sep}\x1b[0m${color}${basename}\x1b[0m`);
  },
  done(duration: number, count: number) {
    console.log(`\x1b[0;32m✓ built in ${duration}ms\x1b[0m`);
    console.log(`\x1b[0;32m✓ generated ${count} icons\x1b[0m`);
  }
};