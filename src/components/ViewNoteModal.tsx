import React, { useState } from 'react';
import {
  X,
  Edit3,
  Trash2,
  Copy,
  Check,
  Download,
  Calendar,
  Clock,
} from 'lucide-react';
import { Note, NOTE_COLORS } from '../types/note';
import { formatDate, countWordsAndChars } from '../utils/banglaUtils';

interface ViewNoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onShowToast: (msg: string) => void;
  // Optional legacy props
  onTogglePin?: (id: string) => void;
  onToggleLockNote?: (note: Note) => void;
  onRelockNote?: (id: string) => void;
}

export const ViewNoteModal: React.FC<ViewNoteModalProps> = ({
  note,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !note) return null;

  const colorConfig = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
  const { words, chars } = countWordsAndChars(note.content);

  const handleCopy = () => {
    const fullText = note.title ? `${note.title}\n\n${note.content}` : note.content;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      onShowToast('Note copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      onShowToast('Could not copy note');
    });
  };

  const handleDownloadTxt = () => {
    const fullText = `Title: ${note.title || 'Untitled'}\nCategory: ${note.category || 'General'}\nDate: ${formatDate(
      note.createdAt,
      true
    )}\n\n${note.content}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(note.title || 'Note').slice(0, 30).replace(/[^\w\u0980-\u09FF]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Note downloaded as text file');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#162920] rounded-2xl shadow-2xl border border-[#2D4A3D] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent line */}
        <div className={`h-1.5 w-full ${colorConfig.bgClass}`} />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#2D4A3D] space-y-2.5 bg-[#14241D]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#8DA89B] flex-wrap">
                <span className="font-bold text-[#D4AF37] uppercase tracking-wider bg-[#162920] px-2 py-0.5 rounded border border-[#2D4A3D]">
                  {note.category || 'General'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-[#8DA89B]" />
                  {formatDate(note.createdAt)}
                </span>
                {note.updatedAt && note.updatedAt !== note.createdAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums text-[#8DA89B]">
                      <Clock className="w-3.5 h-3.5" />
                      Updated: {formatDate(note.updatedAt)}
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#F0F7F4] mt-2.5 leading-tight">
                {note.title || 'Untitled Note'}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[#8DA89B] hover:text-[#F0F7F4] p-2 rounded-xl hover:bg-[#244234] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#162920]">
          <div className="text-[#F0F7F4] text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal selection:bg-[#D4AF37]/30">
            {note.content || '(Empty note)'}
          </div>
        </div>

        {/* Footer & Actions: ONLY Copy, Download, Edit, Delete */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#14241D] border-t border-[#2D4A3D] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#8DA89B] font-mono tabular-nums">
            {words} words · {chars} chars
          </div>

          <div className="flex items-center gap-2">
            {/* Copy */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#F0F7F4] hover:bg-[#244234] rounded-xl border border-[#2D4A3D] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8DA89B]" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Download TXT */}
            <button
              type="button"
              onClick={handleDownloadTxt}
              title="Download as TXT file"
              className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-xl border border-[#2D4A3D] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(note);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#14241D] bg-[#D4AF37] hover:bg-[#D4AF37]/90 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* Remove / Delete */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(note);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
