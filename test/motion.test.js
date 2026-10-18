import test from 'node:test';
import assert from 'node:assert/strict';
import { motionTimeline, validateMotion, burstProgress } from '../src/motion.js';

const settings = { normalPeriod: 7.5, burstDuration: 2, burstTurns: 3, intervalTurns: 1 };

test('15秒の中で通常回転と短い加速を2セットつなぐ', () => {
  const motion = motionTimeline(settings, 144);
  const windows = motion.frameWindows.flat().sort((a, b) => a[0] - b[0]);
  assert.equal(motion.duration, 15);
  assert.equal(windows.length, 144 * 8);
  assert.equal(windows[0][0], 0);
  assert.equal(windows.at(-1)[1], 15);
  for (let i = 0; i < windows.length; i++) {
    assert.ok(windows[i][1] > windows[i][0]);
    if (i) assert.equal(windows[i - 1][1], windows[i][0]);
  }
  assert.ok(Math.abs(windows[0][1] - 7.5 / 144) < 1e-8);
  const fast = windows.filter(([start, end]) => end - start < .02);
  assert.ok(fast.some(([start]) => start > 4.4 && start < 6.4));
  assert.ok(fast.some(([start]) => start > 11.9 && start < 13.9));
  assert.ok(fast.every(([start]) => (start > 4.4 && start < 6.4) || (start > 11.9 && start < 13.9)));
});

test('間隔を広げてもループの回転角度をつなぐ', () => {
  const motion = motionTimeline({ ...settings, normalPeriod: 10, intervalTurns: 3, burstTurns: 2 }, 144);
  assert.equal(motion.duration, 60);
  assert.equal(motion.frameWindows.flat().length, 144 * 10);
  assert.equal(motion.frameWindows.at(-1).at(-1)[1], 60);
});

test('無効な調整値を保存に渡さない', () => {
  for (const invalid of [null, { ...settings, normalPeriod: NaN }, { ...settings, burstTurns: 1.5 }, { ...settings, burstDuration: 0 }]) {
    assert.throws(() => validateMotion(invalid));
  }
});


test('加速と減速の速さを中央から左右対称にする', () => {
  const delta = 1e-5;
  const speed = t => (burstProgress(t + delta) - burstProgress(t - delta)) / (2 * delta);
  for (const t of [.02, .05, .1, .15, .2, .25, .4]) {
    assert.ok(Math.abs(burstProgress(t) + burstProgress(1 - t) - 1) < 1e-12);
    assert.ok(Math.abs(speed(t) - speed(1 - t)) < 1e-8);
  }
  assert.ok(speed(.05) < speed(.15));
  assert.ok(speed(.15) < speed(.25));
  assert.ok(Math.abs(speed(.3) - speed(.7)) < 1e-8);
  assert.ok(Math.abs(burstProgress(.75) - burstProgress(.25) - 2 / 3) < 1e-12);
  assert.equal(burstProgress(0), 0);
  assert.equal(burstProgress(1), 1);
});


test('確定した45秒ループで加速と減速をそれぞれ1.5秒に揃える', () => {
  const selected = { normalPeriod: 7.5, burstDuration: 3, burstTurns: 3, intervalTurns: 3, easeDuration: 1.5 };
  const motion = motionTimeline(selected, 144);
  assert.equal(motion.duration, 45);
  assert.equal(motion.period, 22.5);
  assert.equal(motion.frameWindows.flat().length, 144 * 12);
  for (const t of [.05, .1, .2, .3, .4]) {
    const delta = 1e-5;
    const speed = position => (burstProgress(position + delta, .5) - burstProgress(position - delta, .5)) / (2 * delta);
    assert.ok(Math.abs(speed(t) - speed(1 - t)) < 1e-8);
  }
});
