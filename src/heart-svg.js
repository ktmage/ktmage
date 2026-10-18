import { sculptureAsset, sculptureCss, renderSculpture } from './sculpture.js';

export function renderHeart() {
  const asset = sculptureAsset('heart');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 ${asset.width} ${asset.height}" role="img" aria-labelledby="heart-title heart-description"><title id="heart-title">回転するポリゴンハート</title><desc id="heart-description">赤からピンクの三角形で構成した立体ハート。周囲は透明です。6秒で一周します。</desc><style>${sculptureCss('heart')}</style>${renderSculpture('heart', 0, 0)}</svg>`;
}
