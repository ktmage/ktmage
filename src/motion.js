export function validateMotion(value) {
  const ranges = { normalPeriod: [4, 20], burstDuration: [.5, 6], burstTurns: [1, 6], intervalTurns: [1, 3] };
  const result = {};
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const number = value?.[key];
    if (typeof number !== 'number' || !Number.isFinite(number) || number < min || number > max
      || (key.endsWith('Turns') && !Number.isInteger(number))) throw new Error('調整値が範囲外です');
    result[key] = number;
  }
  const easeDuration = value.easeDuration ?? result.burstDuration / 4;
  if (!Number.isFinite(easeDuration) || easeDuration < .1 || easeDuration > result.burstDuration / 2
    || result.burstDuration > result.normalPeriod * result.intervalTurns - .5) throw new Error('加減速の長さが範囲外です');
  return { ...result, easeDuration };
}

export function burstProgress(progress, ramp = .25) {
  const t = Math.max(0, Math.min(1, progress));
  if (t > 1 - ramp) return 1 - burstProgress(1 - t, ramp);
  if (t >= ramp) return (t - ramp / 2) / (1 - ramp);
  const phase = t / ramp;
  return ramp / 2 * (phase - Math.sin(Math.PI * phase) / Math.PI) / (1 - ramp);
}

export function motionTimeline(value, frameCount) {
  const settings = validateMotion(value);
  const period = settings.normalPeriod * settings.intervalTurns;
  const duration = period * 2;
  const burstStart = (period - settings.burstDuration) * .8;
  function turnsAt(seconds) {
    return seconds / settings.normalPeriod + [burstStart, burstStart + period].reduce((turns, start) => {
      const progress = Math.max(0, Math.min(1, (seconds - start) / settings.burstDuration));
      return turns + settings.burstTurns * burstProgress(progress, settings.easeDuration / settings.burstDuration);
    }, 0);
  }
  const totalTurns = (settings.intervalTurns + settings.burstTurns) * 2;
  const frameWindows = Array.from({ length: frameCount }, () => []);
  let previous = 0;
  for (let step = 1; step <= frameCount * totalTurns; step++) {
    let low = previous;
    let high = duration;
    for (let iteration = 0; iteration < 36; iteration++) {
      const middle = (low + high) / 2;
      if (turnsAt(middle) < step / frameCount) low = middle;
      else high = middle;
    }
    const end = step === frameCount * totalTurns ? duration : (low + high) / 2;
    frameWindows[(step - 1) % frameCount].push([previous, end]);
    previous = end;
  }
  return { duration, burstStart, period, frameWindows };
}
