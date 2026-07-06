'use client';

import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import type { SlackMessage, User } from '../../types';

interface MessageListProps {
  messages: SlackMessage[];
  users: User[];
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function MessageList({
  messages,
  users,
  onReply,
  onReact,
  loading,
  emptyMessage = 'No messages yet',
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px' }}>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          user={getUserById(message.userId)}
          onReply={onReply}
          onReact={onReact}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
