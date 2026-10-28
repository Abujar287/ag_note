/**
 * Utility functions for datetime formatting, text extraction, and character counting
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats note datetime in standard compact format: DD-Mon-YY hh:mmA
 * Example: 27-Oct-26 11:35PM
 */
export function formatNoteDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      // If it's a pre-formatted string (like 10/26/2026 12:46:13), try Date.parse
      const parsed = Date.parse(String(dateInput));
      if (!isNaN(parsed)) {
        return formatNoteDateTime(new Date(parsed));
      }
      return String(dateInput).trim();
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()] || 'Jan';
    const year = String(d.getFullYear()).slice(-2);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${day}-${month}-${year} ${strHours}:${minutes}${ampm}`;
  } catch {
    return String(dateInput || '');
  }
}

/**
 * Always returns full Datetime (DD-Mon-YY hh:mmA)
 */
export function formatDate(isoString: string | undefined | null, _includeTime = true): string {
  if (!isoString) return '';
  return formatNoteDateTime(isoString);
}

/**
 * Extracts the first non-empty line of content for ultra-compact display
 */
export function getFirstLine(text: any): string {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const lines = str.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines[0] || '';
}

export function countWordsAndChars(text: any): { words: number; chars: number } {
  if (text === null || text === undefined) return { words: 0, chars: 0 };
  const str = String(text);
  const trimmed = str.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  return {
    words,
    chars: str.length,
  };
}
