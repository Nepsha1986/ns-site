'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import {
  faArrowLeft,
  faCompress,
  faExpand,
  faMinus,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

import Button from '@/common/Button';
import Icon from '@/common/Icon';

import {
  HudState,
  MAX_ZOOM,
  MIN_ZOOM,
  NinjaGameEngine,
  UpgradeId,
} from './engine';
import styles from './styles.module.scss';

const MONSTER_GUIDE = [
  { name: 'Slime', note: 'Slow and squishy. Hops around the arena.' },
  { name: 'Shadow bat', note: 'Fast flyer — soars over walls and water.' },
  { name: 'Oni', note: 'Tough demon with a club. Hits for 2.' },
];

const NinjaGame = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NinjaGameEngine | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new NinjaGameEngine(canvasRef.current, setHud);
    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  useEffect(() => {
    setCanFullscreen(!!document.fullscreenEnabled);
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const start = () => engineRef.current?.start();
  const buy = (id: UpgradeId) => engineRef.current?.buy(id);
  const zoom = (factor: number) => engineRef.current?.zoomBy(factor);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current?.requestFullscreen().catch(() => {});
    }
  };

  const hpPercent = hud ? (hud.hp / hud.maxHp) * 100 : 100;
  const zoomLevel = hud?.zoom ?? 1;

  return (
    <div ref={rootRef} className={styles.game}>
      <canvas ref={canvasRef} className={styles.game__canvas} />

      <div className={styles.topBar}>
        <div className={styles.panel}>
          <Link href="/" className={styles.iconButton} title="Back to site">
            <Icon icon={faArrowLeft} />
          </Link>
          <div className={styles.hpBar}>
            <div
              className={classNames(styles.hpBar__fill, {
                [styles.hpBar__fill_low]: hpPercent <= 30,
              })}
              style={{ width: `${hpPercent}%` }}
            />
            <span className={styles.hpBar__text}>
              HP {hud?.hp ?? 10} / {hud?.maxHp ?? 10}
            </span>
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
          <div className={classNames(styles.stat, styles.stat_secondary)}>
            <span className={styles.stat__label}>Best</span>
            <strong>{hud?.best ?? 0}</strong>
          </div>
        </div>

        <div className={classNames(styles.panel, styles.zoomPanel)}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => zoom(1 / 1.25)}
            disabled={zoomLevel <= MIN_ZOOM}
            title="Zoom out (−)"
          >
            <Icon icon={faMinus} />
          </button>
          <span className={styles.zoomValue}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => zoom(1.25)}
            disabled={zoomLevel >= MAX_ZOOM}
            title="Zoom in (+)"
          >
            <Icon icon={faPlus} />
          </button>
          {canFullscreen && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              <Icon icon={isFullscreen ? faCompress : faExpand} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.shop}>
        {hud?.upgrades.map((u, i) => (
          <button
            key={u.id}
            type="button"
            className={styles.upgrade}
            disabled={!u.affordable || hud.phase !== 'playing'}
            onClick={() => buy(u.id)}
            title={u.description}
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

      {hud?.phase === 'intro' && (
        <div className={styles.overlay}>
          <h1 className={styles.overlay__title}>Ninja Hunt</h1>
          <p>
            Click the ground to run, click a monster to strike. Every click is a
            blow — click fast! Spend gold on upgrades between fights.
          </p>
          <p className={styles.overlay__hint}>
            Zoom with the mouse wheel, a pinch, or the +/− buttons.
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
          <h1 className={styles.overlay__title}>The ninja has fallen</h1>
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
  );
};

export default NinjaGame;
