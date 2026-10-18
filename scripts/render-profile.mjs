import { writeFile } from 'node:fs/promises';
import { renderHeart } from '../src/heart-svg.js';

await writeFile(new URL('../assets/profile.svg', import.meta.url), renderHeart());
console.log('Profile SVG generated');
