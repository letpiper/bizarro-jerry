'use client';

import { useState, useEffect } from 'react';
import { useWorldState } from '../hooks/useWorldState';
import { ChannelList } from './ChannelList';
import { Header } from './Header';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import type { SlackMessage } from '../../types';

export function SlackView() {
  const {
    slackChannels,
    slackMessages,
    slackSelectedChannelId,
    setSlackSelectedChannel,
    users,
    currentUserPersona,
    masterViewMode,
  } = useWorldState();

  const [filteredMessages, setFilteredMessages] = useState<SlackMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelSearchQuery, setChannelSearchQuery] = useState('');

  // Filter channels based on persona
  const visibleChannels = masterViewMode
    ? slackChannels
    : slackChannels.filter(
        (c) =>
          !c.isPrivate ||
          (c.members && c.members.includes(currentUserPersona?.id || ''))
      );

  const selectedChannel = visibleChannels.find((c) => c.id === slackSelectedChannelId);

  // Auto-select first channel
  useEffect(() => {
    if (!slackSelectedChannelId && slackChannels.length > 0) {
      setSlackSelectedChannel(slackChannels[0].id);
    }
  }, [slackChannels, slackSelectedChannelId, setSlackSelectedChannel]);

  // Filter and sort messages
  useEffect(() => {
    let messages = slackMessages.filter(
      (m) => m.channelId === slackSelectedChannelId
    );

    if (searchQuery) {
      messages = messages.filter((m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setFilteredMessages(messages);
  }, [slackMessages, slackSelectedChannelId, searchQuery]);

  const handleSendMessage = (message: string) => {
    if (selectedChannel) {
      console.log(`Sending message to ${selectedChannel.name}: ${message}`);
      // In a real app, this would send to the backend
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Left Sidebar - Channel List */}
      <ChannelList
        channels={slackChannels}
        selectedChannelId={slackSelectedChannelId}
        onSelectChannel={setSlackSelectedChannel}
        searchQuery={channelSearchQuery}
        onSearchChange={setChannelSearchQuery}
      />

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Channel Header */}
        <Header
          channel={selectedChannel || null}
          memberCount={selectedChannel?.members.length}
        />

        {/* Message Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--slack-border)' }}>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '13px',
            }}
          />
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--slack-bg-primary)' }}>
          <MessageList
            messages={filteredMessages}
            users={users}
            emptyMessage={searchQuery ? 'No messages match your search' : 'No messages yet'}
          />
        </div>

        {/* Message Composer */}
        {selectedChannel ? (
          <MessageComposer
            onSendMessage={handleSendMessage}
            placeholder={`Message #${selectedChannel.name}`}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--slack-text-tertiary)' }}>
            <p>Select a channel to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
