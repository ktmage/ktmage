import heart from '../assets/heart.json' with { type: 'json' };

const sculptures = { heart };

export function sculptureAsset(name) {
  return sculptures[name];
}

export function sculptureCss(name) {
  const asset = sculptures[name];
  return `
.pose{visibility:hidden;animation:sculpture ${asset.duration}s steps(1,end) infinite}
@keyframes sculpture{0%{visibility:visible}${100 / asset.frameCount}%{visibility:hidden}100%{visibility:hidden}}
@media(prefers-reduced-motion:reduce){.pose{animation:none;visibility:hidden}.pose:first-child{visibility:visible}}
`;
}

export function renderSculpture(name, x, y, scale = 1) {
  const asset = sculptures[name];
  const frames = asset.frames.map((frame, i) => `<g class="pose" style="animation-delay:${(-asset.duration + i * asset.duration / asset.frameCount).toFixed(6)}s">${frame}</g>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${scale})" stroke-width=".55" stroke-linejoin="round" aria-hidden="true">${frames}</g>`;
}
