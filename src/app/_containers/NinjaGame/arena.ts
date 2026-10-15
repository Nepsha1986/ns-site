// Arena layout and grid helpers (pathfinding, walkability, line of sight).
//   .  grass       R  rock        W  stone wall
//   T  sakura tree L  stone lantern ~ water (flyers can cross it)
const LAYOUT = [
  '................',
  '..T......R...T..',
  '.....WWW........',
  '.R.........T.~~.',
  '...T.........~~.',
  '..WW....R.......',
  '..W.....L....R..',
  '......~~........',
  '..R...~~...WW...',
  '...........W..T.',
  '.T...L..........',
  '.......R...~~...',
  '..WWW.....T~....',
  '....T...........',
  '.R.......WW...R.',
  '................',
];

export type TileKind = 'grass' | 'rock' | 'wall' | 'tree' | 'lantern' | 'water';

const CHAR_TO_TILE: Record<string, TileKind> = {
  '.': 'grass',
  R: 'rock',
  W: 'wall',
  T: 'tree',
  L: 'lantern',
  '~': 'water',
};

export const ARENA_SIZE = LAYOUT.length;

export const tiles: TileKind[][] = LAYOUT.map((row) =>
  row.split('').map((c) => CHAR_TO_TILE[c] ?? 'grass'),
);

export interface Point {
  x: number;
  y: number;
}

export const isInside = (cx: number, cy: number) =>
  cx >= 0 && cy >= 0 && cx < ARENA_SIZE && cy < ARENA_SIZE;

export const isWalkableTile = (cx: number, cy: number) =>
  isInside(cx, cy) && tiles[cy][cx] === 'grass';

export const isWalkablePoint = (x: number, y: number) =>
  isWalkableTile(Math.floor(x), Math.floor(y));

/** Checks that a circle of radius `r` moving from a to b never touches a blocked tile. */
export const hasLineOfSight = (a: Point, b: Point, r = 0.3) => {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const steps = Math.max(1, Math.ceil(dist / 0.1));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;

    if (
      !isWalkablePoint(x - r, y - r) ||
      !isWalkablePoint(x + r, y - r) ||
      !isWalkablePoint(x - r, y + r) ||
      !isWalkablePoint(x + r, y + r)
    ) {
      return false;
    }
  }

  return true;
};

/** Nearest walkable tile to the given one (breadth-first search). */
export const nearestWalkableTile = (cx: number, cy: number): Point | null => {
  cx = Math.max(0, Math.min(ARENA_SIZE - 1, cx));
  cy = Math.max(0, Math.min(ARENA_SIZE - 1, cy));
  if (isWalkableTile(cx, cy)) return { x: cx, y: cy };

  const seen = new Set<number>([cy * ARENA_SIZE + cx]);
  const queue: Point[] = [{ x: cx, y: cy }];

  while (queue.length) {
    const p = queue.shift()!;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = p.x + dx;
      const ny = p.y + dy;
      const key = ny * ARENA_SIZE + nx;
      if (!isInside(nx, ny) || seen.has(key)) continue;
      if (isWalkableTile(nx, ny)) return { x: nx, y: ny };
      seen.add(key);
      queue.push({ x: nx, y: ny });
    }
  }

  return null;
};

const DIRS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

/** A* over the tile grid (8 directions, no corner cutting). Returns tile centers. */
export const findPath = (from: Point, to: Point): Point[] | null => {
  const start = { x: Math.floor(from.x), y: Math.floor(from.y) };
  const goal = nearestWalkableTile(Math.floor(to.x), Math.floor(to.y));
  if (!goal) return null;

  const n = ARENA_SIZE * ARENA_SIZE;
  const g = new Float32Array(n).fill(Infinity);
  const f = new Float32Array(n).fill(Infinity);
  const cameFrom = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);
  const open: number[] = [];

  const idx = (x: number, y: number) => y * ARENA_SIZE + x;
  const h = (x: number, y: number) => {
    const dx = Math.abs(x - goal.x);
    const dy = Math.abs(y - goal.y);
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  };

  const s = idx(start.x, start.y);
  g[s] = 0;
  f[s] = h(start.x, start.y);
  open.push(s);
  const goalIdx = idx(goal.x, goal.y);

  while (open.length) {
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      if (f[open[i]] < f[open[best]]) best = i;
    }
    const current = open.splice(best, 1)[0];

    if (current === goalIdx) {
      const path: Point[] = [];
      let c = current;
      while (c !== -1 && c !== s) {
        path.unshift({
          x: (c % ARENA_SIZE) + 0.5,
          y: Math.floor(c / ARENA_SIZE) + 0.5,
        });
        c = cameFrom[c];
      }
      return path;
    }

    closed[current] = 1;
    const cx = current % ARENA_SIZE;
    const cy = Math.floor(current / ARENA_SIZE);

    for (const [dx, dy, cost] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (!isWalkableTile(nx, ny)) continue;
      if (
        dx &&
        dy &&
        (!isWalkableTile(cx + dx, cy) || !isWalkableTile(cx, cy + dy))
      ) {
        continue;
      }
      const ni = idx(nx, ny);
      if (closed[ni]) continue;

      const tentative = g[current] + cost;
      if (tentative < g[ni]) {
        cameFrom[ni] = current;
        g[ni] = tentative;
        f[ni] = tentative + h(nx, ny);
        if (!open.includes(ni)) open.push(ni);
      }
    }
  }

  return null;
};

/** Removes waypoints that can be skipped with a straight, unobstructed walk. */
export const smoothPath = (from: Point, path: Point[], r = 0.3): Point[] => {
  const result: Point[] = [];
  let anchor = from;
  let i = 0;

  while (i < path.length) {
    let j = path.length - 1;
    while (j > i && !hasLineOfSight(anchor, path[j], r)) j--;
    result.push(path[j]);
    anchor = path[j];
    i = j + 1;
  }

  return result;
};

export const walkableTiles: Point[] = tiles.flatMap((row, y) =>
  row.flatMap((t, x) => (t === 'grass' ? [{ x, y }] : [])),
);
