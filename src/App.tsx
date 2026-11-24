import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  ArrowUpDown,
  Folder,
  Palette,
  Check,
  X,
} from 'lucide-react';
import { Note, NoteColor, SortMode, ViewMode } from './types/note';
import { Navbar } from './components/Navbar';
import { NoteCard } from './components/NoteCard';
import { NoteModal } from './components/NoteModal';
import { ViewNoteModal } from './components/ViewNoteModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CategoryModal } from './components/CategoryModal';
import { BatchCategoryModal } from './components/BatchCategoryModal';
import { TrashView } from './components/TrashView';
import { Toast, ToastData } from './components/Toast';
import { FloatingBatchBar } from './components/FloatingBatchBar';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { UpdateModal } from './components/UpdateModal';
import { checkForGitHubUpdate, getInstalledAppVersion } from './utils/updateManager';
import { FIXED_APPS_SCRIPT_URL, isValidAppsScriptUrl } from './config/syncConfig';

const COLOR_SWATCHES: { id: NoteColor; hex: string }[] = [
  { id: 'blue', hex: '#3B82F6' },
  { id: 'emerald', hex: '#10B981' },
  { id: 'amber', hex: '#F59E0B' },
  { id: 'rose', hex: '#F43F5E' },
  { id: 'purple', hex: '#A855F7' },
  { id: 'cyan', hex: '#06B6D4' },
  { id: 'slate', hex: '#64748B' },
];

// Permanent record of deleted note IDs so deleted notes never resurface
const getDeletedNoteIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem('smart_notepad_deleted_ids');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {
    // ignore
  }
  return new Set();
};

const addDeletedNoteIds = (ids: string[]) => {
  try {
    const current = getDeletedNoteIds();
    ids.forEach((id) => current.add(id));
    localStorage.setItem('smart_notepad_deleted_ids', JSON.stringify(Array.from(current)));
  } catch {
    // ignore
  }
};

const removeDeletedNoteIds = (ids: string[]) => {
  try {
    const current = getDeletedNoteIds();
    ids.forEach((id) => current.delete(id));
    localStorage.setItem('smart_notepad_deleted_ids', JSON.stringify(Array.from(current)));
  } catch {
    // ignore
  }
};

