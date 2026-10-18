import { motionTimeline } from './motion.js';
import { sculptureAsset, sculptureCss, renderSculpture } from './sculpture.js';

export function renderHeart(settings) {
  const asset = sculptureAsset('heart');
  const motion = motionTimeline(settings, asset.frameCount);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 ${asset.width} ${asset.height}" role="img" aria-labelledby="heart-title heart-description"><title id="heart-title">回転するポリゴンハート</title><desc id="heart-description">赤からピンクの三角形で構成した立体ハート。普段は穏やかに回転し、${motion.duration}秒の中で2回、約${settings.burstDuration}秒ずつくるくると速く回ります。周囲は透明です。</desc><style>${sculptureCss('heart', motion)}</style>${renderSculpture('heart', 0, 0)}</svg>`;
}
