import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Bold,
  Italic,
  List,
  CheckSquare,
  Code,
  Plus,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { Note, NoteColor, NOTE_COLORS, MASTER_PASSWORD } from '../types/note';
import { countWordsAndChars } from '../utils/banglaUtils';

interface NoteModalProps {
  isOpen: boolean;
  initialNote: Note | null;
  categories: string[];
  onSave: (noteData: {
    id?: string;
    title: string;
    content: string;
    category: string;
    color: NoteColor;
    isPinned?: boolean;
    isLocked?: boolean;
    password?: string;
  }) => void;
  onClose: () => void;
  onOpenCategoryModal: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  initialNote,
  categories,
  onSave,
  onClose,
  onOpenCategoryModal,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [color, setColor] = useState<NoteColor>('blue');
  const [isLocked, setIsLocked] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'bn-BD' | 'en-US'>('en-US');

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setCategory(initialNote.category || 'Uncategorized');
      setColor(initialNote.color || 'blue');
      setIsLocked(Boolean(initialNote.isLocked));
      setCustomPassword(initialNote.password || '');
    } else {
      setTitle('');
      setContent('');
      setCategory('Uncategorized');
      setColor('blue');
      setIsLocked(false);
      setCustomPassword('');
    }
    setShowPassword(false);
    setIsListening(false);
  }, [initialNote, isOpen, categories]);

  // Clean up speech recognition on close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  // Text formatting helpers
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newContent = `${beforeText}${prefix}${selectedText || 'text'}${suffix}${afterText}`;
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 4)
      );
    }, 10);
  };

  // Voice Typing (Speech Recognition)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support Voice Typing. Please try Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setContent((prev) => (prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSave({
      id: initialNote?.id,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      category: category || 'Uncategorized',
      color,
      isPinned: initialNote?.isPinned ?? false,
      isLocked,
      password: isLocked ? (customPassword.trim() || MASTER_PASSWORD) : undefined,
    });
    onClose();
  };

  const { words, chars } = countWordsAndChars(content);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {initialNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            {isLocked && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title (English or বাংলা)..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
            />
          </div>

          {/* Category & Color Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </label>
                <button
                  type="button"
                  onClick={onOpenCategoryModal}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <Plus className="w-3 h-3" /> Manage
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="Uncategorized">Uncategorized (No category)</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Color Accent
              </label>
              <div className="flex items-center gap-2 pt-1">
                {NOTE_COLORS.map((c) => {
                  const isSelected = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      title={c.label}
                      onClick={() => setColor(c.id)}
                      className={`w-7 h-7 rounded-full ${c.bgClass} transition-transform flex items-center justify-center text-white cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-offset-slate-900 scale-110'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {isSelected && <span className="text-xs font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Password Protection & Lock Settings */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 dark:border-slate-700 focus:ring-amber-500/20 cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className={`w-3.5 h-3.5 ${isLocked ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>Lock this note with password</span>
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                {isLocked ? 'Hidden from view' : 'Public'}
              </span>
            </div>

            {isLocked && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Custom Password (optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter custom password (or leave blank for master)"
                    className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Leave blank to protect with master password. Master password can always unlock this note.</span>
                </div>
              </div>
            )}
          </div>

          {/* Content with Format Toolbar & Voice Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Note Content
              </label>

              {/* Formatting Toolbar & Voice Input */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Bold"
                  onClick={() => insertFormatting('**', '**')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Italic"
                  onClick={() => insertFormatting('*', '*')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="List"
                  onClick={() => insertFormatting('\n- ')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Checklist"
                  onClick={() => insertFormatting('\n- [ ] ')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Code"
                  onClick={() => insertFormatting('`', '`')}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* Voice Typing Button with Language Selector */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSpeechLang(speechLang === 'en-US' ? 'bn-BD' : 'en-US')}
                    className="text-[11px] font-semibold px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    title="Switch speech language"
                  >
                    {speechLang === 'en-US' ? 'EN' : 'বাংলা'}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    title={isListening ? 'Stop voice typing' : 'Start voice typing'}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-blue-500" />
                        <span>Voice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <textarea
              ref={contentRef}
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your note here... (Bengali বাংলা and English both supported)"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none transition-colors"
            />

            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Supports **bold**, *italic*, - [ ] tasks</span>
              <span className="font-mono tabular-nums">
                {words} words · {chars} chars
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
