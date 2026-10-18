import test from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera, Vector3 } from 'three';
import { XMLValidator } from 'fast-xml-parser';
import { heartMesh } from '../scripts/heart-mesh.mjs';
import { visibleEdges } from '../scripts/hidden-lines.mjs';
import { renderHeart } from '../src/heart-svg.js';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const camera = new OrthographicCamera(-2, 2, 2, -2, .1, 100);
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();

test('ハートの各辺を二つの面で共有し、穴と退化した三角形を作らない', () => {
  const { points, faces } = heartMesh();
  assert.equal(points.length, 28);
  assert.equal(faces.length, 52);
  const counts = new Map();
  for (const face of faces) {
    const [a, b, c] = face.map((i) => points[i]);
    assert.ok(b.clone().sub(a).cross(c.clone().sub(a)).length() > 1e-6);
    for (let i = 0; i < 3; i++) {
      const key = [face[i], face[(i + 1) % 3]].sort((a, b) => a - b).join(',');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  assert.ok([...counts.values()].every((count) => count === 2));
});

test('共有辺は一度だけ描き、手前の面に隠れる線を取り除く', () => {
  const square = [new Vector3(-1, -1, 0), new Vector3(1, -1, 0), new Vector3(1, 1, 0), new Vector3(-1, 1, 0)];
  assert.equal(visibleEdges(square, [[0, 1, 2], [0, 2, 3]], camera).length, 5);
  const triangle = square.slice(0, 3);
  const overlapping = [...triangle, ...triangle.map((point) => point.clone().add(new Vector3(0, 0, 1)))];
  assert.equal(visibleEdges(overlapping, [[0, 1, 2], [3, 4, 5]], camera).length, 3);
});

test('ハートの背景・面の塗りを透明にし、低減モーションに対応する', () => {
  const svg = renderHeart();
  assert.equal(XMLValidator.validate(svg), true);
  assert.doesNotMatch(svg, /<(rect|image|foreignObject|script|text)\b|fill="(?!none")/);
  assert.match(svg, /prefers-reduced-motion:reduce/);
});

test('統計は白文字と文字幅の黒背景だけで描画し、外部取得を含めない', () => {
  const svg = renderHeart({ stars: 0, contributions: 7592 });
  assert.equal(XMLValidator.validate(svg), true);
  assert.match(svg, /stars: 0/);
  assert.match(svg, /contributions: 7,592/);
  assert.doesNotMatch(svg, /views|<script|<image|<foreignObject|url\(/);
  assert.equal([...svg.matchAll(/<rect\b/g)].length, 4);
  assert.match(svg, /fill="#fff"/);
  assert.match(svg, /fill="#000"/);
});

test('未取得や不正な統計で公開用 SVG を上書きしない', async () => {
  const file = new URL('../assets/profile.svg', import.meta.url);
  const before = await readFile(file, 'utf8');
  const env = { ...process.env };
  delete env.STARS_TOTAL;
  delete env.TOTAL_CONTRIBUTIONS;
  for (const stats of [{}, { STARS_TOTAL: '5', TOTAL_CONTRIBUTIONS: 'null' }]) {
    const result = spawnSync(process.execPath, ['scripts/render-profile.mjs'], { env: { ...env, ...stats } });
    assert.notEqual(result.status, 0);
    assert.equal(await readFile(file, 'utf8'), before);
  }
});
