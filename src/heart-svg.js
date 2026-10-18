import { sculptureAsset, sculptureCss, renderSculpture } from './sculpture.js';

function renderStats(stats) {
  return `<g fill="#fff" text-anchor="middle" font-family="'Courier New',monospace">${['stars', 'contributions'].map((name, index) => {
    const value = stats[name];
    const label = Number.isSafeInteger(value) && value >= 0 ? value.toLocaleString('en-US') : '—';
    const x = 156 + index * 168;
    const size = Math.min(34, 210 / label.length);
    return `<g><title>${name}: ${label}</title><rect x="${x - (label.length * size * .6 + 12) / 2}" y="324" width="${label.length * size * .6 + 12}" height="39" fill="#000"/><text x="${x}" y="355" font-size="${size}" font-weight="400">${label}</text><rect x="${x - (name.length * 7.2 + 12) / 2}" y="365" width="${name.length * 7.2 + 12}" height="18" fill="#000"/><text x="${x}" y="378" font-size="12">${name}</text></g>`;
  }).join('')}</g>`;
}

export function renderHeart(stats) {
  const asset = sculptureAsset('heart');
  const description = stats ? '既存のプロフィール集計によるスター数と全期間のコントリビューション数。白文字の背面だけ黒く塗っています。取得できない値は — と表示します。' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${asset.width}" height="${asset.height}" viewBox="0 0 ${asset.width} ${asset.height}" role="img" aria-labelledby="heart-title heart-description"><title id="heart-title">回転するポリゴンハート</title><desc id="heart-description">赤い輪郭線で描いた立体ハート。背景と面は透明です。6秒で一周します。${description}</desc><style>${sculptureCss('heart')}</style>${renderSculpture('heart', 0, 0)}${stats ? renderStats(stats) : ''}</svg>`;
}
