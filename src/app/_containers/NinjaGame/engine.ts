import {
  ARENA_SIZE,
  Point,
  findPath,
  hasLineOfSight,
  isInside,
  isWalkablePoint,
  smoothPath,
  tiles,
  walkableTiles,
} from './arena';

// Isometric projection: one tile is a 64x32 diamond.
const HW = 32;
const HH = 16;
const PLATFORM_DEPTH = 26;
// Characters are drawn larger than the tile grid for readability.
const CHAR_SCALE = 1.5;

// Arena bounds in world pixels (used to fit and clamp the camera).
const WORLD_LEFT = -ARENA_SIZE * HW - 20;
const WORLD_RIGHT = ARENA_SIZE * HW + 20;
const WORLD_TOP = -90;
const WORLD_BOTTOM = ARENA_SIZE * HH * 2 + PLATFORM_DEPTH + 20;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 1.4;

const iso = (x: number, y: number, z = 0) => ({
  x: (x - y) * HW,
  y: (x + y) * HH - z,
});

export type MonsterKind = 'slime' | 'bat' | 'oni';
export type UpgradeId = 'blade' | 'speed' | 'shuriken' | 'potion';

interface MonsterSpec {
  name: string;
  hp: (wave: number) => number;
  speed: number;
  radius: number;
  damage: number;
  attackCooldown: number;
  gold: number;
  score: number;
  flying: boolean;
}

export const MONSTERS: Record<MonsterKind, MonsterSpec> = {
  slime: {
    name: 'Slime',
    hp: (w) => 3 + Math.floor(w / 2),
    speed: 1.1,
    radius: 0.32,
    damage: 1,
    attackCooldown: 1.2,
    gold: 1,
    score: 10,
    flying: false,
  },
  bat: {
    name: 'Shadow bat',
    hp: (w) => 2 + Math.floor(w / 3),
    speed: 2.3,
    radius: 0.3,
    damage: 1,
    attackCooldown: 1,
    gold: 2,
    score: 15,
    flying: true,
  },
  oni: {
    name: 'Oni',
    hp: (w) => 12 + w * 2,
    speed: 0.75,
    radius: 0.45,
    damage: 2,
    attackCooldown: 1.6,
    gold: 6,
    score: 40,
    flying: false,
  },
};

interface Monster {
  id: number;
  kind: MonsterKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  path: Point[];
  repathIn: number;
  attackCd: number;
  hitFlash: number;
  swing: number;
  facing: number;
  seed: number;
  spawnT: number;
}

interface Ninja {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  path: Point[];
  targetId: number | null;
  pendingStrike: boolean;
  repathIn: number;
  strikeCd: number;
  strikeT: number;
  hurtT: number;
  invuln: number;
  facing: number;
  walkT: number;
  moving: boolean;
  shurikenCd: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface FloatText {
  x: number;
  y: number;
  z: number;
  text: string;
  color: string;
  life: number;
  size: number;
}

interface Shuriken {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  life: number;
}

interface Slash {
  x: number;
  y: number;
  dir: number;
  life: number;
}

interface ClickMark {
  x: number;
  y: number;
  life: number;
  ok: boolean;
}

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  size: number;
}

export interface UpgradeInfo {
  id: UpgradeId;
  title: string;
  description: string;
  level: number;
  cost: number;
  maxed: boolean;
  affordable: boolean;
}

export interface HudState {
  phase: 'intro' | 'playing' | 'over';
  hp: number;
  maxHp: number;
  gold: number;
  score: number;
  best: number;
  kills: number;
  wave: number;
  monstersLeft: number;
  zoom: number;
  damage: number;
  upgrades: UpgradeInfo[];
}

const UPGRADES: Record<
  UpgradeId,
  {
    title: string;
    description: string;
    baseCost: number;
    growth: number;
    max: number;
  }
> = {
  blade: {
    title: 'Sharper blade',
    description: '+1 damage per strike',
    baseCost: 10,
    growth: 1.6,
    max: 99,
  },
  speed: {
    title: 'Light sandals',
    description: '+12% run speed',
    baseCost: 8,
    growth: 1.7,
    max: 6,
  },
  shuriken: {
    title: 'Shuriken',
    description: 'Auto-throws at the nearest monster',
    baseCost: 25,
    growth: 1.8,
    max: 8,
  },
  potion: {
    title: 'Healing tea',
    description: 'Restore 5 HP',
    baseCost: 6,
    growth: 1.25,
    max: 999,
  },
};

const BEST_KEY = 'ninja-hunt-best';
const NINJA_START = { x: 8.5, y: 9.5 };
const NINJA_RADIUS = 0.3;
const STRIKE_RANGE = 0.85;

const readBest = () => {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeBest = (value: number) => {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // storage unavailable – best score just won't persist
  }
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Deterministic per-tile variation so the floor doesn't flicker.
const tileNoise = tiles.map((row, y) =>
  row.map((_, x) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }),
);

export class NinjaGameEngine {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private lastTime = 0;
  private time = 0;
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private cssWidth = 0;
  private cssHeight = 0;
  private resizeObserver: ResizeObserver;

  // Camera: `fitScale` shows the whole arena; `zoom` multiplies it and the
  // view then follows the ninja.
  private fitScale = 1;
  private zoom = DEFAULT_ZOOM;
  private camX = 0;
  private camY = (WORLD_TOP + WORLD_BOTTOM) / 2;
  private pointers = new Map<number, Point>();
  private pinchDist = 0;

  private phase: HudState['phase'] = 'intro';
  private ninja!: Ninja;
  private monsters: Monster[] = [];
  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  private shurikens: Shuriken[] = [];
  private slashes: Slash[] = [];
  private marks: ClickMark[] = [];
  private petals: Petal[] = [];
  private spawnQueue: MonsterKind[] = [];
  private spawnIn = 0;
  private nextWaveIn = 0;
  private bannerT = 0;
  private bannerText = '';
  private nextId = 1;
  private shake = 0;

  private gold = 0;
  private score = 0;
  private best = 0;
  private kills = 0;
  private wave = 0;
  private damage = 1;
  private levels: Record<UpgradeId, number> = {
    blade: 0,
    speed: 0,
    shuriken: 0,
    potion: 0,
  };

  private hudDirty = true;

  constructor(
    private canvas: HTMLCanvasElement,
    private onHud: (hud: HudState) => void,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not supported');
    this.ctx = ctx;
    this.best = readBest();
    this.reset();

    for (let i = 0; i < 18; i++) this.petals.push(this.makePetal(true));

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    // Portrait screens show less of the arena, so start closer in.
    if (this.cssHeight > this.cssWidth) this.zoom = 2.2;
    this.updateCamera(1);

    canvas.addEventListener('pointerdown', this.handlePointer);
    canvas.addEventListener('pointermove', this.handlePointerMove);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('pointercancel', this.handlePointerUp);
    canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', this.preventDefault);
    window.addEventListener('keydown', this.handleKey);

    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('pointerdown', this.handlePointer);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('contextmenu', this.preventDefault);
    window.removeEventListener('keydown', this.handleKey);
  }

