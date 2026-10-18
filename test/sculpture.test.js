import test from 'node:test';
import assert from 'node:assert/strict';
import heart from '../assets/heart.json' with { type: 'json' };

for (const [name, asset, count] of [['回転', heart, 144]]) test(`${name}の各姿勢を投影領域内に収め、同じ静止画の繰り返しにしない`, () => {
  assert.equal(asset.frames.length, count);
  assert.ok(new Set(asset.frames).size > 4);
  for (const frame of asset.frames) {
    assert.doesNotMatch(frame, /NaN|Infinity/);
    const points = [...frame.matchAll(/([\d.]+),([\d.]+)/g)];
    assert.ok(points.length > 20);
    for (const [, x, y] of points) {
      assert.ok(+x >= 0 && +x <= asset.width);
      assert.ok(+y >= 0 && +y <= asset.height);
    }
  }
  assert.ok(JSON.stringify(asset).length < 1_500_000);
});
