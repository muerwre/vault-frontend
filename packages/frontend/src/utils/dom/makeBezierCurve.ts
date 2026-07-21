// size of the tangent
const t = 1 / 5;

export interface PathPoint {
  x: number;
  y: number;
}

const controlPoints = (p: PathPoint[]) => {
  const pc: PathPoint[][] = [];

  for (let i = 1; i < p.length - 1; i++) {
    const dx = p[i - 1].x - p[i + 1].x; // difference x
    const dy = p[i - 1].y - p[i + 1].y; // difference y

    // the first control point
    const x1 = p[i].x - dx * t;
    const y1 = p[i].y - dy * t;
    const o1 = {
      x: x1,
      y: y1,
    };

    // the second control point
    const x2 = p[i].x + dx * t;
    const y2 = p[i].y + dy * t;
    const o2 = {
      x: x2,
      y: y2,
    };

    // building the control points array
    pc[i] = [];
    pc[i].push(o1);
    pc[i].push(o2);
  }

  return pc;
};

export const makeBezierCurve = (p: PathPoint[]) => {
  const pc = controlPoints(p); // the control points array

  let d = `M${p[0].x},${p[0].y} Q${pc[1][1].x},${pc[1][1].y}, ${p[1].x},${p[1].y}`;

  if (p.length > 2) {
    // central curves are cubic Bezier
    for (let i = 1; i < p.length - 2; i++) {
      d += `C${pc[i][0].x}, ${pc[i][0].y}, ${pc[i + 1][1].x}, ${pc[i + 1][1].y}, ${p[i + 1].x},${
        p[i + 1].y
      }`;
    }

    // the first & the last curve are quadratic Bezier
    const n = p.length - 1;
    d += `Q${pc[n - 1][0].x}, ${pc[n - 1][0].y}, ${p[n].x}, ${p[n].y}`;
  }

  return d;
};
