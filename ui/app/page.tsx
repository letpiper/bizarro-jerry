'use client';

import { useEffect } from 'react';
import { useWorldState } from './hooks/useWorldState';
import { useWebSocket } from './hooks/useWebSocket';
import { UserPersonaSelector } from './components/UserPersonaSelector';
import { Sidebar } from './components/Sidebar';
import { SlackView } from './components/SlackView';
import { CalendarView } from './components/CalendarView';
import { GmailView } from './components/GmailView';
import { TraceLog } from './components/TraceLog';
import { MutationLog } from './components/MutationLog';
import { StateInspector } from './components/StateInspector';
import { ScenariosView } from './components/ScenariosView';
import { MetricsView } from './components/MetricsView';
import styles from './dashboard.module.css';

function DashboardContent() {
  const { currentView } = useWorldState();

  switch (currentView) {
    case 'slack':
      return <SlackView />;
    case 'calendar':
      return <CalendarView />;
    case 'gmail':
      return <GmailView />;
    case 'trace-log':
      return <TraceLog />;
    case 'mutation-log':
      return <MutationLog />;
    case 'state-inspector':
      return <StateInspector />;
    case 'scenarios':
      return <ScenariosView />;
    case 'metrics':
      return <MetricsView />;
    default:
      return <SlackView />;
  }
}

function Dashboard() {
  const { setOrganization, setUsers, setSlackChannels, setCalendarEvents } = useWorldState();

  useWebSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/state');
        if (response.ok) {
          const data = await response.json();
          if (data.organization) setOrganization(data.organization);
          if (data.users) setUsers(data.users);
          if (data.slackChannels) setSlackChannels(data.slackChannels);
          if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
        }
      } catch (error) {
        console.error('Failed to fetch initial state:', error);
      }
    };

    fetchData();
  }, [setOrganization, setUsers, setSlackChannels, setCalendarEvents]);

  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>SimulatedWorld</h1>
          <div className={styles.headerRight}>
            <UserPersonaSelector />
            <div className={styles.status}>
              <span className={styles.statusDot}></span>
              <span>Connected</span>
            </div>
          </div>
        </header>
        <div className={styles.content}>
          <DashboardContent />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
