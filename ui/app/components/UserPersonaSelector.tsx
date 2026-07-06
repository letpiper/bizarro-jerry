'use client';

import { useState } from 'react';
import { useWorldState } from '../hooks/useWorldState';
import styles from '../user-selector.module.css';

export function UserPersonaSelector() {
  const {
    users,
    currentUserPersona,
    masterViewMode,
    setCurrentUserPersona,
    setMasterViewMode,
  } = useWorldState();

  const [isOpen, setIsOpen] = useState(false);

  const getAvatarColor = (user: typeof users[0]) => {
    return user.color || '#611f69';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handlePersonaSelect = (user: typeof users[0] | null) => {
    if (user === null) {
      setMasterViewMode(true);
    } else {
      setCurrentUserPersona(user);
      setMasterViewMode(false);
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        title={
          masterViewMode
            ? 'Master View - Seeing all data'
            : `Viewing as: ${currentUserPersona?.name}`
        }
      >
        <div
          className={styles.avatar}
          style={{
            backgroundColor: masterViewMode ? '#611f69' : getAvatarColor(currentUserPersona!),
          }}
        >
          {masterViewMode ? 'M' : getInitials(currentUserPersona?.name || '')}
        </div>
        <div className={styles.info}>
          <div className={styles.label}>
            {masterViewMode ? 'Master View' : currentUserPersona?.name}
          </div>
          <div className={styles.value}>
            {masterViewMode ? 'All Data' : currentUserPersona?.role || 'Unknown'}
          </div>
        </div>
        <span className={styles.chevron}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* Master View Option */}
          <div
            className={`${styles.option} ${masterViewMode ? styles.active : ''}`}
            onClick={() => handlePersonaSelect(null)}
          >
            <div className={styles.optionAvatar} style={{ backgroundColor: '#611f69' }}>
              M
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionName}>Master View</div>
              <div className={styles.optionDescription}>
                See all channels, emails, and events
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          {/* User Options */}
          {users.map((user) => (
            <div
              key={user.id}
              className={`${styles.option} ${
                !masterViewMode && currentUserPersona?.id === user.id
                  ? styles.active
                  : ''
              }`}
              onClick={() => handlePersonaSelect(user)}
            >
              <div
                className={styles.optionAvatar}
                style={{ backgroundColor: getAvatarColor(user) }}
              >
                {getInitials(user.name)}
              </div>
              <div className={styles.optionContent}>
                <div className={styles.optionName}>{user.name}</div>
                <div className={styles.optionDescription}>{user.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
