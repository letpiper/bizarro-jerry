'use client';

import { formatTime } from '../utils/formatting';
import { UserAvatar } from './UserAvatar';
import type { SlackMessage, User } from '../../types';

interface MessageItemProps {
  message: SlackMessage;
  user: User | undefined;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageItem({ message, user, onReply, onReact }: MessageItemProps) {
  if (!user) return null;

  return (
    <div className="message">
      <UserAvatar
        userId={user.id}
        userName={user.name}
        size="medium"
        status={user.status}
      />
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">{user.name}</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {message.edited && (
            <span className="message-edited">(edited)</span>
          )}
        </div>
        <div className="message-text">{message.text}</div>

        {message.reactions && message.reactions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
            {message.reactions.map((reaction) => (
              <div
                key={reaction.name}
                className="reaction"
                onClick={() => onReact?.(message.id, reaction.name)}
                title={reaction.users.join(', ')}
              >
                :{reaction.name}:
                {reaction.count > 1 && <span>{reaction.count}</span>}
              </div>
            ))}
          </div>
        )}

        {message.files && message.files.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            {message.files.map((file) => (
              <div key={file.id} style={{ color: 'var(--slack-blue)', cursor: 'pointer' }}>
                📎 {file.name}
              </div>
            ))}
          </div>
        )}

        {message.replyCount && message.replyCount > 0 && (
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: 'var(--slack-blue)',
              cursor: 'pointer',
            }}
            onClick={() => onReply?.(message.id)}
          >
            {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
          </div>
        )}
      </div>
    </div>
  );
}
