import { writeFile } from 'node:fs/promises';
import { renderHeart } from '../src/heart-svg.js';

function count(name) {
  const value = process.env[name];
  if (!/^\d+$/.test(value ?? '') || !Number.isSafeInteger(Number(value))) {
    throw new Error(`${name} must be a non-negative safe integer`);
  }
  return Number(value);
}

const stats = { stars: count('STARS_TOTAL'), contributions: count('TOTAL_CONTRIBUTIONS') };
await writeFile(new URL('../assets/profile.svg', import.meta.url), renderHeart(stats));
console.log(`Profile SVG: ${stats.stars} stars / ${stats.contributions} contributions`);
