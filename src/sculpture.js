import heart from '../assets/heart.json' with { type: 'json' };

const sculptures = { heart };

export function sculptureAsset(name) {
  return sculptures[name];
}

export function sculptureCss(name, motion) {
  const keyframes = motion.frameWindows.map((windows, index) => {
    const stops = windows.flatMap(([start, end]) => [
      `${(start / motion.duration * 100).toFixed(8)}%{visibility:visible}`,
      `${(end / motion.duration * 100).toFixed(8)}%{visibility:hidden}`,
    ]);
    if (windows[0][0] !== 0) stops.unshift('0%{visibility:hidden}');
    return `@keyframes sculpture-${index}{${stops.join('')}}`;
  }).join('');
  return `
.pose{visibility:hidden;animation-duration:${motion.duration}s;animation-timing-function:steps(1,end);animation-iteration-count:infinite}
${keyframes}
@media(prefers-reduced-motion:reduce){.pose{animation:none;visibility:hidden}.pose:first-child{visibility:visible}}
`;
}

export function renderSculpture(name, x, y, scale = 1) {
  const asset = sculptures[name];
  const frames = asset.frames.map((frame, i) => `<g class="pose" style="animation-name:sculpture-${i}">${frame}</g>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke-width=".55" stroke-linejoin="round" aria-hidden="true">${frames}</g>`;
}
