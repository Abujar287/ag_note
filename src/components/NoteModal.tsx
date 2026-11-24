import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bold, Italic } from 'lucide-react';
import { Note, NoteColor } from '../types/note';

interface NoteModalProps {
  isOpen: boolean;
  initialNote: Note | null;
  onSave: (noteData: {
    id?: string;
    title: string;
    content: string;
    category: string;
    color: NoteColor;
    isPinned?: boolean;
    isLocked?: boolean;
  }) => void;
  onClose: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  initialNote,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setTimeout(() => {
        const el = contentRef.current;
        if (el) {
          el.focus();
          const len = el.value.length;
          el.setSelectionRange(len, len);
        }
      }, 30);
    } else {
      setTitle('');
      setContent('');
      setTimeout(() => {
        titleRef.current?.focus();
      }, 30);
    }
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const insertFormatting = (prefix: string, suffix: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const inserted = selectedText || 'text';
    const newContent = `${beforeText}${prefix}${inserted}${suffix}${afterText}`;
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + inserted.length
      );
    }, 10);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }

    onSave({
      id: initialNote?.id,
      title: title.trim(),
      content: content.trim(),
      category: initialNote?.category || 'General',
      color: initialNote?.color || 'blue',
      isPinned: false,
      isLocked: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Top Bar: Left = Back button | Right = Cancel & Save buttons */}
      <div className="px-3 sm:px-5 h-14 border-b border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 sm:px-4 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 sm:px-5 py-2 text-xs font-black text-[var(--accent-contrast)] bg-[var(--accent-gold)] hover:opacity-90 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            Save
          </button>
        </div>
      </div>

      {/* Single Row: Bold & Italic only */}
      <div className="px-4 sm:px-6 py-1.5 border-b border-[var(--border)] bg-[var(--bg-card)]/60 flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**')}
          title="Bold"
          aria-label="Bold"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors cursor-pointer"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*', '*')}
          title="Italic"
          aria-label="Italic"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors cursor-pointer"
        >
          <Italic className="w-4 h-4" />
        </button>
      </div>

      {/* Clean Full-Page Note Writing Surface */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 overflow-hidden">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title..."
          className="w-full pb-3 mb-3 bg-transparent border-b border-[var(--border)]/60 text-lg sm:text-xl font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent-gold)] transition-colors shrink-0"
        />

        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          className="flex-1 w-full bg-transparent text-sm sm:text-base leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-muted)]/50 focus:outline-none resize-none font-sans"
        />
      </div>
    </div>
  );
};
