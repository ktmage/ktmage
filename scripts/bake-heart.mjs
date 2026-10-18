import { writeFile } from 'node:fs/promises';
import { Vector3, OrthographicCamera } from 'three';
import { heartMesh } from './heart-mesh.mjs';
import { visibleEdges } from './hidden-lines.mjs';

const { points, faces } = heartMesh();
const camera = new OrthographicCamera(-1.16, 1.16, 1.13, -1.19, 0.1, 100);
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
const frameCount = 144;
const axis = new Vector3(0, 1, 0);
const coordinate = (point) => `${((point.x + 1) * 240).toFixed(2)},${((1 - point.y) * 240).toFixed(2)}`;
const frames = Array.from({ length: frameCount }, (_, i) => {
  const rotated = points.map((point) => point.clone().applyAxisAngle(axis, i * 2 * Math.PI / frameCount));
  const edges = visibleEdges(rotated, faces, camera);
  return `<path d="${edges.map(([a, b]) => `M${coordinate(a)}L${coordinate(b)}`).join('')}" fill="none" stroke="#e00029" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
});
const asset = {
  source: 'User-provided polygon-heart reference, 2026-10-18',
  licenseUrl: '',
  copyright: 'Topology adapted from the user-provided reference; added depth, Y-axis rotation and hidden-line removal.',
  width: 480, height: 480, duration: 6, triangles: faces.length, vertices: points.length, frameCount, frames,
};
await writeFile(new URL('../assets/heart.json', import.meta.url), JSON.stringify(asset));
console.log(JSON.stringify({ frames: frameCount, triangles: asset.triangles, vertices: asset.vertices, bytes: JSON.stringify(asset).length }));
