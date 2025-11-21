import { formatDistanceToNow } from 'date-fns';

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Formats seconds into a human-readable time format
 * @param seconds - Time in seconds
 * @param options - Formatting options
 * @returns Formatted time string
 */
export function formatTime(seconds: number, options: {
  format?: 'short' | 'long' | 'full';
  showSeconds?: boolean;
  padHours?: boolean;
} = {}): string {
  const {
    format = 'short',
    showSeconds = true,
    padHours = false
  } = options;

  if (!seconds || seconds < 0) {
    return format === 'short' ? '00:00' : '0 minutes';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (format === 'short') {
    if (hours > 0) {
      return padHours 
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return showSeconds 
      ? `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (format === 'long') {
    const parts = [];
    
    if (hours > 0) {
      parts.push(hours === 1 ? '1 hour' : `${hours} hours`);
    }
    
    if (minutes > 0) {
      parts.push(minutes === 1 ? '1 minute' : `${minutes} minutes`);
    }
    
    if (secs > 0 && showSeconds) {
      parts.push(secs === 1 ? '1 second' : `${secs} seconds`);
    }
    
    return parts.length > 0 ? parts.join(', ') : '0 seconds';
  }

  if (format === 'full') {
    const parts = [];
    
    if (hours > 0) {
      parts.push(hours === 1 ? '1 hour' : `${hours} hours`);
    }
    
    if (minutes > 0) {
      parts.push(minutes === 1 ? '1 minute' : `${minutes} minutes`);
    }
    
    if (showSeconds && secs > 0) {
      parts.push(secs === 1 ? '1 second' : `${secs} seconds`);
    }
    
    if (parts.length === 0) return '0 seconds';
    
    if (parts.length === 1) return parts[0];
    
    const lastPart = parts.pop();
    return `${parts.join(', ')} and ${lastPart}`;
  }

  // Default fallback
  return formatTime(seconds, { format: 'short' });
}

/**
 * Formats a duration specifically for progress display
 * @param seconds - Time in seconds
 * @returns Formatted duration string for progress
 */
export function formatProgressTime(seconds: number): string {
  return formatTime(seconds, { format: 'short', showSeconds: true, padHours: true });
}

/**
 * Formats a duration for analytics display
 * @param seconds - Time in seconds
 * @returns Formatted duration string for analytics
 */
export function formatAnalyticsTime(seconds: number): string {
  return formatTime(seconds, { format: 'long', showSeconds: false });
}

/**
 * Calculates completion percentage
 * @param current - Current progress
 * @param total - Total required
 * @returns Percentage (0-100)
 */
export function calculatePercentage(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

/**
 * Gets progress level based on percentage
 * @param percentage - Completion percentage
 * @returns Progress level
 */
export function getProgressLevel(percentage: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (percentage < 25) return 'beginner';
  if (percentage < 50) return 'intermediate';
  if (percentage < 75) return 'advanced';
  return 'expert';
}