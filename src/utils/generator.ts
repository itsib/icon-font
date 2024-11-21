import path from 'node:path';
import fs from 'node:fs/promises';
import svgtofont from 'svgtofont';
import handlebars from 'handlebars';
import { IconFontConfig, IconInfo } from '../types.js';
import url from 'node:url';
import { slugify } from './slugify.js';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const tmplPath = path.resolve(dirname, 'tmpl');
const wwwPath = path.resolve(dirname, 'www');

export async function generator(config: Required<IconFontConfig>) {
  await fs.mkdir(config.output, { recursive: true });

  // Generate fonts and copy static in to the tmp path.
  await generateIcons(config.name, config.input, config.tmp);
  await copyStatic(config.tmp);

  // Get new icons list
  const icons = await readIconsList(config.tmp);

  // Generate project style index html files into tmp
  await generateStyleCss(config.name, icons, config.types, config.tmp);
  await generateIndexHtml(config.name, icons, config.tmp);

  const fontSlug = slugify(config.name);
  for (const ext of config.types) {
    const fontFileName = `${fontSlug}.${ext}`;
    await fs.cp(path.join(config.tmp, fontFileName), path.join(config.output, fontFileName));
  }

  await fs.cp(path.join(config.tmp, 'style.css'), path.join(config.output, fontSlug + '.css'));
}

async function readIconsList(tmpPath: string): Promise<IconInfo[]> {
  const content = await fs.readFile(path.join(tmpPath, 'info.json'), 'utf8');
  const iconMap = JSON.parse(content) as Record<string, IconInfo>;
  return Object.values(iconMap);
}

async function copyStatic(dist: string) {
  const files = await fs.readdir(wwwPath, { encoding: 'utf8' });

  for (const file of files) {
    await fs.cp(path.join(wwwPath, file), path.join(dist, file));
  }
}

async function generateIcons(fontName: string, src: string, dist: string): Promise<void> {
  const fontSlug = slugify(fontName);

  await svgtofont({
    classNamePrefix: 'icon',
    fontName: fontSlug,
    src,
    dist,
    log: false,
    logger(message: string) {
      const [_, ...segments] = message.split('/');
      const filename = '/' + segments.join('/');

      console.log('\x1b[0;92m✔\x1b[0m \x1b[0;37mCreated %s\x1b[0m', filename);
    },
    excludeFormat: ['symbol.svg'],
    outSVGReact: false,
    outSVGReactNative: false,
    outSVGPath: false,
    generateInfoData: true,
    emptyDist: true,
    css: false,
    svgicons2svgfont: {
      fontHeight: 512,
      normalize: true
    }
  });
}

async function generateIndexHtml(fontName: string, icons: IconInfo[], dist: string) {
  const template = handlebars.compile(
    await fs.readFile(path.join(tmplPath, 'index.html.hbs'), 'utf8')
  );

  const content = template({ fontName, icons });

  await fs.writeFile(path.join(dist, 'index.html'), content, 'utf8');
}

async function generateStyleCss(fontName: string, icons: IconInfo[], types: string[], dist: string) {
  const fontSlug = slugify(fontName);

  handlebars.registerHelper('fontUrl', function fontUrlHelper(type: string) {
    let output = '';
    switch (type) {
      case 'eot':
        output = `url("${fontSlug}.${type}#iefix") format("embedded-opentype")`;
        break;
      case 'woff2':
        output = `url("${fontSlug}.${type}") format("woff2")`;
        break;
      case 'woff':
        output = `url("${fontSlug}.${type}") format("woff")`;
        break;
      case 'ttf':
        output = `url("${fontSlug}.${type}") format("truetype")`;
        break;
      case 'svg':
        output = `url("${fontSlug}.${type}#${fontSlug}") format("svg")`;
        break;
    }
    return new handlebars.SafeString(output);
  });

  const templateFile = await fs.readFile(path.join(tmplPath, 'style.css.hbs'), 'utf8');
  const template = handlebars.compile(templateFile);

  const content = template({ fontName, icons, types });

  await fs.writeFile(path.join(dist, 'style.css'), content, 'utf8');
}