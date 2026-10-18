import { Ray, Vector3 } from 'three';

const epsilon = 1e-7;
const cross = (a, b) => a.x * b.y - a.y * b.x;

function intersection(a, b, c, d) {
  const edge = b.clone().sub(a), side = d.clone().sub(c);
  const denominator = cross(edge, side);
  if (Math.abs(denominator) < epsilon) return null;
  const offset = c.clone().sub(a);
  const t = cross(offset, side) / denominator;
  const u = cross(offset, edge) / denominator;
  return t > epsilon && t < 1 - epsilon && u >= 0 && u <= 1 ? t : null;
}

export function visibleEdges(points, faces, camera) {
  const direction = camera.getWorldDirection(new Vector3());
  const projected = points.map((point) => point.clone().project(camera));
  const frontFaces = faces.filter(([i, j, k]) => points[j].clone().sub(points[i]).cross(points[k].clone().sub(points[i])).dot(direction) < -epsilon);
  const edges = new Map();
  for (const face of frontFaces) for (let i = 0; i < 3; i++) {
    const pair = [face[i], face[(i + 1) % 3]].sort((a, b) => a - b);
    edges.set(pair.join(','), pair);
  }
  const visible = [];
  for (const [a, b] of edges.values()) {
    const breaks = [0, 1];
    for (const face of frontFaces) for (let i = 0; i < 3; i++) {
      const t = intersection(projected[a], projected[b], projected[face[i]], projected[face[(i + 1) % 3]]);
      if (t !== null) breaks.push(t);
    }
    breaks.sort((x, y) => x - y);
    const intervals = [];
    for (let i = 1; i < breaks.length; i++) {
      const start = breaks[i - 1], end = breaks[i];
      if (end - start < epsilon) continue;
      const midpoint = points[a].clone().lerp(points[b], (start + end) / 2);
      const ray = new Ray(midpoint.clone().addScaledVector(direction, -10), direction);
      const hidden = frontFaces.some(([i, j, k]) => {
        const hit = ray.intersectTriangle(points[i], points[j], points[k], false, new Vector3());
        return hit && hit.clone().sub(midpoint).dot(direction) < -epsilon;
      });
      if (!hidden) {
        if (intervals.length && Math.abs(intervals.at(-1)[1] - start) < epsilon) intervals.at(-1)[1] = end;
        else intervals.push([start, end]);
      }
    }
    for (const [start, end] of intervals) visible.push([
      projected[a].clone().lerp(projected[b], start),
      projected[a].clone().lerp(projected[b], end),
    ]);
  }
  return visible;
}
