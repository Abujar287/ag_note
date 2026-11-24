import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Trash2,
  Copy,
  Check,
  Clock,
  Folder,
  ChevronDown,
  Edit3,
  Palette,
} from 'lucide-react';
import { Note, NoteColor, NOTE_COLORS } from '../types/note';
import { formatDate } from '../utils/banglaUtils';

interface ViewNoteModalProps {
  note: Note | null;
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onUpdateNoteMeta: (id: string, updates: { category?: string; color?: NoteColor }) => void;
  onShowToast: (msg: string) => void;
}

function renderFormattedLine(line: string, lineIdx: number, isLast: boolean): React.ReactNode {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = line.split(tokenRegex);

  return (
    <React.Fragment key={lineIdx}>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={idx} className="font-bold text-[var(--text-primary)]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return (
            <em key={idx} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
      {!isLast ? '\n' : null}
    </React.Fragment>
  );
}

export const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  note,
  isOpen,
  categories,
  onClose,
  onEdit,
  onDelete,
  onUpdateNoteMeta,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsColorOpen(false);
    setCopied(false);
  }, [isOpen, note?.id]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setIsColorOpen(false);
      }
    };
    if (isColorOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isColorOpen]);

  if (!isOpen || !note) return null;

  const colorConfig = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
  const displayTitle = note.title && note.title.trim() ? note.title.trim() : 'Unknown Title';
  const displayCategory = note.category && note.category.trim() ? note.category.trim() : 'General';
  const createdDateTime = formatDate(note.createdAt || note.rawDate || note.updatedAt, true);

  const categoryOptions = Array.from(
    new Set([
      'General',
      'Uncategorized',
      ...categories,
      ...(note.category ? [note.category] : []),
    ])
  );

  const handleCopy = () => {
    const fullText = note.title && note.title.trim() ? `${note.title}\n\n${note.content}` : note.content;
    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        setCopied(true);
        onShowToast('Note copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        onShowToast('Could not copy note');
      });
  };

  const handleOpenEditor = () => {
    onClose();
    onEdit(note);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className={`h-1.5 w-full ${colorConfig.bgClass} transition-colors duration-200 shrink-0`} />

        {/* Subtle Editorial Header Strip */}
        <div className="px-5 sm:px-7 pt-3.5 pb-2 flex items-center justify-between gap-3 bg-[var(--bg-card)] shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span className={`w-2 h-2 rounded-full ${colorConfig.dotClass}`} />
            <span>Note Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenEditor}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              title="Tap note to edit"
            >
              <Edit3 className="w-3 h-3" />
              <span>Tap note to edit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 -mr-1.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title & Structured Metadata Bar */}
        <div className="px-5 sm:px-7 pb-4 border-b border-[var(--border)] bg-[var(--bg-card)] space-y-3.5 shrink-0">
          <h2
            onClick={handleOpenEditor}
            className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] leading-snug tracking-tight cursor-pointer break-words hover:text-[var(--accent-gold)] transition-colors"
          >
            {displayTitle}
          </h2>

          {/* Metadata Row: Category dropdown | Created Datetime | Colour */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {/* Category dropdown (full name, no clipping) */}
              <div className="relative inline-flex items-center bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent-gold)] rounded-xl px-3 py-1.5 transition-colors max-w-full">
                <Folder className="w-3.5 h-3.5 text-[var(--accent-gold)] mr-1.5 shrink-0" />
                <select
                  value={displayCategory}
                  onChange={(e) => onUpdateNoteMeta(note.id, { category: e.target.value })}
                  aria-label="Category"
                  className="appearance-none bg-transparent pr-5 text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer max-w-full"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none -ml-4 shrink-0" />
              </div>

              {/* Created Datetime */}
              <div className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums text-[var(--text-muted)] bg-[var(--bg-elevated)]/80 px-3 py-1.5 rounded-xl border border-[var(--border)]">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                <span>{createdDateTime}</span>
              </div>
            </div>

            {/* Colour selector */}
            <div className="relative shrink-0" ref={colorPickerRef}>
              <button
                type="button"
                onClick={() => setIsColorOpen((prev) => !prev)}
                title="Change colour"
                aria-label="Note colour"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent-gold)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <span className={`w-3.5 h-3.5 rounded-full ${colorConfig.bgClass} ring-1 ring-black/15`} />
                <Palette className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[11px] text-[var(--text-muted)]">{colorConfig.label}</span>
              </button>

              {isColorOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-2.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                  {NOTE_COLORS.map((c) => {
                    const active = note.color === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onUpdateNoteMeta(note.id, { color: c.id });
                          setIsColorOpen(false);
                        }}
                        className={`w-6 h-6 rounded-full ${c.bgClass} flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                          active ? 'ring-2 ring-[var(--accent-gold)] ring-offset-2 ring-offset-[var(--bg-card)] scale-110' : ''
                        }`}
                        title={c.label}
                      >
                        {active && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reading Canvas (click anywhere to open full-page Editor) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--bg-main)]/45">
          <div
            onClick={handleOpenEditor}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenEditor();
              }
            }}
            title="Click to edit note"
            className="min-h-[220px] rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]/80 hover:border-[var(--accent-gold)]/50 p-4 sm:p-6 shadow-xs cursor-text transition-colors"
          >
            {note.content ? (
              <div className="text-[var(--text-primary)] text-[15px] sm:text-base leading-7 whitespace-pre-wrap font-normal break-words">
                {note.content.split('\n').map((line, idx, arr) =>
                  renderFormattedLine(line, idx, idx === arr.length - 1)
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">
                Tap here to write your note...
              </p>
            )}
          </div>
        </div>

        {/* Bottom Actions: ONLY Copy & Remove */}
        <div className="px-5 sm:px-7 py-3.5 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-card)] hover:border-[var(--accent-gold)] rounded-xl border border-[var(--border)] transition-colors cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(note);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/30 transition-colors cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};
