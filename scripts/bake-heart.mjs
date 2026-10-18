import { writeFile } from 'node:fs/promises';
import { Color, Vector3, OrthographicCamera } from 'three';
import { heartMesh } from './heart-mesh.mjs';
import { visibleEdges } from './hidden-lines.mjs';

const { points, faces } = heartMesh();
const camera = new OrthographicCamera(-1.16, 1.16, 1.13, -1.19, 0.1, 100);
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
const frameCount = 144;
const axis = new Vector3(0, 1, 0);
const light = new Vector3(-.4, .7, 1).normalize();
const palette = ['#e94b63', '#e5455c', '#df3953', '#ed566b', '#dc344f', '#e3415b', '#f06073'];
const coordinate = (point) => `${((point.x + 1) * 240).toFixed(2)},${((1 - point.y) * 240).toFixed(2)}`;
const frames = Array.from({ length: frameCount }, (_, i) => {
  const rotated = points.map((point) => point.clone().applyAxisAngle(axis, i * 2 * Math.PI / frameCount));
  const facets = faces.map((face, index) => {
    const vertices = face.map((vertex) => rotated[vertex]);
    const [a, b, c] = vertices;
    const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    if (normal.z <= 1e-7) return null;
    const color = new Color(palette[(index * 11 + Math.floor(index / 3)) % palette.length]);
    color.multiplyScalar(.78 + .22 * Math.max(0, normal.dot(light)));
    const fill = `#${color.getHexString()}`;
    return {
      depth: (a.z + b.z + c.z) / 3,
      svg: `<polygon points="${vertices.map((point) => coordinate(point.clone().project(camera))).join(' ')}" fill="${fill}" stroke="${fill}" stroke-width=".65"/>`,
    };
  }).filter(Boolean).sort((a, b) => a.depth - b.depth).map((face) => face.svg).join('');
  const edges = visibleEdges(rotated, faces, camera);
  return `${facets}<path d="${edges.map(([a, b]) => `M${coordinate(a)}L${coordinate(b)}`).join('')}" fill="none" stroke="#a92843" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;
});
const asset = {
  source: 'User-provided polygon-heart reference, 2026-10-18',
  licenseUrl: '',
  copyright: 'Topology adapted from the user-provided reference; added depth, Y-axis rotation, flat face colors and hidden-line removal.',
  width: 480, height: 480, duration: 6, triangles: faces.length, vertices: points.length, frameCount, frames,
};
await writeFile(new URL('../assets/heart.json', import.meta.url), JSON.stringify(asset));
console.log(JSON.stringify({ frames: frameCount, triangles: asset.triangles, vertices: asset.vertices, bytes: JSON.stringify(asset).length }));
