import { formatDistanceToNow, format } from 'date-fns';

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm:ss');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm:ss');
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${(ms / 60000).toFixed(2)}m`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function truncateText(text: string, length: number): string {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
}

export function formatJSON(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

export function parseJSON(json: string): any {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'success':
    case 'confirmed':
    case 'active':
      return '#4caf50';
    case 'error':
    case 'failed':
    case 'offline':
      return '#f44336';
    case 'warning':
    case 'pending':
      return '#ff9800';
    case 'tentative':
      return '#2196f3';
    default:
      return '#808080';
  }
}

export function getIntegrationColor(integration: string): string {
  switch (integration.toLowerCase()) {
    case 'slack':
      return '#0066cc';
    case 'calendar':
    case 'google-calendar':
      return '#4285f4';
    case 'gmail':
      return '#ea4335';
    case 'linear':
      return '#5e4db2';
    case 'github':
      return '#ffffff';
    case 'salesforce':
      return '#00a1de';
    case 'docs':
    case 'google-docs':
      return '#4285f4';
    case 'granola':
      return '#ff6b6b';
    case 'todoist':
      return '#e44332';
    case 'feedbin':
      return '#4285f4';
    case 'oura':
      return '#fca311';
    case 'strava':
      return '#fc4c02';
    case 'twitter':
      return '#1da1f2';
    default:
      return '#808080';
  }
}

export function getIntegrationIcon(integration: string): string {
  // Return integration name abbreviations instead of emojis
  const abbreviations: Record<string, string> = {
    'slack': 'SL',
    'calendar': 'CA',
    'google-calendar': 'CA',
    'gmail': 'GM',
    'linear': 'LN',
    'github': 'GH',
    'salesforce': 'SF',
    'docs': 'DC',
    'google-docs': 'DC',
    'granola': 'GR',
    'todoist': 'TD',
    'feedbin': 'FB',
    'oura': 'OR',
    'strava': 'ST',
    'twitter': 'TW',
  };
  return abbreviations[integration.toLowerCase()] || integration.substring(0, 2).toUpperCase();
}

export function normalizeTimezone(tz: string): string {
  // Common timezone normalizations
  const tzMap: Record<string, string> = {
    'EST': 'America/New_York',
    'PST': 'America/Los_Angeles',
    'CST': 'America/Chicago',
    'UTC': 'UTC',
    'GMT': 'UTC',
  };
  return tzMap[tz.toUpperCase()] || tz;
}
