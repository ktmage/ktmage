import { Vector3 } from 'three';

const outline = [
  [0, .565], [.24, .77], [.575, .84], [.92, .64],
  [1, .225], [.815, -.23], [.46, -.61], [0, -.9],
  [-.46, -.61], [-.815, -.23], [-1, .225], [-.92, .64],
  [-.575, .84], [-.24, .77],
];
const inner = [
  [-.36, .515, .38], [.36, .515, .38], [0, .405, .32],
  [0, 0, .48], [-.61, 0, .26], [.61, 0, .26], [0, -.55, .30],
];
const [upperLeft, upperRight, upperMiddle, middle, lowerLeft, lowerRight, bottomMiddle] = inner.map((_, i) => outline.length + i);
const front = [
  [13, 0, upperLeft], [12, 13, upperLeft], [11, 12, upperLeft],
  [10, 11, upperLeft], [10, upperLeft, lowerLeft],
  [upperLeft, 0, upperMiddle], [upperLeft, upperMiddle, middle],
  [upperLeft, middle, lowerLeft], [10, lowerLeft, 9],
  [lowerLeft, 8, 9], [lowerLeft, bottomMiddle, 8],
  [lowerLeft, middle, bottomMiddle], [8, bottomMiddle, 7],
  [1, upperRight, 0], [2, upperRight, 1], [3, upperRight, 2],
  [4, upperRight, 3], [4, lowerRight, upperRight],
  [upperRight, upperMiddle, 0], [upperRight, middle, upperMiddle],
  [upperRight, lowerRight, middle], [4, 5, lowerRight],
  [lowerRight, 5, 6], [lowerRight, 6, bottomMiddle],
  [lowerRight, bottomMiddle, middle], [6, 7, bottomMiddle],
];

export function heartMesh() {
  const points = [...outline.map(([x, y]) => new Vector3(x, y, 0)), ...inner.map(([x, y, z]) => new Vector3(x, y, z))];
  const frontFaces = front.map((face) => {
    const [a, b, c] = face.map((i) => points[i]);
    return b.clone().sub(a).cross(c.clone().sub(a)).z > 0 ? face : [...face].reverse();
  });
  points.push(...inner.map(([x, y, z]) => new Vector3(x, y, -z)));
  const backFaces = frontFaces.map((face) => face.map((i) => i < outline.length ? i : i + inner.length).reverse());
  return { points, faces: [...frontFaces, ...backFaces] };
}
