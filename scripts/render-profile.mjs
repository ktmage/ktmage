import { readFile, writeFile } from 'node:fs/promises';
import { renderHeart } from '../src/heart-svg.js';

const settings = JSON.parse(await readFile(new URL('../assets/motion.json', import.meta.url), 'utf8'));
await writeFile(new URL('../assets/heart.svg', import.meta.url), renderHeart(settings));
console.log('Profile SVG generated');
