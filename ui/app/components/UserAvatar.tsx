'use client';

interface UserAvatarProps {
  userId: string;
  userName: string;
  size?: 'small' | 'medium' | 'large';
  status?: 'active' | 'away' | 'offline' | 'online';
}

const AVATAR_COLORS = [
  '#4A90E2', '#7B68EE', '#E91E63', '#FF6B6B', '#FFA500',
  '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA15E',
  '#BC6C25', '#C9ADA7', '#9A8C98', '#6D6875',
];

function getAvatarColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function UserAvatar({ userId, userName, size = 'medium', status }: UserAvatarProps) {
  const sizeClass = size === 'small' ? 'small' : size === 'large' ? 'large' : '';
  const backgroundColor = getAvatarColor(userId);
  const initials = getInitials(userName);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        className={`user-avatar ${sizeClass}`}
        style={{ backgroundColor }}
        title={userName}
      >
        {initials}
      </div>
      {status && (
        <span className={`status-indicator ${status}`} />
      )}
    </div>
  );
}
