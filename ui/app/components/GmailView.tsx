'use client';

import { useWorldState } from '../hooks/useWorldState';

export function GmailView() {
  const { gmailMessages } = useWorldState();

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--slack-bg-primary)',
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--slack-border)',
        background: 'var(--slack-bg-secondary)',
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Email</h2>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--slack-text-tertiary)' }}>
          {gmailMessages.length} messages
        </p>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
      }}>
        {gmailMessages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--slack-text-tertiary)',
            paddingTop: '40px',
          }}>
            <p>No messages yet</p>
          </div>
        ) : (
          gmailMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: '12px',
                background: 'var(--slack-bg-secondary)',
                borderRadius: '4px',
                marginBottom: '8px',
                borderLeft: '3px solid #ea4335',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--slack-text-primary)' }}>
                {msg.subject}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--slack-text-tertiary)', marginBottom: '8px' }}>
                {msg.from} to {msg.to.join(', ')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--slack-text-secondary)', wordBreak: 'break-word' }}>
                {msg.body.substring(0, 100)}...
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
