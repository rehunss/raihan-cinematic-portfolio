import { readFile, writeFile } from 'node:fs/promises';
import { renderPortfolio } from '../tmp/prerender/prerender.js';

const file = new URL('../dist/index.html', import.meta.url);
const html = await readFile(file, 'utf8');
const slot = '<!--portfolio-markup-->';

if (!html.includes(slot)) throw new Error('Missing prerender slot in the production HTML');
const rendered = renderPortfolio();
const preloads = rendered.match(/^(?:<link rel="preload"[^>]+\/>)+/)?.[0] || '';
const markup = rendered.slice(preloads.length);
await writeFile(file, html.replace('</head>', () => preloads + '</head>').replace(slot, () => markup));