  setZoom(value: number) {
    this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
    this.hudDirty = true;
  }

  zoomBy(factor: number) {
    this.setZoom(this.zoom * factor);
  }

  start() {
    this.reset();
    this.phase = 'playing';
    this.nextWaveIn = 0.6;
    this.hudDirty = true;
  }

  buy(id: UpgradeId) {
    if (this.phase !== 'playing') return;
    const info = this.upgradeInfo(id);
    if (info.maxed || this.gold < info.cost) return;
    if (id === 'potion' && this.ninja.hp >= this.ninja.maxHp) return;

    this.gold -= info.cost;
    this.levels[id]++;

    if (id === 'blade') this.damage++;
    if (id === 'potion') {
      this.ninja.hp = Math.min(this.ninja.maxHp, this.ninja.hp + 5);
      this.addText(this.ninja.x, this.ninja.y, 65, '+5 HP', '#7dff9a', 15);
    }
    if (id === 'shuriken') this.ninja.shurikenCd = 0.3;

    this.burst(this.ninja.x, this.ninja.y, 12, '#ffd36b', 20);
    this.hudDirty = true;
  }

  // ---------------------------------------------------------------- setup

  private reset() {
    this.ninja = {
      ...NINJA_START,
      hp: 10,
      maxHp: 10,
      path: [],
      targetId: null,
      pendingStrike: false,
      repathIn: 0,
      strikeCd: 0,
      strikeT: 1,
      hurtT: 0,
      invuln: 0,
      facing: 1,
      walkT: 0,
      moving: false,
      shurikenCd: 0,
    };
    this.monsters = [];
    this.particles = [];
    this.texts = [];
    this.shurikens = [];
    this.slashes = [];
    this.marks = [];
    this.spawnQueue = [];
    this.gold = 0;
    this.score = 0;
    this.kills = 0;
    this.wave = 0;
    this.damage = 1;
    this.levels = { blade: 0, speed: 0, shuriken: 0, potion: 0 };
    this.bannerT = 0;
  }

  private upgradeInfo(id: UpgradeId): UpgradeInfo {
    const spec = UPGRADES[id];
    const level = this.levels[id];
    const cost = Math.round(spec.baseCost * Math.pow(spec.growth, level));
    const maxed = level >= spec.max;
    return {
      id,
      title: spec.title,
      description: spec.description,
      level,
      cost,
      maxed,
      affordable:
        !maxed &&
        this.gold >= cost &&
        (id !== 'potion' || this.ninja.hp < this.ninja.maxHp),
    };
  }

  private get speed() {
    return 3.4 * (1 + 0.12 * this.levels.speed);
  }

  private get shurikenInterval() {
    return 2.6 * Math.pow(0.8, this.levels.shuriken - 1);
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);

