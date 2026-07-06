'use client';

import { useWorldState } from '../hooks/useWorldState';
import { UserPersonaSelector } from './UserPersonaSelector';
import styles from '../styles/nav-header.module.css';

export function NavHeader() {
  const { organization } = useWorldState();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.workspaceName}>
          {organization?.name || 'SimulatedWorld'}
        </div>
      </div>

      <div className={styles.center}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>

      <div className={styles.right}>
        <UserPersonaSelector />
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot}></div>
          <span className={styles.statusText}>Connected</span>
        </div>
      </div>
    </header>
  );
}
