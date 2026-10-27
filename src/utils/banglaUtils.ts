/**
 * Utility functions for date formatting, text extraction, and character counting
 */

export function formatDate(isoString: string, includeTime = false): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Unknown date';

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      const timeStr = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return includeTime ? `Today at ${timeStr}` : timeStr;
    }

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    if (d.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }

    if (includeTime) {
      options.hour = 'numeric';
      options.minute = '2-digit';
      options.hour12 = true;
    }

    const formatted = d.toLocaleDateString('en-US', options);
    // Convert "Oct 26" to "oct-26" if possible
    if (!includeTime && d.getFullYear() === now.getFullYear()) {
       return formatted.replace(' ', '-').toLowerCase();
    }
    return formatted;
  } catch {
    return 'Unknown date';
  }
}

/**
 * Extracts the first non-empty line of content for ultra-compact display
 */
export function getFirstLine(text: string): string {
  if (!text) return '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines[0] || '';
}

export function countWordsAndChars(text: string): { words: number; chars: number } {
  if (!text) return { words: 0, chars: 0 };
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  return {
    words,
    chars: text.length,
  };
}
