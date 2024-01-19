import React, { type ReactNode, useEffect, useRef } from 'react';
import classNames from 'classnames';

import Button from '@/common/Button';

import styles from './styles.module.scss';

const Dialog: React.FC<{
  open: boolean;
  children: ReactNode;
  onClickClose?: () => void;
  size?: 'small' | 'medium' | 'large';
  heading?: string;
}> = ({ open, children, onClickClose, heading, size = 'small' }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const onAnimationEnd = () => {
    if (!open) dialogRef.current?.close();
  };

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    }
  }, [open]);

  const className = classNames(styles.dialog, {
    [styles[`dialog_${size}`]]: size,
    [styles.dialog_dissapear]: !open,
  });

  return (
    <dialog
      className={className}
      ref={dialogRef}
      onAnimationEnd={onAnimationEnd}
    >
      <header className={styles.dialog__header}>
        {!!heading && <h3 style={{ marginBottom: 0 }}>{heading}</h3>}
      </header>

      <div className={styles.dialog__main}>{children}</div>

      <footer className={styles.dialog__footer}>
        <Button onClick={onClickClose}>Close</Button>
      </footer>
    </dialog>
  );
};

export default Dialog;
