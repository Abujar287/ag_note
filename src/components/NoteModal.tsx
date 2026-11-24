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
  Save,
  Check,
} from 'lucide-react';
import { Note, NoteColor, NOTE_COLORS } from '../types/note';
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
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState<NoteColor>('blue');
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'bn-BD' | 'en-US'>('bn-BD');

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setCategory(initialNote.category || 'General');
      setColor(initialNote.color || 'blue');
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
      setColor('blue');
    }
    setIsListening(false);
  }, [initialNote, isOpen]);

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
      alert('Your browser does not support Voice Typing. Please use Google Chrome or Edge.');
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
          setContent((prev) => (prev ? prev + ' ' + transcript : transcript));
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

  const handleSaveAndClose = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }

    onSave({
      id: initialNote?.id,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      category: category || 'General',
      color,
      isPinned: initialNote?.isPinned || false,
      isLocked: false,
    });
    onClose();
  };

  const handleCloseRequest = () => {
    // If dirty, auto-save before closing
    if (title.trim() || content.trim()) {
      handleSaveAndClose();
    } else {
      onClose();
    }
  };

  const { words, chars } = countWordsAndChars(content);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#14241D] text-[#F0F7F4] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Full-Screen Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#2D4A3D] bg-[#162920] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleCloseRequest}
            title="Save and Exit"
            className="text-[#8DA89B] hover:text-[#F0F7F4] p-2 rounded-xl hover:bg-[#244234] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm sm:text-base text-[#F0F7F4] truncate">
              {initialNote ? 'Edit Note (সম্পাদনা)' : 'New Note (নতুন নোট)'}
            </h2>
            <p className="text-[11px] text-[#8DA89B] hidden sm:block">
              Full-Screen Editor · Autosaves when exiting
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 sm:px-5 py-2 text-xs font-black uppercase tracking-wider text-[#14241D] bg-[#D4AF37] hover:bg-[#D4AF37]/90 active:scale-95 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{initialNote ? 'Update' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Title and Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-[#8DA89B] uppercase tracking-wider mb-1">
              Note Title / নাম
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title here..."
              className="w-full px-4 py-2.5 bg-[#162920] border border-[#2D4A3D] rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:border-[#D4AF37] text-[#F0F7F4] placeholder-[#8DA89B]/60 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black text-[#8DA89B] uppercase tracking-wider">
                Category
              </label>
              <button
                type="button"
                onClick={onOpenCategoryModal}
                className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
              >
                <Plus className="w-3 h-3" /> Manage
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#162920] border border-[#2D4A3D] rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#D4AF37] text-[#F0F7F4] cursor-pointer transition-all"
            >
              <option value="General">General</option>
              <option value="Uncategorized">Uncategorized</option>
              {categories
                .filter((c) => c !== 'General' && c !== 'Uncategorized')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 bg-[#162920] rounded-xl border border-[#2D4A3D]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              title="Bold"
              className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-lg transition-colors cursor-pointer"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              title="Italic"
              className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-lg transition-colors cursor-pointer"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n- ')}
              title="Bullet list"
              className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-lg transition-colors cursor-pointer"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n[ ] ')}
              title="Checkbox"
              className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-lg transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`')}
              title="Code snippet"
              className="p-1.5 text-[#8DA89B] hover:text-[#F0F7F4] hover:bg-[#244234] rounded-lg transition-colors cursor-pointer"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Typing and Color Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <select
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value as any)}
                className="bg-[#14241D] text-[#8DA89B] text-[10px] font-bold px-2 py-1 rounded-md border border-[#2D4A3D] focus:outline-none cursor-pointer"
              >
                <option value="bn-BD">বাংলা (BN)</option>
                <option value="en-US">English (EN)</option>
              </select>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-[#244234] text-[#F0F7F4] hover:bg-[#2e5241]'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Stop' : 'Voice'}</span>
              </button>
            </div>

            {/* Note Color Accent selection */}
            <div className="flex items-center gap-1 pl-2 border-l border-[#2D4A3D]">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-4 h-4 rounded-full ${c.bgClass} transition-transform ${
                    color === c.id ? 'ring-2 ring-[#D4AF37] scale-125' : 'opacity-50 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Full Height Textarea */}
        <div className="flex-1 flex flex-col min-h-[380px]">
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type or dictate your note here..."
            className="flex-1 w-full p-4 sm:p-5 bg-[#162920] border border-[#2D4A3D] rounded-2xl text-sm sm:text-base leading-relaxed focus:outline-none focus:border-[#D4AF37] text-[#F0F7F4] placeholder-[#8DA89B]/50 resize-none transition-all font-sans"
          />
        </div>

        {/* Footer Word & Char Count */}
        <div className="flex justify-between items-center text-xs font-mono text-[#8DA89B] px-1 py-1 shrink-0">
          <div className="flex items-center gap-3">
            <span>{words} words</span>
            <span>·</span>
            <span>{chars} characters</span>
          </div>
          <span className="text-[11px] text-[#8DA89B]/80 font-sans">
            Auto-saves on exit
          </span>
        </div>
      </div>
    </div>
  );
};
