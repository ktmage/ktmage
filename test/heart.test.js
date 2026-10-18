import test from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera, Vector3 } from 'three';
import { XMLValidator } from 'fast-xml-parser';
import { heartMesh } from '../scripts/heart-mesh.mjs';
import { visibleEdges } from '../scripts/hidden-lines.mjs';
import { readFile } from 'node:fs/promises';

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

test('公開 SVG を小さな透明のハートだけにし、低減モーションに対応する', async () => {
  const svg = await readFile(new URL('../assets/profile.svg', import.meta.url), 'utf8');
  assert.match(svg, /width="240" height="240"/);
  assert.equal(XMLValidator.validate(svg), true);
  assert.doesNotMatch(svg, /<(rect|image|foreignObject|script|text)\b|fill="(?!none")/);
  assert.match(svg, /prefers-reduced-motion:reduce/);
});
