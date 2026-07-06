'use client';

import { useState } from 'react';
import type { SlackChannel } from '../../types';

interface ChannelListProps {
  channels: SlackChannel[];
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function ChannelList({
  channels,
  selectedChannelId,
  onSelectChannel,
  searchQuery = '',
  onSearchChange,
}: ChannelListProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    onSearchChange?.(query);
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(localSearchQuery.toLowerCase())
  );

  const regularChannels = filteredChannels.filter(c => !c.isPrivate && !c.isDM);
  const directMessages = filteredChannels.filter(c => c.isDM);
  const privateChannels = filteredChannels.filter(c => c.isPrivate && !c.isDM);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search */}
      <div style={{ padding: '12px' }}>
        <input
          type="text"
          placeholder="Search channels..."
          value={localSearchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '13px',
          }}
        />
      </div>

      {/* Channels list */}
      <div className="channel-list">
        {/* Starred channels could go here */}

        {/* Regular channels */}
        {regularChannels.length > 0 && (
          <>
            <div className="channel-section-header">Channels</div>
            {regularChannels.map((channel) => (
              <div
                key={channel.id}
                className={`channel-item ${selectedChannelId === channel.id ? 'active' : ''}`}
                onClick={() => onSelectChannel(channel.id)}
              >
                <span style={{ fontSize: '14px' }}>#</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {channel.name}
                </span>
                {channel.unreadCount ? (
                  <span className="unread-badge">{channel.unreadCount}</span>
                ) : null}
              </div>
            ))}
          </>
        )}

        {/* Direct messages */}
        {directMessages.length > 0 && (
          <>
            <div className="channel-section-header">Direct Messages</div>
            {directMessages.map((channel) => (
              <div
                key={channel.id}
                className={`channel-item ${selectedChannelId === channel.id ? 'active' : ''}`}
                onClick={() => onSelectChannel(channel.id)}
              >
                <span style={{ fontSize: '14px' }}>👤</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {channel.name}
                </span>
                {channel.unreadCount ? (
                  <span className="unread-badge">{channel.unreadCount}</span>
                ) : null}
              </div>
            ))}
          </>
        )}

        {/* Private channels */}
        {privateChannels.length > 0 && (
          <>
            <div className="channel-section-header">Private Channels</div>
            {privateChannels.map((channel) => (
              <div
                key={channel.id}
                className={`channel-item ${selectedChannelId === channel.id ? 'active' : ''}`}
                onClick={() => onSelectChannel(channel.id)}
              >
                <span style={{ fontSize: '14px' }}>🔒</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {channel.name}
                </span>
                {channel.unreadCount ? (
                  <span className="unread-badge">{channel.unreadCount}</span>
                ) : null}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--slack-border)', fontSize: '11px', color: 'var(--slack-text-tertiary)' }}>
        + Add channel
      </div>
    </div>
  );
}
