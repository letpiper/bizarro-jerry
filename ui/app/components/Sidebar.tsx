'use client';

import { useWorldState } from '../hooks/useWorldState';
import styles from '../sidebar.module.css';

interface NavView {
  id: string;
  name: string;
}

const VIEWS: NavView[] = [
  { id: 'slack', name: 'Messages' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'gmail', name: 'Email' },
  { id: 'trace-log', name: 'Traces' },
  { id: 'mutation-log', name: 'Mutations' },
  { id: 'state-inspector', name: 'State' },
  { id: 'scenarios', name: 'Scenarios' },
  { id: 'metrics', name: 'Metrics' },
];

export function Sidebar() {
  const { currentView, setCurrentView } = useWorldState();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.workspaceName}>Workspace</h2>
        <p className={styles.workspaceSubtitle}>Observability</p>
      </div>

      <nav className={styles.nav}>
        {VIEWS.map((view) => (
          <button
            key={view.id}
            className={`${styles.navItem} ${currentView === view.id ? styles.active : ''}`}
            onClick={() => setCurrentView(view.id as typeof currentView)}
          >
            {view.name}
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <p>Real-time observability</p>
      </div>
    </aside>
  );
}
