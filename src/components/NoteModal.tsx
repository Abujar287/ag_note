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

  const handleSaveAndClose = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }

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

  const handleCloseRequest = () => {
    // If it's a NEW note and has content, auto-save it
    if (!initialNote) {
      if (title.trim() || content.trim()) {
        handleSaveAndClose();
      } else {
        onClose();
      }
    } else {
      // If it's an EDITING note, we don't auto-save (as requested)
      // The user must explicitly hit save or it reverts to previous version.
      onClose();
    }
  };

  const { words, chars } = countWordsAndChars(content);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4"
      onClick={handleCloseRequest}
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-3xl bg-white sm:rounded-2xl shadow-2xl border-black/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header: Title on left, Save/Close on right */}
        <div className="px-5 py-3.5 border-b border-black/10 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-black text-base">
              {initialNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            {isLocked && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-6 py-2 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{initialNote ? 'Update' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={handleCloseRequest}
              title={initialNote ? "Discard changes" : "Close"}
              className="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-white">
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            {/* Top Row: Name and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-black/50 uppercase tracking-[0.2em] mb-1.5">
                  Name / Title
                </label>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note name (optional)..."
                  className="w-full px-4 py-2 bg-white border border-black/20 rounded-xl text-sm font-bold focus:outline-none focus:border-black text-black placeholder:text-black/30 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em]">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-[10px] text-black hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                  >
                    <Plus className="w-3 h-3" /> Manage
                  </button>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-black/20 rounded-xl text-sm font-bold focus:outline-none focus:border-black text-black cursor-pointer transition-all"
                >
                  <option value="Uncategorized">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Area - Full Width/Flex Grow */}
            <div className="flex-1 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em]">
                  Text Content
                </label>

                {/* Toolbar */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    className="p-1.5 text-black/40 hover:text-black rounded-md transition-colors cursor-pointer"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    className="p-1.5 text-black/40 hover:text-black rounded-md transition-colors cursor-pointer"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-black/5 text-black hover:bg-black/10'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'STOP' : 'VOICE'}</span>
                  </button>
                </div>
              </div>

              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                className="flex-1 w-full p-4 bg-white border border-black/10 rounded-2xl text-sm sm:text-base leading-relaxed focus:outline-none focus:border-black/30 text-black placeholder:text-black/30 resize-none transition-all font-sans"
              />

              <div className="flex justify-between items-center text-[10px] font-black text-black/40 uppercase tracking-widest mt-2 px-1">
                <div className="flex items-center gap-3">
                  <span>{words} words</span>
                  <span>{chars} chars</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${isLocked ? 'text-amber-500' : 'hover:text-black'}`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>{isLocked ? 'Locked' : 'Lock Note'}</span>
                  </button>
                  {/* Color shortcut dots */}
                  <div className="flex items-center gap-1.5">
                    {NOTE_COLORS.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.id)}
                        className={`w-3 h-3 rounded-full ${c.bgClass} transition-transform ${color === c.id ? 'ring-2 ring-black ring-offset-2 scale-125' : 'opacity-40 hover:opacity-70'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {isLocked && (
              <div className="animate-in slide-in-from-top-2 duration-200 p-4 rounded-2xl bg-black/5 border border-black/10">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-black" />
                  <span className="text-xs font-black text-black uppercase tracking-wider">Password Protection</span>
                </div>
                <div className="relative max-w-sm">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Custom password (optional)"
                    className="w-full pl-3 pr-10 py-2 bg-white border border-black/20 rounded-xl text-xs font-mono text-black focus:outline-none focus:border-black/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-black/50 mt-2 font-bold uppercase tracking-wider">
                  Master password can always unlock this note.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
