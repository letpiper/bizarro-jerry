'use client';

import type { SlackChannel } from '../../types';

interface HeaderProps {
  channel: SlackChannel | null;
  memberCount?: number;
}

export function Header({ channel, memberCount }: HeaderProps) {
  if (!channel) {
    return (
      <div className="header">
        <div className="header-title">
          <h2>Select a channel</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="header">
      <div className="header-left">
        <span style={{ fontSize: '20px' }}>
          {channel.isPrivate ? '🔒' : channel.isDM ? '👤' : '#'}
        </span>
        <div className="header-title">
          <h2>{channel.name}</h2>
          {channel.topic && <p className="header-subtitle">{channel.topic}</p>}
        </div>
      </div>
      <div className="header-actions">
        {memberCount && (
          <span style={{ fontSize: '12px', color: 'var(--slack-text-tertiary)' }}>
            {memberCount} members
          </span>
        )}
      </div>
    </div>
  );
}
