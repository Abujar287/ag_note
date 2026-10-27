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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14241D]/80 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4"
      onClick={handleCloseRequest}
    >
      <div
        className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-3xl bg-[#162920] sm:rounded-2xl shadow-2xl border-[#244234] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header: Title on left, Save/Close on right */}
        <div className="px-5 py-3.5 border-b border-[#244234] flex items-center justify-between bg-[#162920] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#F0F7F4] text-base">
              {initialNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            {isLocked && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#F0F7F4] bg-[#244234] px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-6 py-2 text-xs font-black uppercase tracking-wider text-[#14241D] bg-[#10B981] hover:bg-[#10B981]/90 active:scale-95 rounded-xl shadow-lg shadow-[#10B981]/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{initialNote ? 'Update' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={handleCloseRequest}
              title={initialNote ? "Discard changes" : "Close"}
              className="text-[#8DA89B] hover:text-[#F0F7F4] p-2 rounded-full hover:bg-[#244234] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-[#162920]">
          <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
            {/* Top Row: Name and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-[#8DA89B] uppercase tracking-[0.2em] mb-1.5">
                  Name / Title
                </label>
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note name (optional)..."
                  className="w-full px-4 py-2 bg-[#12211A] border border-[#244234] rounded-xl text-sm font-bold focus:outline-none focus:border-[#10B981] text-[#F0F7F4] placeholder-[#8DA89B] transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black text-[#8DA89B] uppercase tracking-[0.2em]">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-[10px] text-[#F0F7F4] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                  >
                    <Plus className="w-3 h-3" /> Manage
                  </button>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-[#12211A] border border-[#244234] rounded-xl text-sm font-bold focus:outline-none focus:border-[#10B981] text-[#F0F7F4] cursor-pointer transition-all"
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
                <label className="text-[10px] font-black text-[#8DA89B] uppercase tracking-[0.2em]">
                  Text Content
                </label>

                {/* Toolbar */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] rounded-md transition-colors cursor-pointer"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] rounded-md transition-colors cursor-pointer"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-[#244234] text-[#F0F7F4] hover:bg-[#29473B]'
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
                className="flex-1 w-full p-4 bg-[#12211A] border border-[#244234] rounded-2xl text-sm sm:text-base leading-relaxed focus:outline-none focus:border-[#10B981] text-[#F0F7F4] placeholder-[#8DA89B] resize-none transition-all font-sans"
              />

              <div className="flex justify-between items-center text-[10px] font-black text-[#8DA89B] uppercase tracking-widest mt-2 px-1">
                <div className="flex items-center gap-3">
                  <span>{words} words</span>
                  <span>{chars} chars</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${isLocked ? 'text-[#10B981]' : 'hover:text-[#F0F7F4]'}`}
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
                        className={`w-5 h-5 rounded-full ${c.bgClass} transition-transform ${color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#12211A] scale-125' : 'opacity-60 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {isLocked && (
              <div className="animate-in slide-in-from-top-2 duration-200 p-4 rounded-2xl bg-[#12211A] border border-[#244234]">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-[#F0F7F4]" />
                  <span className="text-xs font-black text-[#F0F7F4] uppercase tracking-wider">Password Protection</span>
                </div>
                <div className="relative max-w-sm">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Custom password (optional)"
                    className="w-full pl-3 pr-10 py-2 bg-[#14241D] border border-[#244234] rounded-xl text-xs font-mono text-[#F0F7F4] focus:outline-none focus:border-[#10B981]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8DA89B] hover:text-[#F0F7F4] p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#8DA89B] mt-2 font-bold uppercase tracking-wider">
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
