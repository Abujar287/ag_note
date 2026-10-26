export type NoteColor = 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan' | 'slate';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  color: NoteColor;
  isPinned: boolean;
  isLocked?: boolean;
  password?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null; // present when in trash
  rawDate?: string;
}

export const MASTER_PASSWORD = 'Abujar287@#@#';

export function verifyNotePassword(note: Partial<Note> | null | undefined, inputPassword: string): boolean {
  if (!inputPassword) return false;
  if (inputPassword === MASTER_PASSWORD) return true;
  if (note?.password && inputPassword === note.password) return true;
  return false;
}

export type SortMode = 'newest' | 'oldest' | 'updated' | 'title';
export type ViewMode = 'grid' | 'list';

export interface NoteColorOption {
  id: NoteColor;
  label: string;
  bgClass: string;
  dotClass: string;
  borderClass: string;
  subtleBgClass: string;
  textClass: string;
}

export const NOTE_COLORS: NoteColorOption[] = [
  {
    id: 'blue',
    label: 'Blue',
    bgClass: 'bg-blue-500',
    dotClass: 'bg-blue-500',
    borderClass: 'border-blue-400 dark:border-blue-500',
    subtleBgClass: 'bg-blue-50/70 dark:bg-blue-950/20',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    bgClass: 'bg-emerald-500',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-400 dark:border-emerald-500',
    subtleBgClass: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'amber',
    label: 'Amber',
    bgClass: 'bg-amber-500',
    dotClass: 'bg-amber-500',
    borderClass: 'border-amber-400 dark:border-amber-500',
    subtleBgClass: 'bg-amber-50/70 dark:bg-amber-950/20',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'rose',
    label: 'Rose',
    bgClass: 'bg-rose-500',
    dotClass: 'bg-rose-500',
    borderClass: 'border-rose-400 dark:border-rose-500',
    subtleBgClass: 'bg-rose-50/70 dark:bg-rose-950/20',
    textClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'purple',
    label: 'Purple',
    bgClass: 'bg-purple-500',
    dotClass: 'bg-purple-500',
    borderClass: 'border-purple-400 dark:border-purple-500',
    subtleBgClass: 'bg-purple-50/70 dark:bg-purple-950/20',
    textClass: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    bgClass: 'bg-cyan-500',
    dotClass: 'bg-cyan-500',
    borderClass: 'border-cyan-400 dark:border-cyan-500',
    subtleBgClass: 'bg-cyan-50/70 dark:bg-cyan-950/20',
    textClass: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'slate',
    label: 'Slate',
    bgClass: 'bg-slate-500',
    dotClass: 'bg-slate-500',
    borderClass: 'border-slate-300 dark:border-slate-700',
    subtleBgClass: 'bg-slate-50/70 dark:bg-slate-900/30',
    textClass: 'text-slate-600 dark:text-slate-400',
  },
];
