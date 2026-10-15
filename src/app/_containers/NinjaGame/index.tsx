'use client';

import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import Button from '@/common/Button';

import { HudState, NinjaGameEngine, UpgradeId } from './engine';
import styles from './styles.module.scss';

const MONSTER_GUIDE = [
  { name: 'Slime', note: 'Slow and squishy. Hops around the arena.' },
  { name: 'Shadow bat', note: 'Fast flyer — soars over walls and water.' },
  { name: 'Oni', note: 'Tough demon with a club. Hits for 2.' },
];

const NinjaGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NinjaGameEngine | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new NinjaGameEngine(canvasRef.current, setHud);
    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  const start = () => engineRef.current?.start();
  const buy = (id: UpgradeId) => engineRef.current?.buy(id);

  const hpPercent = hud ? (hud.hp / hud.maxHp) * 100 : 100;

  return (
    <div className={styles.game}>
      <div className={styles.game__stats}>
        <div className={styles.stat}>
          <span className={styles.stat__label}>HP</span>
          <div className={styles.hpBar}>
            <div
              className={classNames(styles.hpBar__fill, {
                [styles.hpBar__fill_low]: hpPercent <= 30,
              })}
              style={{ width: `${hpPercent}%` }}
            />
            <span className={styles.hpBar__text}>
              {hud?.hp ?? 10} / {hud?.maxHp ?? 10}
            </span>
          </div>
        </div>
        <div className={styles.stat}>
          <span className={styles.stat__label}>Wave</span>
          <strong>{hud?.wave ?? 0}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.stat__label}>Gold</span>
          <strong className={styles.gold}>{hud?.gold ?? 0}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.stat__label}>Score</span>
          <strong>{hud?.score ?? 0}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.stat__label}>Best</span>
          <strong>{hud?.best ?? 0}</strong>
        </div>
      </div>

      <div className={styles.game__stage}>
        <canvas ref={canvasRef} className={styles.game__canvas} />

        {hud?.phase === 'intro' && (
          <div className={styles.overlay}>
            <h2 className={styles.overlay__title}>Ninja Hunt</h2>
            <p>
              Click the ground to run, click a monster to strike. Every click is
              a blow — click fast! Spend gold on upgrades between fights.
            </p>
            <ul className={styles.overlay__list}>
              {MONSTER_GUIDE.map((m) => (
                <li key={m.name}>
                  <strong>{m.name}</strong> — {m.note}
                </li>
              ))}
            </ul>
            <Button size="lg" onClick={start}>
              Start the hunt
            </Button>
          </div>
        )}

        {hud?.phase === 'over' && (
          <div className={styles.overlay}>
            <h2 className={styles.overlay__title}>The ninja has fallen</h2>
            <p>
              You reached wave <strong>{hud.wave}</strong>, slew{' '}
              <strong>{hud.kills}</strong> monsters and scored{' '}
              <strong>{hud.score}</strong> points.
              {hud.score > 0 && hud.score >= hud.best && ' New record!'}
            </p>
            <Button size="lg" onClick={start}>
              Hunt again
            </Button>
          </div>
        )}
      </div>

      <div className={styles.game__shop}>
        {hud?.upgrades.map((u, i) => (
          <button
            key={u.id}
            type="button"
            className={styles.upgrade}
            disabled={!u.affordable || hud.phase !== 'playing'}
            onClick={() => buy(u.id)}
          >
            <span className={styles.upgrade__title}>
              <kbd>{i + 1}</kbd> {u.title}
              {u.level > 0 && u.id !== 'potion' && (
                <span className={styles.upgrade__level}>Lv {u.level}</span>
              )}
            </span>
            <span className={styles.upgrade__desc}>{u.description}</span>
            <span className={styles.upgrade__cost}>
              {u.maxed ? 'Max' : `${u.cost} gold`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NinjaGame;