// Helper to reliably parse datetime of notes across various formats
export const parseNoteTimestamp = (note: Partial<Note> | null | undefined): number => {
  if (!note) return 0;
  const dates = [note.updatedAt, note.createdAt, note.rawDate];
  for (const d of dates) {
    if (!d) continue;
    const t = new Date(d).getTime();
    if (!isNaN(t)) return t;
    const parsed = Date.parse(d);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

export default function App() {
  // Helper to deduplicate notes by ID and keep them ordered by datetime DESC
  const deduplicateNotes = (noteList: Note[]): Note[] => {
    const map = new Map<string, Note>();
    noteList.forEach(n => {
      if (n && n.id) {
        const existing = map.get(n.id);
        if (!existing || parseNoteTimestamp(n) > parseNoteTimestamp(existing)) {
          map.set(n.id, n);
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => parseNoteTimestamp(b) - parseNoteTimestamp(a));
  };

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedV4 = localStorage.getItem('smart_notepad_notes_v4');
      if (savedV4 !== null) {
        const parsed = JSON.parse(savedV4);
        if (Array.isArray(parsed)) return deduplicateNotes(parsed);
      }
    } catch { /* ignore */ }
    return [];
  });

  const [trashNotes, setTrashNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('smart_notepad_trash');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateNotes(parsed);
      }
    } catch { /* ignore */ }
    return [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smart_notepad_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore */ }
    return [];
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>(() => (localStorage.getItem('smart_notepad_sort') as SortMode) || 'newest');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'this_month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [isOtherFiltersOpen, setIsOtherFiltersOpen] = useState<boolean>(false);
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState<boolean>(false);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState<boolean>(false);
  const colorPopoverRef = useRef<HTMLDivElement>(null);
  const categoryPopoverRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => (localStorage.getItem('smart_notepad_view') as ViewMode) || 'grid');
  const [isTrashView, setIsTrashView] = useState<boolean>(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(60);

  useEffect(() => {
    setDisplayLimit(60);
  }, [activeCategory, searchQuery, activeColorFilter, dateFilter, customDate, sortMode]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (colorPopoverRef.current && !colorPopoverRef.current.contains(e.target as Node)) {
        setIsColorPopoverOpen(false);
      }
      if (categoryPopoverRef.current && !categoryPopoverRef.current.contains(e.target as Node)) {
        setIsCategoryPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [updateModal, setUpdateModal] = useState<{
    isOpen: boolean;
    currentVersion: string;
    newVersion: string;
    apkUrl: string;
    apkSize: number;
  }>({
    isOpen: false,
    currentVersion: getInstalledAppVersion(),
    newVersion: getInstalledAppVersion(),
    apkUrl: '',
    apkSize: 0,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteTitle?: string;
    count?: number;
    isPermanent?: boolean;
    onConfirm: () => void;
  }>({ isOpen: false, onConfirm: () => {} });

  const [backPressCount, setBackPressCount] = useState(0);

  // Handle back button for exit confirmation (3 taps required)
  useEffect(() => {
    // Initial state to handle the first back button press
    if (window.history.state?.noBackExits !== true) {
      window.history.pushState({ noBackExits: true }, '');
    }

    const handlePopState = () => {
      const hasOpenModal = 
        isNoteModalOpen || 
        !!viewingNote || 
        isCategoryModalOpen || 
        isSettingsModalOpen || 
        isStatsModalOpen || 
        deleteModal.isOpen || 
        isBatchCategoryModalOpen ||
        updateModal.isOpen;

      if (hasOpenModal) {
        setIsNoteModalOpen(false);
        setViewingNote(null);
        setIsCategoryModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsStatsModalOpen(false);
        setDeleteModal({ isOpen: false, onConfirm: () => {} });
        setIsBatchCategoryModalOpen(false);
        setUpdateModal(prev => ({ ...prev, isOpen: false }));
        
        window.history.pushState({ noBackExits: true }, '');
        setBackPressCount(0);
        return;
      }

      if (isTrashView) {
        setIsTrashView(false);
        window.history.pushState({ noBackExits: true }, '');
        setBackPressCount(0);
        return;
      }

      // No modals open, handle exit confirmation
      setBackPressCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          // 3rd press: we don't push state, so it can exit
          showToast('অ্যাপ থেকে বের হওয়া হচ্ছে...', 'info');
          return 3;
        } else {
          showToast(`বের হতে আরও ${3 - next} বার ব্যাক বাটন চাপুন`, 'info');
          window.history.pushState({ noBackExits: true }, '');
          return next;
        }
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isNoteModalOpen, viewingNote, isCategoryModalOpen, isSettingsModalOpen, 
    isStatsModalOpen, deleteModal.isOpen, isBatchCategoryModalOpen, 
    isTrashView, updateModal.isOpen
  ]);

  // Reset back press count after 3 seconds
  useEffect(() => {
    if (backPressCount > 0 && backPressCount < 3) {
      const timer = setTimeout(() => {
        setBackPressCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [backPressCount]);

  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', onUndo?: () => void) => {
    setToast({ id: String(Date.now()), message, type, onUndo });
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('notepad_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return true;
    } catch { return true; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('notepad_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('notepad_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('smart_notepad_notes_v4', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('smart_notepad_trash', JSON.stringify(trashNotes));
  }, [trashNotes]);

  useEffect(() => {
    localStorage.setItem('smart_notepad_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('smart_notepad_sort', sortMode);
  }, [sortMode]);

  useEffect(() => {
    localStorage.setItem('smart_notepad_view', viewMode);
  }, [viewMode]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => { counts[c] = notes.filter((n) => n.category === c).length; });
    return counts;
  }, [categories, notes]);

  const uncategorizedCount = useMemo(() => notes.filter(n => !n.category || n.category.trim() === '' || n.category.toLowerCase() === 'uncategorized').length, [notes]);

  const filteredNotes = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    let result = notes.filter((note) => {
      if (activeCategory === 'uncategorized') {
        if (note.category && note.category.trim() !== '' && note.category.toLowerCase() !== 'uncategorized') return false;
      } else if (activeCategory !== 'all') {
        if (note.category !== activeCategory) return false;
      }

      if (activeColorFilter && note.color !== activeColorFilter) return false;

      if (dateFilter !== 'all') {
        const ts = parseNoteTimestamp(note);
        if (!ts) return false;
        if (dateFilter === 'today' && ts < startOfToday) return false;
        if (dateFilter === '7days' && ts < sevenDaysAgo) return false;
        if (dateFilter === '30days' && ts < thirtyDaysAgo) return false;
        if (dateFilter === 'this_month') {
          const d = new Date(ts);
          if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) return false;
        }
        if (dateFilter === 'custom' && customDate) {
          const d = new Date(ts);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          if (`${yyyy}-${mm}-${dd}` !== customDate) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (note.title || '').toLowerCase().includes(q);
        const matchesContent = (note.content || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortMode === 'oldest') {
        const timeA = parseNoteTimestamp(a);
        const timeB = parseNoteTimestamp(b);
        if (timeA !== timeB) return timeA - timeB;
        return (a.id || '').localeCompare(b.id || '');
      }
      if (sortMode === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortMode === 'updated') {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime() || parseNoteTimestamp(a);
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime() || parseNoteTimestamp(b);
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      }
      // newest first (default)
      const timeA = parseNoteTimestamp(a);
      const timeB = parseNoteTimestamp(b);
      if (timeA !== timeB) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
    return result;
  }, [notes, activeCategory, searchQuery, sortMode, activeColorFilter, dateFilter, customDate]);

  // Listen for openSettings event from other components
  useEffect(() => {
    const handleOpen = () => setIsSettingsModalOpen(true);
    window.addEventListener('openSettings', handleOpen);
    return () => window.removeEventListener('openSettings', handleOpen);
  }, []);

  const handleExportNotes = () => {
    try {
      const jsonText = JSON.stringify(notes, null, 2);
      const filename = `ag_notepad_backup_${new Date().toISOString().slice(0, 10)}.json`;
      if ((window as any).Android?.saveTextFile) {
        const saved = (window as any).Android.saveTextFile(filename, jsonText);
        if (saved) {
          showToast(`Saved to Download/${filename}`);
          return;
        }
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonText);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('নোটের JSON ব্যাকআপ ডাউনলোড হয়েছে');
    } catch {
      showToast('ব্যাকআপ তৈরিতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleImportNotes = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          const merged = deduplicateNotes([...imported, ...notes]);
          setNotes(merged);
          showToast(`${imported.length}টি নোট রিস্টোর হয়েছে`);
        } else {
          showToast('ভুল ফাইল ফরম্যাট', 'error');
        }
      } catch {
        showToast('ফাইল রিড করতে ব্যর্থ হয়েছে', 'error');
      }
    };
    reader.readAsText(file);
  };

  const [sheetsUrl, setSheetsUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('smart_notepad_sheets_url') || FIXED_APPS_SCRIPT_URL;
    } catch {
      return FIXED_APPS_SCRIPT_URL;
    }
  });
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  const handleSaveSheetsUrl = (url: string) => {
    const clean = url.trim();
    setSheetsUrl(clean);
    try {
      localStorage.setItem('smart_notepad_sheets_url', clean);
    } catch { /* ignore */ }
    showToast('Google Sheet URL saved');
  };

  const handleSyncToGoogleSheets = async (silent = false) => {
    const url = sheetsUrl || FIXED_APPS_SCRIPT_URL;
    if (!isValidAppsScriptUrl(url)) {
      if (!silent) {
        showToast('Google Apps Script URL is not configured yet. Open Settings to configure.', 'info');
      }
      return;
    }
    setIsSyncingSheets(true);
    if (!silent) showToast('Syncing with Google Sheet...', 'info');
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        if (!silent) {
          showToast('Check Apps Script doGet code or Web App URL', 'error');
        }
        setIsSyncingSheets(false);
        return;
      }

      if (Array.isArray(data)) {
        const colors: NoteColor[] = ['blue', 'emerald', 'amber', 'rose', 'purple', 'cyan', 'slate'];
        const deletedIds = getDeletedNoteIds();
        const fetchedNotes: Note[] = data
          .map((item: any, idx: number) => ({
            id: item.id || `sheet_note_${idx}_${String(item.notename || item.title || '').slice(0, 12)}`,
            title: String(item.title || item.notename || 'Untitled'),
            category: String(item.category || ''),
            content: String(item.content !== undefined && item.content !== null ? item.content : (item.note !== undefined && item.note !== null ? item.note : '')),
            color: colors[idx % colors.length],
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.datetime || new Date().toISOString(),
            isPinned: false,
            isLocked: false
          }))
          .filter((n) => !deletedIds.has(n.id));
        fetchedNotes.sort((a, b) => parseNoteTimestamp(b) - parseNoteTimestamp(a));
        setNotes(fetchedNotes);
        localStorage.setItem('smart_notepad_notes_v4', JSON.stringify(fetchedNotes));

        // Merge categories from synced notes
        const sheetCats = Array.from(
          new Set(
            fetchedNotes
              .map((n) => (n.category || '').trim())
              .filter((c) => c && c.toLowerCase() !== 'uncategorized')
          )
        );
        if (sheetCats.length > 0) {
          setCategories((prev) => Array.from(new Set([...prev, ...sheetCats])));
        }

        if (!silent) showToast(`Synced ${fetchedNotes.length} notes from Google Sheet`);
      } else {
        if (!silent) showToast('Sheet sync completed', 'info');
      }
    } catch {
      if (!silent) {
        showToast('গুগল শিটের সাথে সংযোগ করা যায়নি (Apps Script Deployment বা এক্সেস চেক করুন)', 'error');
      }
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Auto-Sync in background only if a valid Apps Script URL is configured
  useEffect(() => {
    const url = sheetsUrl || FIXED_APPS_SCRIPT_URL;
    if (!isValidAppsScriptUrl(url)) return;

    // Initial silent auto-sync
    handleSyncToGoogleSheets(true);

    // Continuous interval every 30 seconds
    const interval = setInterval(() => {
      handleSyncToGoogleSheets(true);
    }, 30000);

    // Sync on tab focus
    const onFocus = () => {
      handleSyncToGoogleSheets(true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [sheetsUrl]);

  const handleSaveNote = (noteData: any) => {
    const now = new Date().toISOString();
    let updatedNotes: Note[] = [];
    let savedNote: Note;
    if (noteData.id) {
      updatedNotes = notes.map((n) => n.id === noteData.id ? { ...n, ...noteData, updatedAt: now } : n);
      savedNote = updatedNotes.find(n => n.id === noteData.id)!;
    } else {
      const newNote: Note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...noteData,
        createdAt: now,
        updatedAt: now,
        isPinned: false
      };
      updatedNotes = [newNote, ...notes];
      savedNote = newNote;
    }
    setNotes(updatedNotes);
    showToast(noteData.id ? 'Note updated' : 'New note created');

    // Auto-sync new/updated note to Google Sheet in background if valid URL is configured
    if (isValidAppsScriptUrl(sheetsUrl)) {
      fetch(sheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datetime: new Date().toLocaleString(),
          notename: savedNote.title || 'Untitled',
          category: savedNote.category || 'General',
          note: savedNote.content || '',
          action: noteData.id ? 'UPDATE' : 'CREATE'
        })
      }).catch(() => {});
    }
  };

  const requestDeleteNote = (note: Note) => {
    setDeleteModal({
      isOpen: true,
      noteTitle: note.title,
      isPermanent: false,
      onConfirm: () => {
        addDeletedNoteIds([note.id]);
        const nextNotes = notes.filter(n => n.id !== note.id);
        setNotes(nextNotes);
        setTrashNotes(prev => [{ ...note, deletedAt: new Date().toISOString() }, ...prev]);
        showToast('Moved to Trash');
      }
    });
  };

  const handleRestoreNote = (id: string) => {
    const note = trashNotes.find(n => n.id === id);
    if (!note) return;
    removeDeletedNoteIds([id]);
    setTrashNotes(prev => prev.filter(n => n.id !== id));
    const next = [{ ...note, deletedAt: undefined }, ...notes];
    setNotes(next);
    showToast('Note restored');
  };

  const handleAddCategory = (name: string) => {
    if (!categories.includes(name)) {
      setCategories(prev => [...prev, name]);
      showToast('Category added');
    }
  };

  const handleDeleteCategory = (catName: string) => {
    setCategories(prev => prev.filter(c => c !== catName));
    setNotes(prev => prev.map(n => n.category === catName ? { ...n, category: 'Uncategorized' } : n));
    if (activeCategory === catName) setActiveCategory('all');
    showToast(`Category "${catName}" deleted`);
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    setNotes(prev => prev.map(n => n.category === oldName ? { ...n, category: newName } : n));
    if (activeCategory === oldName) setActiveCategory(newName);
    showToast('Category renamed');
  };

  const handlePermanentDelete = (note: Note) => {
    setTrashNotes(prev => prev.filter(n => n.id !== note.id));
    showToast('Note permanently deleted');
    if (isValidAppsScriptUrl(sheetsUrl)) {
      fetch(sheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notename: note.title || 'Untitled',
          action: 'DELETE'
        })
      }).catch(() => {});
    }
  };

  const handleEmptyTrash = () => {
    const notesToDelete = [...trashNotes];
    setTrashNotes([]);
    showToast('Trash emptied');
    if (isValidAppsScriptUrl(sheetsUrl) && notesToDelete.length > 0) {
      notesToDelete.forEach(note => {
        fetch(sheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notename: note.title || 'Untitled',
            action: 'DELETE'
          })
        }).catch(() => {});
      });
    }
  };

  const handleLongPressNote = (id: string) => {
    setSelectedNoteIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleBatchDelete = () => {
    if (selectedNoteIds.length === 0) return;
    const count = selectedNoteIds.length;
    setDeleteModal({
      isOpen: true,
      count,
      isPermanent: isTrashView,
      onConfirm: () => {
        if (isTrashView) {
          setTrashNotes((prev) => prev.filter((n) => !selectedNoteIds.includes(n.id)));
          showToast(`${count} notes permanently deleted`);
        } else {
          const toTrash = notes.filter((n) => selectedNoteIds.includes(n.id));
          addDeletedNoteIds(selectedNoteIds);
          setNotes((prev) => prev.filter((n) => !selectedNoteIds.includes(n.id)));
          setTrashNotes((prev) => [
            ...toTrash.map((n) => ({ ...n, deletedAt: new Date().toISOString() })),
            ...prev,
          ]);
          showToast(`Moved ${count} notes to Trash`);
        }
        setSelectedNoteIds([]);
      },
    });
  };

  const handleBatchAssignCategory = (targetCategory: string) => {
    if (selectedNoteIds.length === 0) return;
    const count = selectedNoteIds.length;
    setNotes((prev) =>
      prev.map((n) =>
        selectedNoteIds.includes(n.id)
          ? { ...n, category: targetCategory, updatedAt: new Date().toISOString() }
          : n
      )
    );
    if (!categories.includes(targetCategory) && targetCategory !== 'Uncategorized') {
      setCategories((prev) => [...prev, targetCategory]);
    }
    showToast(`Moved ${count} notes to "${targetCategory}"`);
    setSelectedNoteIds([]);
    setIsBatchCategoryModalOpen(false);
  };

  const handleCheckAppUpdate = async (forceTest = false) => {
    showToast('Checking for GitHub updates...', 'info');
    try {
      const result = await checkForGitHubUpdate(forceTest);
      if (result.updateAvailable) {
        setUpdateModal({
          isOpen: true,
          currentVersion: result.currentVersion,
          newVersion: result.newVersion,
          apkUrl: result.apkUrl,
          apkSize: result.apkSize,
        });
      } else if (result.apkMissing) {
        showToast(`Release v${result.newVersion} has no APK attached yet`, 'error');
      } else if (result.releaseMissing) {
        showToast('No GitHub Release APK published yet — push changes to GitHub to build it', 'info');
      } else {
        showToast(`App is up to date (v${result.currentVersion})`, 'info');
      }
    } catch {
      showToast('Could not check updates', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col">
      <Navbar
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        isTrashView={isTrashView}
        trashNotesCount={trashNotes.length}
        onToggleTrashView={setIsTrashView}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onSyncSheets={() => handleSyncToGoogleSheets()}
        isSyncingSheets={isSyncingSheets}
        onCheckUpdate={() => handleCheckAppUpdate()}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-5 pb-20 flex-1 w-full flex flex-col gap-3">
        <main className="flex-1 min-w-0">
          {isTrashView ? (
            <TrashView
              trashNotes={trashNotes}
              onRestoreNote={handleRestoreNote}
              onRestoreAll={() => {
                trashNotes.forEach(n => handleRestoreNote(n.id));
              }}
              onRequestPermanentDelete={handlePermanentDelete}
              onRequestEmptyTrash={handleEmptyTrash}
              onBackToNotes={() => setIsTrashView(false)}
            />
          ) : (
            <div className="space-y-3.5">
              {/* 2-Row Search & Expandable Filter Controls */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-2.5 space-y-2.5 shadow-xs">
                {/* Row 1 (Single Horizontal Row): Search input, Color filter icon, Category filter icon, Other filter icon */}
                <div className="flex flex-row items-center gap-1.5 sm:gap-2">
                  {/* 1. Search input */}
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notes..."
                      className="w-full pl-8 pr-7 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--accent-gold)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]/70 focus:outline-none transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 2. Color filter icon */}
                  <div className="relative shrink-0" ref={colorPopoverRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsColorPopoverOpen((prev) => !prev);
                        setIsCategoryPopoverOpen(false);
                      }}
                      title="Color filter"
                      aria-label="Color filter"
                      className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                        activeColorFilter || isColorPopoverOpen
                          ? 'bg-[var(--accent-gold)]/15 border-[var(--accent-gold)] text-[var(--accent-gold)]'
                          : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {activeColorFilter ? (
                        <span
                          className="w-4 h-4 rounded-full ring-1 ring-white/50"
                          style={{
                            backgroundColor:
                              COLOR_SWATCHES.find((c) => c.id === activeColorFilter)?.hex || '#3B82F6',
                          }}
                        />
                      ) : (
                        <Palette className="w-4 h-4" />
                      )}
                    </button>

                    {isColorPopoverOpen && (
                      <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-2.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveColorFilter(null);
                            setIsColorPopoverOpen(false);
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                            activeColorFilter === null
                              ? 'border-[var(--accent-gold)] text-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
                              : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          All
                        </button>
                        {COLOR_SWATCHES.map((swatch) => {
                          const isSelected = activeColorFilter === swatch.id;
                          return (
                            <button
                              key={swatch.id}
                              type="button"
                              onClick={() => {
                                setActiveColorFilter(isSelected ? null : swatch.id);
                                setIsColorPopoverOpen(false);
                              }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                                isSelected ? 'ring-2 ring-[var(--accent-gold)] ring-offset-1 ring-offset-[var(--bg-card)] scale-110' : ''
                              }`}
                              style={{ backgroundColor: swatch.hex }}
                              title={swatch.id}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Category filter icon */}
                  <div className="relative shrink-0" ref={categoryPopoverRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCategoryPopoverOpen((prev) => !prev);
                        setIsColorPopoverOpen(false);
                      }}
                      title="Category filter"
                      aria-label="Category filter"
                      className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center relative ${
                        activeCategory !== 'all' || isCategoryPopoverOpen
                          ? 'bg-[var(--accent-gold)]/15 border-[var(--accent-gold)] text-[var(--accent-gold)]'
                          : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      {activeCategory !== 'all' && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
                      )}
                    </button>

                    {isCategoryPopoverOpen && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-52 max-h-64 overflow-y-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCategory('all');
                            setSelectedNoteIds([]);
                            setIsCategoryPopoverOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold cursor-pointer ${
                            activeCategory === 'all'
                              ? 'text-[var(--accent-gold)] bg-[var(--bg-elevated)]'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <span>All Categories</span>
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">{notes.length}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCategory('uncategorized');
                            setSelectedNoteIds([]);
                            setIsCategoryPopoverOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold cursor-pointer ${
                            activeCategory === 'uncategorized'
                              ? 'text-[var(--accent-gold)] bg-[var(--bg-elevated)]'
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <span>Uncategorized</span>
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">{uncategorizedCount}</span>
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setActiveCategory(cat);
                              setSelectedNoteIds([]);
                              setIsCategoryPopoverOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold cursor-pointer ${
                              activeCategory === cat
                                ? 'text-[var(--accent-gold)] bg-[var(--bg-elevated)]'
                                : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                            }`}
                          >
                            <span className="truncate">{cat}</span>
                            <span className="font-mono text-[10px] text-[var(--text-muted)]">
                              {categoryCounts[cat] || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Other filter icon */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtherFiltersOpen((prev) => !prev);
                      setIsColorPopoverOpen(false);
                      setIsCategoryPopoverOpen(false);
                    }}
                    title="Other filter (Sort & Date)"
                    aria-label="Other filter"
                    className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                      isOtherFiltersOpen || sortMode !== 'newest' || dateFilter !== 'all'
                        ? 'bg-[var(--accent-gold)]/15 border-[var(--accent-gold)] text-[var(--accent-gold)]'
                        : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Row 2 (Expandable on clicking Other filter icon): Sort & Date filter */}
                {isOtherFiltersOpen && (
                  <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* 1. Sort */}
                    <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 min-w-0">
                      <ArrowUpDown className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0" />
                      <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as SortMode)}
                        aria-label="Sort"
                        className="w-full bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer truncate"
                      >
                        <option value="newest" className="bg-[var(--bg-card)]">Newest first</option>
                        <option value="oldest" className="bg-[var(--bg-card)]">Oldest first</option>
                        <option value="updated" className="bg-[var(--bg-card)]">Recently updated</option>
                        <option value="title" className="bg-[var(--bg-card)]">Title (A-Z)</option>
                      </select>
                    </div>

                    {/* 2. Date filter */}
                    <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        aria-label="Date filter"
                        className="w-full bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer truncate"
                      >
                        <option value="all" className="bg-[var(--bg-card)]">All Dates</option>
                        <option value="today" className="bg-[var(--bg-card)]">Today</option>
                        <option value="7days" className="bg-[var(--bg-card)]">Last 7 Days</option>
                        <option value="30days" className="bg-[var(--bg-card)]">Last 30 Days</option>
                        <option value="this_month" className="bg-[var(--bg-card)]">This Month</option>
                        <option value="custom" className="bg-[var(--bg-card)]">Specific Date</option>
                      </select>
                    </div>

                    {dateFilter === 'custom' && (
                      <div className="col-span-2 flex items-center justify-end">
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="w-full sm:w-auto bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Active Filters / Note Count Bar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {activeCategory === 'all'
                      ? 'All Notes'
                      : activeCategory === 'uncategorized'
                      ? 'Uncategorized'
                      : activeCategory}
                  </span>
                  {activeColorFilter && (
                    <button
                      type="button"
                      onClick={() => setActiveColorFilter(null)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] cursor-pointer"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            COLOR_SWATCHES.find((c) => c.id === activeColorFilter)?.hex || '#3B82F6',
                        }}
                      />
                      <span>Clear color</span>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <span className="text-xs text-[var(--text-muted)] font-semibold">{filteredNotes.length} notes</span>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-10 text-center space-y-3">
                  <p className="text-sm font-bold text-[var(--text-primary)]">No notes found</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Tap + to write a new note or tap Sync to fetch notes from Google Sheets.
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'space-y-2.5'}>
                  {filteredNotes.slice(0, displayLimit).map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      viewMode={viewMode}
                      isSelected={selectedNoteIds.includes(note.id)}
                      isSelectionActive={selectedNoteIds.length > 0}
                      onSelect={(id) => setSelectedNoteIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                      onLongPress={handleLongPressNote}
                      onView={setViewingNote}
                      onEdit={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }}
                      onDelete={requestDeleteNote}
                      onShowToast={showToast}
                    />
                  ))}
                </div>
              )}

              {filteredNotes.length > displayLimit && (
                <div className="flex justify-center pt-3 pb-6">
                  <button
                    type="button"
                    onClick={() => setDisplayLimit(prev => prev + 60)}
                    className="px-5 py-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--accent-gold)] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Load more ({filteredNotes.length - displayLimit} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <NoteModal
        isOpen={isNoteModalOpen}
        initialNote={editingNote}
        categories={categories}
        onSave={handleSaveNote}
        onClose={() => setIsNoteModalOpen(false)}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      <ViewNoteModal
        note={viewingNote}
        isOpen={!!viewingNote}
        onClose={() => setViewingNote(null)}
        onEdit={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }}
        onDelete={requestDeleteNote}
        onShowToast={showToast}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        noteTitle={deleteModal.noteTitle}
        count={deleteModal.count}
        isPermanent={deleteModal.isPermanent}
        onConfirm={deleteModal.onConfirm}
        onClose={() => setDeleteModal({ isOpen: false, onConfirm: () => {} })}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        existingCategories={categories}
        categoryCounts={categoryCounts}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <BatchCategoryModal
        isOpen={isBatchCategoryModalOpen}
        selectedCount={selectedNoteIds.length}
        categories={categories}
        categoryCounts={categoryCounts}
        onAssignCategory={handleBatchAssignCategory}
        onCreateAndAssign={(newCat) => {
          handleAddCategory(newCat);
          handleBatchAssignCategory(newCat);
        }}
        onClose={() => setIsBatchCategoryModalOpen(false)}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        notes={notes}
        trashCount={trashNotes.length}
        categoriesCount={categories.length}
        onClose={() => setIsStatsModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
        sheetsUrl={sheetsUrl}
        onSaveSheetsUrl={handleSaveSheetsUrl}
        onSyncSheets={() => handleSyncToGoogleSheets()}
        isSyncingSheets={isSyncingSheets}
        onTriggerCheckUpdate={() => handleCheckAppUpdate()}
      />

      <UpdateModal
        isOpen={updateModal.isOpen}
        currentVersion={updateModal.currentVersion}
        newVersion={updateModal.newVersion}
        apkUrl={updateModal.apkUrl}
        apkSize={updateModal.apkSize}
        onClose={() => setUpdateModal((prev) => ({ ...prev, isOpen: false }))}
        onShowToast={showToast}
      />

      {/* Floating Batch Bar (persistent when selection is active) */}
      <FloatingBatchBar
        selectedCount={selectedNoteIds.length}
        onClear={() => setSelectedNoteIds([])}
        onAssignCategory={() => setIsBatchCategoryModalOpen(true)}
        onDelete={handleBatchDelete}
      />

      {/* New Note FAB - hidden while multi-select batch bar is active */}
      {selectedNoteIds.length === 0 && (
        <button
          onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#D4AF37] text-[#14241D] flex items-center justify-center shadow-2xl hover:bg-[#D4AF37]/95 hover:scale-105 active:scale-95 transition-all cursor-pointer z-30"
          title="নতুন নোট লিখুন"
        >
          <Plus className="w-8 h-8 stroke-[2.5]" />
        </button>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