    this.fitScale = Math.min(
      rect.width / (WORLD_RIGHT - WORLD_LEFT),
      rect.height / (WORLD_BOTTOM - WORLD_TOP),
    );
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.updateCamera(1);
  }

  /** Eases the camera towards the ninja and keeps the arena in view. */
  private updateCamera(ease: number) {
    this.scale = this.fitScale * this.zoom;
    const ninja = iso(this.ninja.x, this.ninja.y, 20);
    const midX = (WORLD_LEFT + WORLD_RIGHT) / 2;
    const midY = (WORLD_TOP + WORLD_BOTTOM) / 2;
    const halfW = this.cssWidth / 2 / this.scale;
    const halfH = this.cssHeight / 2 / this.scale;

    const clamp = (v: number, min: number, max: number, mid: number) =>
      min > max ? mid : Math.max(min, Math.min(max, v));
    const tx = clamp(ninja.x, WORLD_LEFT + halfW, WORLD_RIGHT - halfW, midX);
    const ty = clamp(ninja.y, WORLD_TOP + halfH, WORLD_BOTTOM - halfH, midY);

    this.camX += (tx - this.camX) * ease;
    this.camY += (ty - this.camY) * ease;
    this.offsetX = this.cssWidth / 2 - this.camX * this.scale;
    this.offsetY = this.cssHeight / 2 - this.camY * this.scale;
  }

  private screenToWorld(px: number, py: number): Point {
    const sx = (px - this.offsetX) / this.scale / HW;
    const sy = (py - this.offsetY) / this.scale / HH;
    return { x: (sx + sy) / 2, y: (sy - sx) / 2 };
  }

  private worldToScreen(x: number, y: number, z = 0): Point {
    const p = iso(x, y, z);
    return {
      x: p.x * this.scale + this.offsetX,
      y: p.y * this.scale + this.offsetY,
    };
  }

  // ---------------------------------------------------------------- input

  private preventDefault = (e: Event) => e.preventDefault();

  private handleKey = (e: KeyboardEvent) => {
    if (e.key === '+' || e.key === '=') return this.zoomBy(1.2);
    if (e.key === '-' || e.key === '_') return this.zoomBy(1 / 1.2);
    const map: Record<string, UpgradeId> = {
      '1': 'blade',
      '2': 'speed',
      '3': 'shuriken',
      '4': 'potion',
    };
    if (map[e.key]) this.buy(map[e.key]);
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.zoomBy(Math.exp(-e.deltaY * 0.0015));
  };

  private pinchDistance() {
    const [a, b] = Array.from(this.pointers.values());
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2 && this.pinchDist > 0) {
      const d = this.pinchDistance();
      this.zoomBy(d / this.pinchDist);
      this.pinchDist = d;
    }
  };

  private handlePointerUp = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinchDist = 0;
  };

  private handlePointer = (e: PointerEvent) => {
    e.preventDefault();
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      // Second finger: start pinch-zoom instead of acting.
      this.pinchDist = this.pinchDistance();
      return;
    }
    if (this.pointers.size > 2 || this.phase !== 'playing') return;

    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Monsters first: pick the front-most one under the pointer.
    let hit: Monster | null = null;
    for (const m of this.monsters) {
      const spec = MONSTERS[m.kind];
      const z = spec.flying ? this.batHeight(m) : 0;
      const size = (m.kind === 'oni' ? 30 : 20) * CHAR_SCALE;
      const c = this.worldToScreen(m.x, m.y, z * CHAR_SCALE + size * 0.6);
      const r = Math.max(size * this.scale, 24);
      if (Math.hypot(px - c.x, py - c.y) <= r) {
        if (!hit || m.x + m.y > hit.x + hit.y) hit = m;
      }
    }

    if (hit) {
      this.attackMonster(hit);
      return;
    }

    const w = this.screenToWorld(px, py);
    const ok = isWalkablePoint(w.x, w.y);
    if (isInside(Math.floor(w.x), Math.floor(w.y))) {
      this.marks.push({ x: w.x, y: w.y, life: 0.6, ok });
    }
    if (!ok) return;

    this.ninja.targetId = null;
    this.ninja.pendingStrike = false;
    this.moveNinjaTo(w);
  };

  private attackMonster(m: Monster) {
    const n = this.ninja;
    n.targetId = m.id;

    if (this.inStrikeRange(m)) {
      this.strike(m);
    } else {
      n.pendingStrike = true;
      this.moveNinjaTo(m);
    }
  }

  private inStrikeRange(m: Monster) {
    return (
      Math.hypot(m.x - this.ninja.x, m.y - this.ninja.y) <=
      STRIKE_RANGE + MONSTERS[m.kind].radius
    );
  }

  private moveNinjaTo(target: Point) {
    const n = this.ninja;
    const dest = { x: target.x, y: target.y };

    if (
      hasLineOfSight(n, dest, NINJA_RADIUS) &&
      isWalkablePoint(dest.x, dest.y)
    ) {
      n.path = [dest];
      return;
    }

    const path = findPath(n, dest);
    if (!path) return;
    if (path.length && isWalkablePoint(dest.x, dest.y)) {
      path[path.length - 1] = dest;
    }
    n.path = smoothPath(n, path, NINJA_RADIUS);
  }

  // ---------------------------------------------------------------- combat

  private strike(m: Monster) {
    const n = this.ninja;
    if (n.strikeCd > 0) {
      n.pendingStrike = true;
      return;
    }

    n.strikeCd = 0.14;
    n.strikeT = 0;
    n.pendingStrike = false;
    n.path = [];
    const sx = iso(m.x, m.y).x - iso(n.x, n.y).x;
    if (Math.abs(sx) > 2) n.facing = Math.sign(sx);

    const crit = Math.random() < 0.15;
    const dmg = this.damage * (crit ? 2 : 1);
    this.slashes.push({ x: m.x, y: m.y, dir: n.facing, life: 0.22 });
    this.damageMonster(m, dmg, crit, n);
  }

  private damageMonster(m: Monster, dmg: number, crit: boolean, from: Point) {
    m.hp -= dmg;
    m.hitFlash = 0.12;
    const spec = MONSTERS[m.kind];
    const z = spec.flying ? this.batHeight(m) : 0;

    this.addText(
      m.x,
      m.y,
      z * CHAR_SCALE + (m.kind === 'oni' ? 80 : 45),
      crit ? `${dmg}!` : String(dmg),
      crit ? '#ffcf4a' : '#fff',
      crit ? 20 : 15,
    );
    this.burst(
      m.x,
      m.y,
      crit ? 10 : 6,
      this.monsterColor(m.kind),
      z * CHAR_SCALE + 15,
    );

    // Knockback (heavier monsters barely budge).
    const dx = m.x - from.x;
    const dy = m.y - from.y;
    const d = Math.hypot(dx, dy) || 1;
    const k = m.kind === 'oni' ? 0.05 : 0.22;
    const nx = m.x + (dx / d) * k;
    const ny = m.y + (dy / d) * k;
    if (spec.flying || isWalkablePoint(nx, ny)) {
      m.x = nx;
      m.y = ny;
    }

    if (crit) this.shake = 0.15;
    if (m.hp <= 0) this.killMonster(m);
  }

  private killMonster(m: Monster) {
    const spec = MONSTERS[m.kind];
    this.monsters = this.monsters.filter((o) => o !== m);
    this.gold += spec.gold;
    this.score += spec.score * Math.max(1, this.wave);
    this.kills++;
    const z = spec.flying ? this.batHeight(m) : 0;
    this.burst(
      m.x,
      m.y,
      22,
      this.monsterColor(m.kind),
      z * CHAR_SCALE + 12,
      1.6,
    );
    this.burst(m.x, m.y, 8, '#ffffff', z * CHAR_SCALE + 12, 1);
    this.addText(
      m.x,
      m.y,
      z * CHAR_SCALE + 30,
      `+${spec.gold}g`,
      '#ffd36b',
      14,
    );
    if (this.ninja.targetId === m.id) {
      this.ninja.targetId = null;
      this.ninja.pendingStrike = false;
    }
    if (this.score > this.best) {
      this.best = this.score;
      writeBest(this.best);
    }
    this.hudDirty = true;
  }

  private hurtNinja(amount: number, from: Point) {
    const n = this.ninja;
    if (n.invuln > 0 || this.phase !== 'playing') return;
    n.hp = Math.max(0, n.hp - amount);
    n.hurtT = 0.3;
    n.invuln = 0.8;
    this.shake = 0.25;
    this.addText(n.x, n.y, 70, `-${amount}`, '#ff5a5a', 17);
    this.burst(n.x, n.y, 8, '#e23a3a', 20);

    const dx = n.x - from.x;
    const dy = n.y - from.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = n.x + (dx / d) * 0.25;
    const ny = n.y + (dy / d) * 0.25;
    if (hasLineOfSight(n, { x: nx, y: ny }, NINJA_RADIUS)) {
      n.x = nx;
      n.y = ny;
    }

    if (n.hp <= 0) {
      this.phase = 'over';
      this.burst(n.x, n.y, 30, '#1d1f2b', 20, 1.8);
      if (this.score > this.best) {
        this.best = this.score;
        writeBest(this.best);
      }
    }
    this.hudDirty = true;
  }

  // ---------------------------------------------------------------- waves

  private startWave() {
    this.wave++;
    const w = this.wave;
    const queue: MonsterKind[] = [];
    for (let i = 0; i < 2 + w; i++) queue.push('slime');
    for (let i = 0; i < (w >= 2 ? w - 1 : 0); i++) queue.push('bat');
    for (let i = 0; i < (w >= 3 ? Math.floor((w - 1) / 2) : 0); i++)
      queue.push('oni');
    this.spawnQueue = queue.sort(() => Math.random() - 0.5);
    this.spawnIn = 0.4;
    this.bannerText = `Wave ${w}`;
    this.bannerT = 2;
    this.hudDirty = true;
  }

  private spawnMonster(kind: MonsterKind) {
    const n = this.ninja;
    const edge = walkableTiles.filter(
      (t) =>
        (t.x <= 1 ||
          t.y <= 1 ||
          t.x >= ARENA_SIZE - 2 ||
          t.y >= ARENA_SIZE - 2) &&
        Math.hypot(t.x + 0.5 - n.x, t.y + 0.5 - n.y) > 5,
    );
    const pool = edge.length ? edge : walkableTiles;
    const t = pool[Math.floor(Math.random() * pool.length)];
    const hp = MONSTERS[kind].hp(this.wave);

    const m: Monster = {
      id: this.nextId++,
      kind,
      x: t.x + 0.5,
      y: t.y + 0.5,
      hp,
      maxHp: hp,
      path: [],
      repathIn: Math.random() * 0.4,
      attackCd: 0.8,
      hitFlash: 0,
      swing: 1,
      facing: 1,
      seed: Math.random() * 100,
      spawnT: 0,
    };
    this.monsters.push(m);
    this.burst(m.x, m.y, 14, '#b48cff', 8, 1.2);
    this.hudDirty = true;
  }

  // ---------------------------------------------------------------- update

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - (this.lastTime || now)) / 1000);
    this.lastTime = now;
    this.time += dt;

    this.update(dt);
    this.updateCamera(1 - Math.exp(-dt * 6));
    this.render();

    if (this.hudDirty) {
      this.hudDirty = false;
      this.onHud(this.hud());
    }

    this.raf = requestAnimationFrame(this.loop);
  };

  private hud(): HudState {
    return {
      phase: this.phase,
      hp: this.ninja.hp,
      maxHp: this.ninja.maxHp,
      gold: this.gold,
      score: this.score,
      best: this.best,
      kills: this.kills,
      wave: this.wave,
      monstersLeft: this.monsters.length + this.spawnQueue.length,
      zoom: this.zoom,
      damage: this.damage,
      upgrades: (['blade', 'speed', 'shuriken', 'potion'] as UpgradeId[]).map(
        (id) => this.upgradeInfo(id),
      ),
    };
  }

  private update(dt: number) {
    this.updatePetals(dt);
    this.updateEffects(dt);
    if (this.phase !== 'playing') return;

    // Waves
    if (this.spawnQueue.length) {
      this.spawnIn -= dt;
      if (this.spawnIn <= 0) {
        this.spawnMonster(this.spawnQueue.shift()!);
        this.spawnIn = rand(0.4, 0.9);
      }
    } else if (!this.monsters.length) {
      if (this.nextWaveIn <= 0) {
        if (this.wave > 0) {
          this.ninja.hp = Math.min(this.ninja.maxHp, this.ninja.hp + 2);
          this.bannerText = 'Wave cleared!';
          this.bannerT = 1.6;
          this.hudDirty = true;
        }
        this.nextWaveIn = this.wave > 0 ? 2.2 : 0.01;
      }
      this.nextWaveIn -= dt;
      if (this.nextWaveIn <= 0) this.startWave();
    }

    this.updateNinja(dt);
    for (const m of [...this.monsters]) this.updateMonster(m, dt);
    this.separateMonsters();
    this.updateShurikens(dt);
  }

  private updateNinja(dt: number) {
    const n = this.ninja;
    n.strikeCd -= dt;
    n.strikeT += dt;
    n.hurtT -= dt;
    n.invuln -= dt;

    const target =
      n.targetId !== null
        ? this.monsters.find((m) => m.id === n.targetId)
        : undefined;

    if (target) {
      if (this.inStrikeRange(target)) {
        n.path = [];
        if (n.pendingStrike && n.strikeCd <= 0) this.strike(target);
      } else {
        n.repathIn -= dt;
        if (n.repathIn <= 0 || !n.path.length) {
          n.repathIn = 0.3;
          this.moveNinjaTo(target);
        }
      }
    }

    n.moving = false;
    let step = this.speed * dt;
    while (n.path.length && step > 0) {
      const wp = n.path[0];
      const dx = wp.x - n.x;
      const dy = wp.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d <= step) {
        n.x = wp.x;
        n.y = wp.y;
        step -= d;
        n.path.shift();
      } else {
        n.x += (dx / d) * step;
        n.y += (dy / d) * step;
        step = 0;
      }
      n.moving = true;
      const sx = dx - dy;
      if (Math.abs(sx) > 0.05) n.facing = Math.sign(sx);
    }
    if (n.moving) n.walkT += dt;

    // Shuriken
    if (this.levels.shuriken > 0) {
      n.shurikenCd -= dt;
      if (n.shurikenCd <= 0) {
        const nearest = this.nearestMonster(7);
        if (nearest) {
          const dx = nearest.x - n.x;
          const dy = nearest.y - n.y;
          const d = Math.hypot(dx, dy) || 1;
          this.shurikens.push({
            x: n.x,
            y: n.y,
            vx: (dx / d) * 9,
            vy: (dy / d) * 9,
            rot: 0,
            life: 1.2,
          });
          n.shurikenCd = this.shurikenInterval;
        } else {
          n.shurikenCd = 0.3;
        }
      }
    }
  }

  private nearestMonster(maxDist: number) {
    let best: Monster | null = null;
    let bestD = maxDist;
    for (const m of this.monsters) {
      const d = Math.hypot(m.x - this.ninja.x, m.y - this.ninja.y);
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    }
    return best;
  }

  private batHeight(m: Monster) {
    return 30 + Math.sin(this.time * 5 + m.seed) * 5;
  }

  private updateMonster(m: Monster, dt: number) {
    const spec = MONSTERS[m.kind];
    const n = this.ninja;
    m.attackCd -= dt;
    m.hitFlash -= dt;
    m.swing += dt;
    m.spawnT += dt;
    if (m.spawnT < 0.5) return; // materialising

    const dx = n.x - m.x;
    const dy = n.y - m.y;
    const dist = Math.hypot(dx, dy);
    const reach = spec.radius + NINJA_RADIUS + 0.1;

    if (dist <= reach) {
      if (m.attackCd <= 0) {
        m.attackCd = spec.attackCooldown;
        m.swing = 0;
        this.hurtNinja(spec.damage, m);
      }
      return;
    }

    let speed = spec.speed * (1 + Math.min(this.wave, 12) * 0.03);
    let vx = 0;
    let vy = 0;

    if (spec.flying) {
      // Bats flutter straight at the ninja with a sideways wobble.
      const wobble = Math.sin(this.time * 3 + m.seed) * 0.8;
      vx = dx / dist - (dy / dist) * wobble;
      vy = dy / dist + (dx / dist) * wobble;
      const l = Math.hypot(vx, vy) || 1;
      vx /= l;
      vy /= l;
    } else {
      m.repathIn -= dt;
      const wander = m.kind === 'slime' && dist > 7;
      if (m.repathIn <= 0 || !m.path.length) {
        m.repathIn = rand(0.45, 0.7);
        if (wander) {
          if (!m.path.length) {
            const t =
              walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
            m.path = smoothPath(
              m,
              findPath(m, { x: t.x + 0.5, y: t.y + 0.5 }) ?? [],
              spec.radius,
            );
          }
        } else if (hasLineOfSight(m, n, spec.radius)) {
          m.path = [{ x: n.x, y: n.y }];
        } else {
          m.path = smoothPath(m, findPath(m, n) ?? [], spec.radius);
        }
      }
      if (wander) speed *= 0.6;

      const wp = m.path[0];
      if (wp) {
        const wx = wp.x - m.x;
        const wy = wp.y - m.y;
        const wd = Math.hypot(wx, wy);
        if (wd < 0.08) {
          m.path.shift();
        } else {
          vx = wx / wd;
          vy = wy / wd;
        }
      }
    }

    // Slimes move in hops.
    if (m.kind === 'slime')
      speed *= 0.5 + Math.abs(Math.sin(this.time * 4 + m.seed));

    const nx = m.x + vx * speed * dt;
    const ny = m.y + vy * speed * dt;
    if (spec.flying) {
      m.x = Math.max(0.3, Math.min(ARENA_SIZE - 0.3, nx));
      m.y = Math.max(0.3, Math.min(ARENA_SIZE - 0.3, ny));
    } else {
      if (isWalkablePoint(nx, m.y)) m.x = nx;
      if (isWalkablePoint(m.x, ny)) m.y = ny;
    }
    const sx = vx - vy;
    if (Math.abs(sx) > 0.1) m.facing = Math.sign(sx);
  }

  private separateMonsters() {
    const list = this.monsters;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (MONSTERS[a.kind].flying !== MONSTERS[b.kind].flying) continue;
        const min = MONSTERS[a.kind].radius + MONSTERS[b.kind].radius;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < min) {
          const push = (min - d) / 2;
          const ux = (dx / d) * push;
          const uy = (dy / d) * push;
          const flying = MONSTERS[a.kind].flying;
          if (flying || isWalkablePoint(a.x - ux, a.y - uy)) {
            a.x -= ux;
            a.y -= uy;
          }
          if (flying || isWalkablePoint(b.x + ux, b.y + uy)) {
            b.x += ux;
            b.y += uy;
          }
        }
      }
    }
  }

  private updateShurikens(dt: number) {
    for (const s of this.shurikens) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot += dt * 20;
      s.life -= dt;

      const cx = Math.floor(s.x);
      const cy = Math.floor(s.y);
      const tile = isInside(cx, cy) ? tiles[cy][cx] : null;
      if (!tile || (tile !== 'grass' && tile !== 'water')) {
        s.life = 0;
        this.burst(s.x, s.y, 5, '#cfd6e0', 14, 0.8);
        continue;
      }

      const hit = this.monsters.find(
        (m) =>
          Math.hypot(m.x - s.x, m.y - s.y) < MONSTERS[m.kind].radius + 0.15,
      );
      if (hit) {
        s.life = 0;
        this.damageMonster(
          hit,
          Math.max(1, Math.ceil(this.damage / 2)),
          false,
          s,
        );
      }
    }
    this.shurikens = this.shurikens.filter((s) => s.life > 0);
  }

  private updateEffects(dt: number) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vz -= 260 * dt;
      if (p.z < 0) {
        p.z = 0;
        p.vz *= -0.3;
        p.vx *= 0.6;
        p.vy *= 0.6;
      }
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const t of this.texts) {
      t.z += 40 * dt;
      t.life -= dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);

    for (const s of this.slashes) s.life -= dt;
    this.slashes = this.slashes.filter((s) => s.life > 0);

    for (const m of this.marks) m.life -= dt;
    this.marks = this.marks.filter((m) => m.life > 0);

    this.bannerT -= dt;
    this.shake = Math.max(0, this.shake - dt);
  }

  private makePetal(anywhere = false): Petal {
    return {
      x: anywhere ? rand(0, 1) : rand(-0.1, 1),
      y: anywhere ? rand(0, 1) : -0.05,
      vx: rand(0.01, 0.04),
      vy: rand(0.03, 0.07),
      rot: rand(0, Math.PI * 2),
      size: rand(2.5, 4.5),
    };
  }

  private updatePetals(dt: number) {
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.x += (p.vx + Math.sin(this.time + i) * 0.01) * dt;
      p.y += p.vy * dt;
      p.rot += dt * 1.5;
      if (p.y > 1.05 || p.x > 1.05) this.petals[i] = this.makePetal();
    }
  }

  private burst(
    x: number,
    y: number,
    count: number,
    color: string,
    z = 10,
    power = 1,
  ) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(0.6, 2.2) * power;
      const life = rand(0.35, 0.7);
      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        vz: rand(40, 140) * power,
        life,
        maxLife: life,
        size: rand(1.5, 3.5),
        color,
      });
    }
  }

  private addText(
    x: number,
    y: number,
    z: number,
    text: string,
    color: string,
    size: number,
  ) {
    this.texts.push({ x, y, z, text, color, life: 0.9, size });
  }

  private monsterColor(kind: MonsterKind) {
    return kind === 'slime'
      ? '#7be36b'
      : kind === 'bat'
        ? '#9b6bff'
        : '#e0563f';
  }

  // ---------------------------------------------------------------- render

  private render() {
    const ctx = this.ctx;
    const w = this.cssWidth;
    const h = this.cssHeight;

    // Sky / backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#2a1610');
    bg.addColorStop(1, '#120905');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const moon = ctx.createRadialGradient(
      w * 0.82,
      h * 0.16,
      0,
      w * 0.82,
      h * 0.16,
      h * 0.5,
    );
    moon.addColorStop(0, 'rgba(255, 190, 130, 0.22)');
    moon.addColorStop(1, 'rgba(255, 190, 130, 0)');
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    const shake = this.shake > 0 ? this.shake * 14 : 0;
    ctx.translate(
      this.offsetX + rand(-shake, shake),
      this.offsetY + rand(-shake, shake),
    );
    ctx.scale(this.scale, this.scale);

    this.drawPlatform();
    this.drawFloor();
    this.drawMarks();

    // Depth-sorted scene: obstacles, characters, particles.
    const drawables: { depth: number; draw: () => void }[] = [];

    for (let y = 0; y < ARENA_SIZE; y++) {
      for (let x = 0; x < ARENA_SIZE; x++) {
        const t = tiles[y][x];
        if (t === 'grass' || t === 'water') continue;
        drawables.push({
          depth: x + y + 1,
          draw: () => this.drawObstacle(t, x, y),
        });
      }
    }

    for (const m of this.monsters) {
      drawables.push({ depth: m.x + m.y, draw: () => this.drawMonster(m) });
    }

    if (this.phase !== 'over') {
      drawables.push({
        depth: this.ninja.x + this.ninja.y,
        draw: () => this.drawNinja(),
      });
    }

    for (const p of this.particles) {
      drawables.push({ depth: p.x + p.y, draw: () => this.drawParticle(p) });
    }
    for (const s of this.shurikens) {
      drawables.push({ depth: s.x + s.y, draw: () => this.drawShuriken(s) });
    }

    drawables.sort((a, b) => a.depth - b.depth);
    for (const d of drawables) d.draw();

    // Ghost silhouette so the ninja stays visible behind tall obstacles.
    if (this.phase !== 'over') {
      ctx.save();
      ctx.globalAlpha = 0.25;
      this.drawNinja(true);
      ctx.restore();
    }

    for (const s of this.slashes) this.drawSlash(s);
    this.drawTexts();
    ctx.restore();

    this.drawPetals();
    this.drawBanner();
  }

  private diamond(x: number, y: number, inset = 0, z = 0) {
    const ctx = this.ctx;
    const a = iso(x + inset, y + inset, z);
    const b = iso(x + 1 - inset, y + inset, z);
    const c = iso(x + 1 - inset, y + 1 - inset, z);
    const d = iso(x + inset, y + 1 - inset, z);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
  }

  private drawPlatform() {
    const ctx = this.ctx;
    const S = ARENA_SIZE;
    const left = iso(0, S);
    const bottom = iso(S, S);
    const right = iso(S, 0);

    ctx.fillStyle = '#4a2c18';
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(bottom.x, bottom.y + PLATFORM_DEPTH);
    ctx.lineTo(left.x, left.y + PLATFORM_DEPTH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#331d0f';
    ctx.beginPath();
    ctx.moveTo(bottom.x, bottom.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(right.x, right.y + PLATFORM_DEPTH);
    ctx.lineTo(bottom.x, bottom.y + PLATFORM_DEPTH);
    ctx.closePath();
    ctx.fill();

    // Soil strata
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 2;
    for (const k of [0.45, 0.75]) {
      ctx.beginPath();
      ctx.moveTo(left.x, left.y + PLATFORM_DEPTH * k);
      ctx.lineTo(bottom.x, bottom.y + PLATFORM_DEPTH * k);
      ctx.lineTo(right.x, right.y + PLATFORM_DEPTH * k);
      ctx.stroke();
    }
  }

  private drawFloor() {
    const ctx = this.ctx;
    for (let y = 0; y < ARENA_SIZE; y++) {
      for (let x = 0; x < ARENA_SIZE; x++) {
        const noise = tileNoise[y][x];
        if (tiles[y][x] === 'water') {
          this.diamond(x, y);
          ctx.fillStyle = '#1d4f6e';
          ctx.fill();
          this.diamond(x, y, 0.08, -3);
          const shimmer = 0.5 + 0.5 * Math.sin(this.time * 2 + x + y * 0.7);
          ctx.fillStyle = `rgb(${40 + shimmer * 20}, ${110 + shimmer * 25}, ${150 + shimmer * 25})`;
          ctx.fill();
          const c = iso(x + 0.5, y + 0.5);
          ctx.strokeStyle = `rgba(255,255,255,${0.15 + shimmer * 0.2})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(
            c.x + noise * 10 - 5,
            c.y,
            8 + shimmer * 4,
            3,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
          continue;
        }

        this.diamond(x, y);
        const checker = (x + y) % 2 === 0;
        const l = 26 + noise * 6 + (checker ? 3 : 0);
        ctx.fillStyle = `hsl(${95 + noise * 15}, 32%, ${l}%)`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (noise > 0.72) {
          // grass tufts
          const c = iso(x + 0.3 + noise * 0.4, y + 0.6 - noise * 0.3);
          ctx.strokeStyle = 'hsl(95, 40%, 40%)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (const o of [-3, 0, 3]) {
            ctx.moveTo(c.x + o, c.y);
            ctx.lineTo(c.x + o * 1.6, c.y - 6);
          }
          ctx.stroke();
        } else if (noise < 0.08) {
          const c = iso(x + 0.5, y + 0.5);
          ctx.fillStyle = '#f2b8c6';
          ctx.beginPath();
          ctx.arc(c.x - 6, c.y + 2, 2, 0, Math.PI * 2);
          ctx.arc(c.x + 5, c.y - 2, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private drawMarks() {
    const ctx = this.ctx;
    for (const m of this.marks) {
      const p = iso(m.x, m.y);
      const k = m.life / 0.6;
      ctx.save();
      ctx.globalAlpha = k;
      ctx.lineWidth = 2;
      if (m.ok) {
        ctx.strokeStyle = '#ffe0a8';
        ctx.beginPath();
        ctx.ellipse(
          p.x,
          p.y,
          14 * (1.3 - k * 0.5),
          7 * (1.3 - k * 0.5),
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#ff5a5a';
        ctx.beginPath();
        ctx.moveTo(p.x - 7, p.y - 4);
        ctx.lineTo(p.x + 7, p.y + 4);
        ctx.moveTo(p.x + 7, p.y - 4);
        ctx.lineTo(p.x - 7, p.y + 4);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private prism(
    x: number,
    y: number,
    inset: number,
    z0: number,
    h: number,
    top: string,
    left: string,
    right: string,
  ) {
    const ctx = this.ctx;
    const b0 = iso(x + 1 - inset, y + inset, z0);
    const c0 = iso(x + 1 - inset, y + 1 - inset, z0);
    const d0 = iso(x + inset, y + 1 - inset, z0);
    const b1 = iso(x + 1 - inset, y + inset, z0 + h);
    const c1 = iso(x + 1 - inset, y + 1 - inset, z0 + h);
    const d1 = iso(x + inset, y + 1 - inset, z0 + h);

    ctx.fillStyle = left;
    ctx.beginPath();
    ctx.moveTo(d0.x, d0.y);
    ctx.lineTo(c0.x, c0.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(d1.x, d1.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = right;
    ctx.beginPath();
    ctx.moveTo(c0.x, c0.y);
    ctx.lineTo(b0.x, b0.y);
    ctx.lineTo(b1.x, b1.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.closePath();
    ctx.fill();

    this.diamond(x, y, inset, z0 + h);
    ctx.fillStyle = top;
    ctx.fill();
  }

  private groundShadow(
    x: number,
    y: number,
    rx: number,
    ry: number,
    alpha = 0.35,
  ) {
    const ctx = this.ctx;
    const p = iso(x, y);
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawObstacle(kind: string, x: number, y: number) {
    const ctx = this.ctx;
    const noise = tileNoise[y][x];

    if (kind === 'wall') {
      this.prism(x, y, 0, 0, 42, '#8d8a85', '#615d58', '#4a4743');
      // brick lines
      const d = iso(x, y + 1);
      const c = iso(x + 1, y + 1);
      const b = iso(x + 1, y);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const z of [14, 28]) {
        ctx.moveTo(d.x, d.y - z);
        ctx.lineTo(c.x, c.y - z);
        ctx.lineTo(b.x, b.y - z);
      }
      const off = noise > 0.5 ? 0.33 : 0.66;
      for (const [z0, z1, t] of [
        [0, 14, off],
        [14, 28, 1 - off],
        [28, 42, off],
      ]) {
        const p = iso(x + t, y + 1);
        const q = iso(x + 1, y + t);
        ctx.moveTo(p.x, p.y - z0);
        ctx.lineTo(p.x, p.y - z1);
        ctx.moveTo(q.x, q.y - z0);
        ctx.lineTo(q.x, q.y - z1);
      }
      ctx.stroke();
      // moss on top
      this.diamond(x, y, 0.2 + noise * 0.1, 42);
      ctx.fillStyle = 'rgba(90, 130, 60, 0.55)';
      ctx.fill();
      return;
    }

    if (kind === 'rock') {
      this.groundShadow(x + 0.55, y + 0.55, 26, 13, 0.3);
      this.prism(x, y, 0.1, 0, 14, '#8a7f74', '#625950', '#4d453e');
      this.prism(
        x + 0.08,
        y - 0.02,
        0.28,
        14,
        10,
        '#9d9387',
        '#6d645a',
        '#564e46',
      );
      const p = iso(x + 0.45, y + 0.4, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (kind === 'tree') {
      this.groundShadow(x + 0.5, y + 0.5, 30, 15, 0.35);
      const base = iso(x + 0.5, y + 0.5);
      // trunk
      ctx.fillStyle = '#5a3624';
      ctx.beginPath();
      ctx.moveTo(base.x - 6, base.y);
      ctx.quadraticCurveTo(base.x - 3, base.y - 26, base.x - 8, base.y - 48);
      ctx.lineTo(base.x + 2, base.y - 50);
      ctx.quadraticCurveTo(base.x + 4, base.y - 24, base.x + 6, base.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5a3624';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(base.x - 2, base.y - 34);
      ctx.lineTo(base.x + 14, base.y - 50);
      ctx.stroke();
      // blossom
      const sway = Math.sin(this.time * 1.2 + x * 2) * 1.5;
      const blobs: [number, number, number, string][] = [
        [-16, -54, 15, '#d9819a'],
        [14, -56, 14, '#d9819a'],
        [-2, -68, 17, '#e897ae'],
        [-12, -74, 12, '#f1aec1'],
        [12, -72, 12, '#f1aec1'],
        [0, -82, 10, '#f7c6d3'],
      ];
      for (const [bx, by, r, c] of blobs) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(base.x + bx + sway, base.y + by, r, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (kind === 'lantern') {
      this.groundShadow(x + 0.5, y + 0.5, 20, 10, 0.3);
      this.prism(x, y, 0.22, 0, 8, '#9a958d', '#6d6862', '#57534e');
      this.prism(x, y, 0.4, 8, 22, '#9a958d', '#77726b', '#5f5a54');
      this.prism(x, y, 0.3, 30, 14, '#a39d94', '#77726b', '#5f5a54');
      // lit window
      const glow = 0.75 + Math.sin(this.time * 6 + noise * 10) * 0.08;
      const w = iso(x + 0.5, y + 0.7, 36);
      ctx.fillStyle = `rgba(255, 200, 110, ${glow})`;
      ctx.fillRect(w.x - 5, w.y - 4, 10, 8);
      const halo = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, 46);
      halo.addColorStop(0, `rgba(255, 170, 80, ${0.35 * glow})`);
      halo.addColorStop(1, 'rgba(255, 170, 80, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(w.x, w.y, 46, 0, Math.PI * 2);
      ctx.fill();
      // roof
      this.prism(x, y, 0.12, 44, 5, '#5e5953', '#46423e', '#3a3633');
      this.prism(x, y, 0.36, 49, 6, '#6d6862', '#4f4b46', '#3f3c38');
    }
  }

  private drawNinja(ghost = false) {
    const ctx = this.ctx;
    const n = this.ninja;
    const p = iso(n.x, n.y);
    const t = this.time;

    if (!ghost && n.invuln > 0 && Math.floor(t * 20) % 2 === 0) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(CHAR_SCALE, CHAR_SCALE);
    ctx.translate(-p.x, -p.y);
    if (!ghost) this.groundShadow(n.x, n.y, 12, 6);

    const bob = n.moving
      ? Math.abs(Math.sin(n.walkT * 12)) * 3
      : Math.sin(t * 3) * 0.8;
    const f = n.facing;
    const x = p.x;
    const y = p.y - bob;
    const body = n.hurtT > 0 ? '#5a1f26' : '#1f2233';
    const dark = '#141622';

    // legs
    const step = n.moving ? Math.sin(n.walkT * 12) * 4 : 0;
    ctx.fillStyle = dark;
    ctx.fillRect(x - 5 + step, y - 9, 4, 9);
    ctx.fillRect(x + 1 - step, y - 9, 4, 9);

    // scarf tails flowing behind
    ctx.strokeStyle = '#d63a3a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - f * 5, y - 34);
    const wave = Math.sin(t * 10) * 3;
    const trail = n.moving ? 16 : 10;
    ctx.quadraticCurveTo(
      x - f * (trail * 0.6),
      y - 36 + wave,
      x - f * trail,
      y - 30 - wave,
    );
    ctx.moveTo(x - f * 5, y - 33);
    ctx.quadraticCurveTo(
      x - f * (trail * 0.5),
      y - 30 - wave,
      x - f * (trail - 3),
      y - 25 + wave,
    );
    ctx.stroke();

    // sword on the back (hidden during a strike)
    const striking = n.strikeT < 0.18;
    if (!striking) {
      ctx.strokeStyle = '#c9ced8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - f * 8, y - 12);
      ctx.lineTo(x + f * 7, y - 36);
      ctx.stroke();
      ctx.strokeStyle = '#7a2a2a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + f * 4, y - 31);
      ctx.lineTo(x + f * 8, y - 38);
      ctx.stroke();
    }

    // torso
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(x - 8, y - 27, 16, 19, 5);
    ctx.fill();
    ctx.fillStyle = '#d63a3a';
    ctx.fillRect(x - 8, y - 14, 16, 3);

    // head
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y - 33, 9, 0, Math.PI * 2);
    ctx.fill();
    // eye slit
    ctx.fillStyle = '#f0c9a0';
    ctx.beginPath();
    ctx.roundRect(x - 6 + f * 2, y - 36, 12, 5, 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(x + f * 2 - 3 + f * 2, y - 35, 2, 3);
    ctx.fillRect(x + f * 2 + 2 + f * 2, y - 35, 2, 3);
    // headband
    ctx.fillStyle = '#d63a3a';
    ctx.fillRect(x - 9, y - 40, 18, 3);

    // arm + sword during strike
    if (striking) {
      const k = n.strikeT / 0.18;
      const angle = f > 0 ? -1.9 + k * 2.6 : Math.PI + 1.9 - k * 2.6;
      const hx = x + f * 7;
      const hy = y - 22;
      ctx.strokeStyle = body;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + f * 3, y - 22);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.strokeStyle = '#eef2f8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + Math.cos(angle) * 26, hy + Math.sin(angle) * 26);
      ctx.stroke();
    } else {
      ctx.fillStyle = body;
      ctx.fillRect(x + f * 6 - 2, y - 24, 4, 10);
    }
    ctx.restore();
  }

  private drawHpBar(m: Monster, x: number, y: number, width: number) {
    if (m.hp >= m.maxHp) return;
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - width / 2 - 1, y - 1, width + 2, 5);
    ctx.fillStyle = '#ff5a5a';
    ctx.fillRect(x - width / 2, y, (width * Math.max(0, m.hp)) / m.maxHp, 3);
  }

  private drawMonster(m: Monster) {
    const ctx = this.ctx;
    const t = this.time + m.seed;
    const appear = Math.min(1, m.spawnT / 0.5);
    const flash = m.hitFlash > 0;
    const targeted = this.ninja.targetId === m.id;

    ctx.save();
    ctx.globalAlpha = appear;
    const ground = iso(m.x, m.y);
    ctx.translate(ground.x, ground.y);
    ctx.scale(CHAR_SCALE, CHAR_SCALE);
    ctx.translate(-ground.x, -ground.y);

    if (m.kind === 'slime') {
      this.groundShadow(m.x, m.y, 13, 6);
      const p = iso(m.x, m.y);
      const hop = Math.abs(Math.sin(this.time * 4 + m.seed));
      const sq = Math.sin(this.time * 8 + m.seed) * 0.12;
      const w = 15 * (1 + sq);
      const h = 15 * (1 - sq) * appear;
      const y = p.y - hop * 5;
      if (targeted) this.drawTargetRing(m.x, m.y, 16);
      const g = ctx.createRadialGradient(
        p.x - 4,
        y - h * 0.7,
        2,
        p.x,
        y - h * 0.4,
        w * 1.2,
      );
      g.addColorStop(0, flash ? '#ffffff' : '#b6f59c');
      g.addColorStop(1, flash ? '#ffffff' : '#3fa33a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(p.x - w, y);
      ctx.bezierCurveTo(p.x - w, y - h * 1.4, p.x + w, y - h * 1.4, p.x + w, y);
      ctx.quadraticCurveTo(p.x, y + 4, p.x - w, y);
      ctx.fill();
      // eyes
      const look = m.facing * 2;
      for (const ex of [-5, 4]) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x + ex + look, y - h * 0.65, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(p.x + ex + look * 1.5, y - h * 0.62, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      this.drawHpBar(m, p.x, y - h * 1.3 - 6, 22);
    } else if (m.kind === 'bat') {
      const z = this.batHeight(m);
      this.groundShadow(m.x, m.y, 9, 4, 0.25);
      if (targeted) this.drawTargetRing(m.x, m.y, 12);
      const p = iso(m.x, m.y, z);
      const flap = Math.sin(t * 22);
      ctx.fillStyle = flash ? '#fff' : '#3b2466';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(p.x + side * 4, p.y - 2);
        ctx.lineTo(p.x + side * 22, p.y - 10 - flap * 10);
        ctx.lineTo(p.x + side * 17, p.y - 2 - flap * 4);
        ctx.lineTo(p.x + side * 12, p.y + 2 - flap * 5);
        ctx.lineTo(p.x + side * 7, p.y + 3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = flash ? '#fff' : '#5b3a9a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7.5, 0, Math.PI * 2);
      ctx.fill();
      // ears
      ctx.beginPath();
      ctx.moveTo(p.x - 6, p.y - 4);
      ctx.lineTo(p.x - 4, p.y - 12);
      ctx.lineTo(p.x - 1, p.y - 6);
      ctx.moveTo(p.x + 6, p.y - 4);
      ctx.lineTo(p.x + 4, p.y - 12);
      ctx.lineTo(p.x + 1, p.y - 6);
      ctx.fill();
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(p.x - 4 + m.facing, p.y - 2, 2.5, 2.5);
      ctx.fillRect(p.x + 1.5 + m.facing, p.y - 2, 2.5, 2.5);
      this.drawHpBar(m, p.x, p.y - 20, 20);
    } else {
      this.groundShadow(m.x, m.y, 20, 10);
      if (targeted) this.drawTargetRing(m.x, m.y, 24);
      const p = iso(m.x, m.y);
      const step = Math.sin(t * 5) * 1.5;
      const x = p.x;
      const y = p.y;
      const f = m.facing;
      const skin = flash ? '#ffffff' : '#c2453a';
      const shade = flash ? '#eeeeee' : '#8f2d25';

      // legs
      ctx.fillStyle = shade;
      ctx.fillRect(x - 10, y - 12 + step, 7, 12 - step);
      ctx.fillRect(x + 3, y - 12 - step, 7, 12 + step);
      // tiger-skin loincloth
      ctx.fillStyle = '#e8b030';
      ctx.fillRect(x - 13, y - 18, 26, 8);
      ctx.fillStyle = '#2a1a0a';
      for (const sx of [-9, -2, 5]) ctx.fillRect(x + sx, y - 18, 2, 8);
      // body
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(x, y - 30, 16, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      // head
      ctx.beginPath();
      ctx.arc(x + f * 2, y - 48, 11, 0, Math.PI * 2);
      ctx.fill();
      // horns
      ctx.fillStyle = '#f4ead2';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + f * 2 + side * 5, y - 56);
        ctx.lineTo(x + f * 2 + side * 10, y - 68);
        ctx.lineTo(x + f * 2 + side * 9, y - 55);
        ctx.closePath();
        ctx.fill();
      }
      // face
      ctx.fillStyle = '#ffe14d';
      ctx.fillRect(x + f * 4 - 6, y - 51, 4, 3);
      ctx.fillRect(x + f * 4 + 2, y - 51, 4, 3);
      ctx.fillStyle = '#2a0f0c';
      ctx.fillRect(x + f * 4 - 5, y - 44, 10, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + f * 4 - 4, y - 45, 2, 3);
      ctx.fillRect(x + f * 4 + 2, y - 45, 2, 3);
      // kanabō club
      const swing = m.swing < 0.35 ? Math.sin((m.swing / 0.35) * Math.PI) : 0;
      const angle = f > 0 ? -1.1 + swing * 1.8 : Math.PI + 1.1 - swing * 1.8;
      const hx = x + f * 14;
      const hy = y - 30;
      ctx.strokeStyle = flash ? '#ddd' : '#3a2a20';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + Math.cos(angle) * 30, hy + Math.sin(angle) * 30);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#bbb';
      for (const k of [0.55, 0.75, 0.95]) {
        ctx.beginPath();
        ctx.arc(
          hx + Math.cos(angle) * 30 * k,
          hy + Math.sin(angle) * 30 * k,
          1.8,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      // arm
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      this.drawHpBar(m, x, y - 74, 32);
    }

    ctx.restore();
  }

  private drawTargetRing(x: number, y: number, r: number) {
    const ctx = this.ctx;
    const p = iso(x, y);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 90, 90, 0.85)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.lineDashOffset = -this.time * 20;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r, r / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawParticle(p: Particle) {
    const ctx = this.ctx;
    const s = iso(p.x, p.y, p.z);
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(s.x - p.size / 2, s.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  }

  private drawShuriken(s: Shuriken) {
    const ctx = this.ctx;
    this.groundShadow(s.x, s.y, 5, 2.5, 0.25);
    const p = iso(s.x, s.y, 24);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(s.rot);
    ctx.fillStyle = '#d7dde6';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(
        Math.cos(a + Math.PI / 4) * 2.5,
        Math.sin(a + Math.PI / 4) * 2.5,
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawSlash(s: Slash) {
    const ctx = this.ctx;
    const p = iso(s.x, s.y, 30);
    const k = 1 - s.life / 0.22;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4 * (1 - k) + 1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Mirror the arc horizontally when striking to the left.
    const [a0, a1] = s.dir > 0 ? [-2.4, -0.8] : [Math.PI + 2.4, Math.PI + 0.8];
    ctx.arc(p.x, p.y, 24 + k * 14, a0, a1, s.dir < 0);
    ctx.stroke();
    ctx.restore();
  }

  private drawTexts() {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of this.texts) {
      const p = iso(t.x, t.y, t.z);
      ctx.globalAlpha = Math.min(1, t.life / 0.4);
      ctx.font = `700 ${t.size}px system-ui, sans-serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.strokeText(t.text, p.x, p.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  private drawPetals() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(247, 190, 205, 0.75)';
    for (const p of this.petals) {
      ctx.save();
      ctx.translate(p.x * this.cssWidth, p.y * this.cssHeight);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawBanner() {
    if (this.bannerT <= 0 || this.phase !== 'playing') return;
    const ctx = this.ctx;
    const alpha = Math.min(1, this.bannerT / 0.4);
    const size = Math.max(26, Math.min(56, this.cssWidth / 14));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${size}px Georgia, serif`;
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    const y = this.cssHeight * 0.22 - (1 - alpha) * 10;
    ctx.strokeText(this.bannerText, this.cssWidth / 2, y);
    ctx.fillStyle = '#ffe0a8';
    ctx.fillText(this.bannerText, this.cssWidth / 2, y);
    ctx.restore();
  }
}
