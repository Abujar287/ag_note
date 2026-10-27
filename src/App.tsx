import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  FolderOpen,
  Pin,
  Trash2,
  CheckSquare,
  Square,
  HelpCircle,
  Lock,
  Folder,
  X,
} from 'lucide-react';
import { Note, SortMode, ViewMode, MASTER_PASSWORD } from './types/note';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { NoteModal } from './components/NoteModal';
import { ViewNoteModal } from './components/ViewNoteModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CategoryModal } from './components/CategoryModal';
import { BatchCategoryModal } from './components/BatchCategoryModal';
import { PasswordModal } from './components/PasswordModal';
import { TrashView } from './components/TrashView';
import { Toast, ToastData } from './components/Toast';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { FloatingBatchBar } from './components/FloatingBatchBar';
import { SettingsModal } from './components/SettingsModal';
import importedNotesRaw from './data/importedNotes.json';
import { initAuth, googleSignIn, getAccessToken, clearAccessToken } from './utils/auth';
import { User } from 'firebase/auth';

const DEFAULT_CATEGORIES = ['General', 'Personal', 'Work', 'Bajar', 'Accounts', 'Links'];

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

const addDeletedNoteIds = (ids: string[], notes: Note[]) => {
  try {
    const current = getDeletedNoteIds();
    ids.forEach((id) => {
      current.add(id);
      // Also track by composite key for sheet sync
      const note = notes.find(n => n.id === id);
      if (note) {
        const compositeKey = `del_${note.title}_${note.content.substring(0, 50)}`;
        current.add(compositeKey);
      }
    });
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

export default function App() {
  // Primary States: Initializing with persistent storage and deleted IDs filtering
  // Helper to deduplicate notes by ID
  const deduplicateNotes = (noteList: Note[]): Note[] => {
    const map = new Map<string, Note>();
    noteList.forEach(n => {
      if (n && n.id) {
        // If duplicate ID, keep the one with newer updatedAt
        const existing = map.get(n.id);
        if (!existing || new Date(n.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
          map.set(n.id, n);
        }
      }
    });
    return Array.from(map.values());
  };

  // Primary States: Initializing with persistent storage and deleted IDs filtering
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const deletedIds = getDeletedNoteIds();
      const isInitialized = localStorage.getItem('smart_notepad_initialized_v4');
      const savedV4 = localStorage.getItem('smart_notepad_notes_v4');

      let initialList: Note[] = [];

      if (isInitialized && savedV4 !== null) {
        const parsed = JSON.parse(savedV4);
        if (Array.isArray(parsed)) {
          initialList = parsed;
        }
      } else {
        // Migration / Initial import
        const savedV3 = localStorage.getItem('smart_notepad_notes_v3');
        if (savedV3) {
          try {
            const parsedV3 = JSON.parse(savedV3);
            if (Array.isArray(parsedV3)) {
              initialList = parsedV3;
            }
          } catch {
            // ignore
          }
        }

        if (initialList.length === 0 && !isInitialized) {
          initialList = (importedNotesRaw as Note[]).map((n) => ({
            ...n,
            category: n.category || 'Uncategorized',
          }));
        }
      }

      // Filter out deleted notes and deduplicate
      const filtered = initialList.filter((n: Note) => !deletedIds.has(n.id));
      const deduped = deduplicateNotes(filtered);
      
      localStorage.setItem('smart_notepad_notes_v4', JSON.stringify(deduped));
      localStorage.setItem('smart_notepad_initialized_v4', 'true');
      return deduped;
    } catch {
      return [];
    }
  });

  const [trashNotes, setTrashNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('smart_notepad_trash');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateNotes(parsed);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smart_notepad_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // UI state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    return (localStorage.getItem('smart_notepad_sort') as SortMode) || 'newest';
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('smart_notepad_view') as ViewMode) || 'grid';
  });
  const [isTrashView, setIsTrashView] = useState<boolean>(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);

  // Password Unlock State (Set of note IDs unlocked in current session)
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const FIXED_SHEET_ID = '1J6xput_hnyroayLrDKJn-mGYn0xDLqTEs_gSrLzWJJI';
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('smart_notepad_last_sync'));
  const [isSyncing, setIsSyncing] = useState(false);

  // Password Unlock Modal state
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    note: Note | null;
    targetAction?: 'view' | 'edit';
  }>({
    isOpen: false,
    note: null,
    targetAction: 'view',
  });

  // Auth State
  const [needsAuth, setNeedsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setUser(user);
        setNeedsAuth(false);
        // Initial sync on mount if logged in
        setTimeout(() => handleSync(true), 2000);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await googleSignIn();
      setNeedsAuth(false);
    } catch (err) {
      showToast('Login failed', 'error');
    }
  };

  // Delete Confirmation Modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteTitle?: string;
    count?: number;
    isPermanent?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    onConfirm: () => {},
  });

  // Toast state
  const [toast, setToast] = useState<ToastData | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('notepad_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Dark Mode Synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('notepad_theme', 'dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist Notes
  useEffect(() => {
    try {
      localStorage.setItem('smart_notepad_notes_v4', JSON.stringify(notes));
      localStorage.setItem('smart_notepad_notes_v3', JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  // Persist Trash
  useEffect(() => {
    try {
      localStorage.setItem('smart_notepad_trash', JSON.stringify(trashNotes));
    } catch {
      // ignore
    }
  }, [trashNotes]);

  // Persist Categories
  useEffect(() => {
    try {
      localStorage.setItem('smart_notepad_categories', JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  // Persist Preferences
  useEffect(() => {
    localStorage.setItem('smart_notepad_sort', sortMode);
  }, [sortMode]);

  useEffect(() => {
    localStorage.setItem('smart_notepad_view', viewMode);
  }, [viewMode]);

  // Global Keyboard Shortcuts (Ctrl+N, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingNote(null);
        setIsNoteModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    (window as any)._triggerOpenSettings = () => setIsSettingsModalOpen(true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete (window as any)._triggerOpenSettings;
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', onUndo?: () => void) => {
    setToast({
      id: String(Date.now()),
      message,
      type,
      onUndo,
    });
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => {
      counts[c] = notes.filter((n) => n.category === c).length;
    });
    return counts;
  }, [categories, notes]);

  // Specific counts for special views
  const uncategorizedCount = useMemo(() => {
    return notes.filter(
      (n) => !n.category || n.category.trim() === '' || n.category.toLowerCase() === 'uncategorized'
    ).length;
  }, [notes]);

  const lockedNotesCount = useMemo(() => {
    return notes.filter((n) => n.isLocked).length;
  }, [notes]);

  // Filtered and Sorted Notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => {
      // Category filter
      if (activeCategory === 'pinned') {
        if (!note.isPinned) return false;
      } else if (activeCategory === 'uncategorized') {
        if (note.category && note.category.trim() !== '' && note.category.toLowerCase() !== 'uncategorized') {
          return false;
        }
      } else if (activeCategory === 'locked') {
        if (!note.isLocked) return false;
      } else if (activeCategory !== 'all') {
        if (note.category !== activeCategory) return false;
      }

      // Color filter
      if (activeColorFilter && note.color !== activeColorFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        // If note is locked and not unlocked, don't match hidden content
        const isNoteUnlocked = unlockedNoteIds.has(note.id);
        if (note.isLocked && !isNoteUnlocked) {
          return 'locked'.includes(q);
        }
        const matchesTitle = (note.title || '').toLowerCase().includes(q);
        const matchesContent = (note.content || '').toLowerCase().includes(q);
        const matchesCategory = (note.category || '').toLowerCase().includes(q);
        const matchesColor = (note.color || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesCategory && !matchesColor) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      // Pinned notes priority
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;

      if (sortMode === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortMode === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortMode === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortMode === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return result;
  }, [notes, activeCategory, searchQuery, sortMode, unlockedNoteIds, activeColorFilter]);

  // ==================== Actions ====================

  // Save / Update Note
  const handleSaveNote = (noteData: {
    id?: string;
    title: string;
    content: string;
    category: string;
    color: any;
    isPinned?: boolean;
    isLocked?: boolean;
    password?: string;
  }) => {
    const now = new Date().toISOString();

    let updatedNotes: Note[];
    if (noteData.id) {
      // Update
      updatedNotes = notes.map((n) =>
        n.id === noteData.id
          ? {
              ...n,
              title: noteData.title,
              content: noteData.content,
              category: noteData.category,
              color: noteData.color,
              isLocked: noteData.isLocked,
              password: noteData.password,
              updatedAt: now,
            }
          : n
      );
      setNotes(updatedNotes);

      // If unlocked, keep unlocked
      if (noteData.isLocked) {
        setUnlockedNoteIds((prev) => new Set([...prev, noteData.id!]));
      }

      if (viewingNote?.id === noteData.id) {
        setViewingNote((prev) =>
          prev
            ? {
                ...prev,
                title: noteData.title,
                content: noteData.content,
                category: noteData.category,
                color: noteData.color,
                isLocked: noteData.isLocked,
                password: noteData.password,
                updatedAt: now,
              }
            : null
        );
      }
      showToast('Note updated successfully');
    } else {
      // Create new
      const newId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newNote: Note = {
        id: newId,
        title: noteData.title,
        content: noteData.content,
        category: noteData.category,
        color: noteData.color,
        isPinned: false,
        isLocked: noteData.isLocked,
        password: noteData.password,
        createdAt: now,
        updatedAt: now,
      };
      updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);

      if (newNote.isLocked) {
        setUnlockedNoteIds((prev) => new Set([...prev, newId]));
      }
      showToast('New note created');
    }
    handleSync(false, updatedNotes);
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    setNotes((prev) => {
      const updatedNotes = prev.map((n) => {
        if (n.id === id) {
          const nextState = !n.isPinned;
          showToast(nextState ? 'Note pinned' : 'Note unpinned');
          return { ...n, isPinned: nextState, updatedAt: new Date().toISOString() };
        }
        return n;
      });
      handleSync(true, updatedNotes);
      return updatedNotes;
    });

    if (viewingNote?.id === id) {
      setViewingNote((prev) => (prev ? { ...prev, isPinned: !prev.isPinned } : null));
    }
  };

  // ==================== Password Lock Handlers ====================

  const handleUnlockRequest = (note: Note, action: 'view' | 'edit' = 'view') => {
    // If already unlocked in this session, open directly
    if (unlockedNoteIds.has(note.id)) {
      if (action === 'view') {
        setViewingNote(note);
      } else {
        setEditingNote(note);
        setIsNoteModalOpen(true);
      }
      return;
    }

    setPasswordModal({
      isOpen: true,
      note,
      targetAction: action,
    });
  };

  const handleUnlockSuccess = (note: Note, action?: 'view' | 'edit' | 'unlock') => {
    setUnlockedNoteIds((prev) => new Set([...prev, note.id]));
    showToast('Note unlocked');

    if (action === 'view') {
      setViewingNote(note);
    } else if (action === 'edit') {
      setEditingNote(note);
      setIsNoteModalOpen(true);
    }
  };

  const handleRelockNote = (id: string) => {
    setUnlockedNoteIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (viewingNote?.id === id) {
      setViewingNote(null);
    }
    showToast('Note locked');
  };

  const handleLockAll = () => {
    setUnlockedNoteIds(new Set());
    if (viewingNote?.isLocked) {
      setViewingNote(null);
    }
    showToast('All notes locked');
  };

  const handleToggleLockFromView = (note: Note) => {
    const nextLocked = !note.isLocked;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? {
              ...n,
              isLocked: nextLocked,
              password: nextLocked ? (n.password || MASTER_PASSWORD) : undefined,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );

    if (nextLocked) {
      // Re-lock immediately
      setUnlockedNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(note.id);
        return next;
      });
      setViewingNote(null);
      showToast('Note locked with password');
    } else {
      showToast('Password lock removed');
      setViewingNote((prev) =>
        prev ? { ...prev, isLocked: false, password: undefined } : null
      );
    }
  };

  const handleToggleLockNote = (note: Note) => {
    const nextLocked = !note.isLocked;
    setNotes((prev) => {
      const updatedNotes = prev.map((n) =>
        n.id === note.id
          ? {
              ...n,
              isLocked: nextLocked,
              password: nextLocked ? (n.password || MASTER_PASSWORD) : undefined,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      handleSync(true, updatedNotes);
      return updatedNotes;
    });

    if (nextLocked) {
      setUnlockedNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(note.id);
        return next;
      });
      showToast('Note locked with password');
    } else {
      showToast('Password lock removed');
    }
  };

  // ==================== DELETE IMPLEMENTATION ====================

  const requestDeleteNote = (note: Note) => {
    if (note.isLocked) {
      showToast('Locked notes cannot be deleted. Unlock first.', 'error');
      return;
    }
    setDeleteModal({
      isOpen: true,
      noteTitle: note.isLocked && !unlockedNoteIds.has(note.id) ? 'Locked Note' : note.title,
      isPermanent: false,
      count: 1,
      onConfirm: () => {
        const trashedNote: Note = {
          ...note,
          deletedAt: new Date().toISOString(),
        };

        addDeletedNoteIds([note.id], notes);
        const updatedNotes = notes.filter((n) => n.id !== note.id);
        setNotes(updatedNotes);
        setTrashNotes((prev) => [trashedNote, ...prev]);
        setSelectedNoteIds((prev) => prev.filter((id) => id !== note.id));

        if (viewingNote?.id === note.id) {
          setViewingNote(null);
        }

        // Show toast with Undo (3 seconds auto-dismiss)
        showToast('Note moved to Trash', 'success', () => {
          removeDeletedNoteIds([note.id]);
          setTrashNotes((currTrash) => currTrash.filter((t) => t.id !== note.id));
          setNotes((currNotes) => {
            const restored = [note, ...currNotes];
            handleSync(true, restored);
            return restored;
          });
          showToast('Note restored');
        });
        
        // Auto-sync after moving to trash
        handleSync(false, updatedNotes);
      },
    });
  };

  // Batch delete selected active notes
  const requestBatchDelete = () => {
    if (selectedNoteIds.length === 0) return;
    
    const selectedNotes = notes.filter(n => selectedNoteIds.includes(n.id));
    const lockedSelectedCount = selectedNotes.filter(n => n.isLocked).length;
    
    if (lockedSelectedCount > 0) {
      showToast(`${lockedSelectedCount} locked notes skipped. Unlock them to delete.`, 'info');
    }
    
    const deletableIds = selectedNotes.filter(n => !n.isLocked).map(n => n.id);
    
    if (deletableIds.length === 0) return;
    
    const selectedCount = deletableIds.length;
    const currentSelectedIds = [...deletableIds];

    setDeleteModal({
      isOpen: true,
      count: selectedCount,
      isPermanent: false,
      onConfirm: () => {
        const toTrash: Note[] = [];
        const remaining: Note[] = [];

        notes.forEach((n) => {
          if (currentSelectedIds.includes(n.id)) {
            toTrash.push({ ...n, deletedAt: new Date().toISOString() });
          } else {
            remaining.push(n);
          }
        });

        addDeletedNoteIds(currentSelectedIds, notes);
        setNotes(remaining);
        setTrashNotes((prev) => [...toTrash, ...prev]);
        setSelectedNoteIds((prev) => prev.filter(id => !currentSelectedIds.includes(id)));

        showToast(`${selectedCount} notes moved to Trash`, 'success', () => {
          removeDeletedNoteIds(currentSelectedIds);
          setTrashNotes((currTrash) => currTrash.filter((t) => !toTrash.some((x) => x.id === t.id)));
          setNotes((currNotes) => [...toTrash.map((x) => ({ ...x, deletedAt: undefined })), ...currNotes]);
          showToast('All notes restored');
        });
      },
    });
  };

  // Restore note from trash
  const handleRestoreNote = (id: string) => {
    const noteToRestore = trashNotes.find((n) => n.id === id);
    if (!noteToRestore) return;

    removeDeletedNoteIds([id]);
    setTrashNotes((prev) => prev.filter((n) => n.id !== id));
    const restoredNotes = [{ ...noteToRestore, deletedAt: undefined }, ...notes];
    setNotes(restoredNotes);
    showToast('Note restored successfully');
    handleSync(false, restoredNotes);
  };

  // Restore all notes from trash
  const handleRestoreAll = () => {
    if (trashNotes.length === 0) return;
    const count = trashNotes.length;
    const restoredNotes = [...trashNotes.map((n) => ({ ...n, deletedAt: undefined })), ...notes];
    setNotes(restoredNotes);
    setTrashNotes([]);
    showToast(`All ${count} notes restored`);
    handleSync(false, restoredNotes);
  };

  // Permanently delete single note from trash
  const requestPermanentDelete = (note: Note) => {
    if (note.isLocked) {
      showToast('Locked notes cannot be deleted. Unlock first.', 'error');
      return;
    }
    setDeleteModal({
      isOpen: true,
      noteTitle: note.title,
      isPermanent: true,
      count: 1,
      onConfirm: () => {
        addDeletedNoteIds([note.id], trashNotes);
        setTrashNotes((prev) => prev.filter((n) => n.id !== note.id));
        showToast('Note permanently deleted');
        // Auto-sync after permanent deletion
        handleSync(false, notes);
      },
    });
  };

  // Empty entire trash
  const requestEmptyTrash = () => {
    if (trashNotes.length === 0) return;
    
    const lockedCount = trashNotes.filter(n => n.isLocked).length;
    if (lockedCount > 0) {
      showToast(`${lockedCount} locked notes in trash skipped. Unlock them to delete permanently.`, 'info');
    }
    
    const deletableNotes = trashNotes.filter(n => !n.isLocked);
    if (deletableNotes.length === 0) return;

    setDeleteModal({
      isOpen: true,
      isPermanent: true,
      count: deletableNotes.length,
      onConfirm: () => {
        addDeletedNoteIds(deletableNotes.map((n) => n.id), trashNotes);
        setTrashNotes((prev) => prev.filter(n => n.isLocked));
        showToast('Trash emptied (deletable notes)');
        // Auto-sync after emptying trash
        handleSync(false, notes);
      },
    });
  };

  // Re-import all notes from the attached file on demand
  const handleReloadAttachedNotes = () => {
    localStorage.removeItem('smart_notepad_deleted_ids');
    const deduped = deduplicateNotes(importedNotesRaw as Note[]);
    setNotes(deduped);
    setCategories(DEFAULT_CATEGORIES);
    setUnlockedNoteIds(new Set());
    localStorage.setItem('smart_notepad_imported_856', 'true');
    localStorage.setItem('smart_notepad_notes_v4', JSON.stringify(deduped));
    showToast(`Imported ${deduped.length} notes from attached file!`);
  };

  // Batch Category Assignment
  const handleBatchAssignCategory = (targetCategory: string) => {
    if (selectedNoteIds.length === 0) return;
    const count = selectedNoteIds.length;
    const updatedNotes = notes.map((n) =>
      selectedNoteIds.includes(n.id)
        ? { ...n, category: targetCategory, updatedAt: new Date().toISOString() }
        : n
    );
    setNotes(updatedNotes);
    showToast(`${count} notes assigned to "${targetCategory}"`);
    setSelectedNoteIds([]);
    setIsBatchCategoryModalOpen(false);
    handleSync(true, updatedNotes);
  };

  const handleCreateAndBatchAssign = (newCategoryName: string) => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
    handleBatchAssignCategory(trimmed);
  };

  // ==================== Category Handlers ====================

  const handleAddCategory = (name: string) => {
    if (!categories.includes(name)) {
      setCategories((prev) => [...prev, name]);
      showToast(`Category '${name}' created`);
    }
  };

  const [syncInProgress, setSyncInProgress] = useState(false);
  const syncRequestedRef = React.useRef(false);

  const handleSync = async (silent = false, currentNotes?: Note[]) => {
    if (syncInProgress) {
      syncRequestedRef.current = true;
      return;
    }
    setSyncInProgress(true);
    syncRequestedRef.current = false;

    const performSync = async (notesToSync: Note[]) => {
      let accessToken = await getAccessToken();
      
      if (!accessToken && !silent) {
        try {
          const result = await googleSignIn();
          accessToken = result?.accessToken || null;
        } catch (err) {
          console.error('Login error during sync:', err);
          showToast('Authentication failed', 'error');
          setNeedsAuth(true);
          return false;
        }
      }

      if (!accessToken) {
        if (!silent) {
          showToast('Authentication required', 'error');
          setNeedsAuth(true);
        }
        return false;
      }

      const sheetFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
        const headers = {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
        };
        let response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
          clearAccessToken();
          try {
            const result = await googleSignIn();
            accessToken = result?.accessToken || null;
            if (accessToken) {
              const retryHeaders = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
              };
              response = await fetch(url, { ...options, headers: retryHeaders });
            }
          } catch (e) {
            console.error('Retry auth failed', e);
          }
        }
        return response;
      };

      try {
        const sheetId = FIXED_SHEET_ID;

        // 0. Get the sheet metadata
        const metaResponse = await sheetFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`);

        if (metaResponse.status === 404) {
          throw new Error('Spreadsheet not found. Check if the ID is correct.');
        }
        if (!metaResponse.ok) {
          const errJson = await metaResponse.json().catch(() => ({}));
          throw new Error(errJson.error?.message || 'Failed to connect to Google Sheets');
        }

        const metaData = await metaResponse.json();
        const firstSheet = metaData.sheets?.[0];
        const firstSheetName = firstSheet?.properties?.title || 'Sheet1';
        const firstSheetId = firstSheet?.properties?.sheetId || 0;

        // 1. Fetch current data from the sheet
        const fetchRange = `'${firstSheetName}'!A:E`;
        const getResponse = await sheetFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(fetchRange)}`);

        if (!getResponse.ok) throw new Error('Failed to fetch sheet data');

        const getData = await getResponse.json();
        const sheetRows = getData.values || [];
        const deletedIds = getDeletedNoteIds();

        const appendsToExecute: any[][] = [];
        const updatesToExecute: { range: string, values: any[][] }[] = [];
        const deletesToExecute: number[] = [];

        // If sheet is completely empty, add header
        if (sheetRows.length === 0) {
          appendsToExecute.push(['Date', 'Title', 'Category', 'Content', 'ID']);
        }

        // 2. Identify Changes
        const matchedSheetRowIndices = new Set<number>();
        const localNoteIdsInSheet = new Set<string>();

        sheetRows.forEach((row: any[], index: number) => {
          if (index === 0) return; // Skip header
          const sheetNoteId = (row[4] || '').toString().trim();
          const title = (row[1] || '').toString().trim();
          const content = (row[3] || '').toString().trim();
          const category = (row[2] || 'Uncategorized').toString().trim();
          
          const compositeKey = `del_${title}_${content.substring(0, 50)}`;

          // Find matching local note
          const localNote = notesToSync.find(n => 
            (sheetNoteId && n.id === sheetNoteId) || 
            (!sheetNoteId && n.title.trim() === title && n.content.trim() === content)
          );

          if (localNote) {
            matchedSheetRowIndices.add(index);
            localNoteIdsInSheet.add(localNote.id);
            // Check if sheet needs an update
            const localD = new Date(localNote.updatedAt || localNote.createdAt);
            const formattedDate = `${(localD.getMonth() + 1).toString().padStart(2, '0')}/${localD.getDate().toString().padStart(2, '0')}/${localD.getFullYear()} ${localD.getHours()}:${localD.getMinutes().toString().padStart(2, '0')}:${localD.getSeconds().toString().padStart(2, '0')}`;
            
            const isDifferent = localNote.title.trim() !== title || 
                              localNote.content.trim() !== content || 
                              localNote.category !== category || 
                              sheetNoteId !== localNote.id;

            if (isDifferent) {
              updatesToExecute.push({
                range: `'${firstSheetName}'!A${index + 1}:E${index + 1}`,
                values: [[formattedDate, localNote.title, localNote.category || 'Uncategorized', localNote.content, localNote.id]]
              });
            }
          } else {
            // Not in active notes -> Check if it's marked as deleted
            if (deletedIds.has(sheetNoteId) || deletedIds.has(compositeKey)) {
              deletesToExecute.push(index);
            }
          }
        });

        // Check for new local notes (not in sheet)
        notesToSync.forEach(n => {
          if (deletedIds.has(n.id)) return;
          if (!localNoteIdsInSheet.has(n.id)) {
            const d = new Date(n.updatedAt || n.createdAt);
            const formattedDate = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
            appendsToExecute.push([formattedDate, n.title, n.category || 'Uncategorized', n.content, n.id]);
          }
        });

        // 3. Execute Updates
        if (updatesToExecute.length > 0) {
          await sheetFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              valueInputOption: 'USER_ENTERED',
              data: updatesToExecute
            })
          });
        }

        // 4. Execute Deletions
        if (deletesToExecute.length > 0) {
          const sortedIndices = [...deletesToExecute].sort((a, b) => b - a);
          const requests = sortedIndices.map(idx => ({
            deleteDimension: {
              range: { sheetId: firstSheetId, dimension: 'ROWS', startIndex: idx, endIndex: idx + 1 }
            }
          }));
          await sheetFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests })
          });
        }

        // 5. Execute Appends
        if (appendsToExecute.length > 0) {
          await sheetFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(firstSheetName)}!A1:append?valueInputOption=USER_ENTERED`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: appendsToExecute })
          });
        }

        // 6. Refresh and Merge
        const finalGetResponse = await sheetFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(fetchRange)}`);

        if (finalGetResponse.ok) {
          const finalData = await finalGetResponse.json();
          const finalRows = finalData.values || [];
          const syncTimestamp = Date.now();

          const notesFromSheet: Note[] = finalRows.slice(1).map((row: any[], index: number) => {
            const sheetId = (row[4] || '').toString().trim();
            const title = (row[1] || '').toString().trim();
            const category = (row[2] || '').toString().trim() || 'Uncategorized';
            const content = (row[3] || '').toString().trim();
            const updatedAt = row[0] || new Date().toISOString();

            // Try to match with local notes strictly
            let localMatch = notesToSync.find(n => {
              if (sheetId && n.id === sheetId) return true;
              if (!sheetId && n.title.trim() === title && n.content.trim() === content) return true;
              return false;
            });

            const id = sheetId || localMatch?.id || `note_sheet_${index}_${syncTimestamp}`;

            return {
              id,
              title,
              category,
              content,
              updatedAt,
              createdAt: localMatch?.createdAt || updatedAt,
              color: localMatch?.color || 'slate',
              isPinned: localMatch?.isPinned || false,
              isLocked: localMatch?.isLocked || false,
              password: localMatch?.password,
            };
          });

          const mergedMap = new Map<string, Note>();
          notesFromSheet.forEach(n => mergedMap.set(n.id, n));
          
          notesToSync.forEach(n => {
            if (!mergedMap.has(n.id) && !deletedIds.has(n.id)) {
              mergedMap.set(n.id, n);
            }
          });

          setNotes(Array.from(mergedMap.values()));
        }
        
        const now = new Date().toLocaleString('en-GB', { 
          day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' 
        }).replace(',', '');
        setLastSyncTime(now);
        localStorage.setItem('smart_notepad_last_sync', now);
        if (!silent) showToast('Sync successful!');
        return true;
      } catch (e: any) {
        console.error('Sync Error:', e);
        if (!silent) showToast('Sync failed: ' + e.message, 'error');
        return false;
      }
    };

    let currentToSync = currentNotes || notes;
    await performSync(currentToSync);

    // If another sync was requested while this one was running, run again once
    if (syncRequestedRef.current) {
      // Use the latest notes state for the follow-up sync
      // We need to get the latest notes because they might have changed
      // But since setNotes is async, we might not have them yet in 'notes' variable.
      // However, for simplicity, we'll just run one more sync.
      await performSync(currentToSync);
    }
    
    setSyncInProgress(false);
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    const updatedNotes = notes.map((n) => (n.category === oldName ? { ...n, category: trimmed } : n));
    setNotes(updatedNotes);
    setTrashNotes((prev) =>
      prev.map((n) => (n.category === oldName ? { ...n, category: trimmed } : n))
    );
    if (activeCategory === oldName) {
      setActiveCategory(trimmed);
    }
    showToast(`Category renamed to "${trimmed}"`);
    handleSync(true, updatedNotes);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    const affectedCount = notes.filter((n) => n.category === catToDelete).length;

    setDeleteModal({
      isOpen: true,
      noteTitle: affectedCount > 0
        ? `Category "${catToDelete}" has ${affectedCount} notes. Deleting it will reassign all these notes to "Uncategorized".`
        : `Delete empty category "${catToDelete}".`,
      isPermanent: true,
      count: 1,
      onConfirm: () => {
        setCategories((prev) => prev.filter((c) => c !== catToDelete));
        // Reassign affected notes to "Uncategorized" as requested!
        const updatedNotes = notes.map((n) =>
          n.category === catToDelete ? { ...n, category: 'Uncategorized' } : n
        );
        setNotes(updatedNotes);
        setTrashNotes((prev) =>
          prev.map((n) =>
            n.category === catToDelete ? { ...n, category: 'Uncategorized' } : n
          )
        );
        if (activeCategory === catToDelete) {
          setActiveCategory('all');
        }
        showToast(
          affectedCount > 0
            ? `Category "${catToDelete}" removed. Notes moved to General.`
            : `Category "${catToDelete}" removed.`
        );
        handleSync(true, updatedNotes);
      },
    });
  };

  // Export JSON backup
  const handleExportNotes = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      notes,
      trashNotes,
      categories,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ag_note_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup downloaded successfully');
  };

  // Import JSON backup
  const handleImportNotes = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.notes && Array.isArray(parsed.notes)) {
          setNotes(parsed.notes);
          if (parsed.trashNotes && Array.isArray(parsed.trashNotes)) {
            setTrashNotes(parsed.trashNotes);
          }
          if (parsed.categories && Array.isArray(parsed.categories)) {
            setCategories(Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed.categories])));
          }
          showToast('Backup restored successfully');
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch {
        showToast('Could not read backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Multi-select toggle
  const handleToggleSelectNote = (id: string) => {
    setSelectedNoteIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAllFiltered = () => {
    if (selectedNoteIds.length === filteredNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(filteredNotes.map((n) => n.id));
    }
  };

  return (
    <div className="min-h-screen max-w-full w-full overflow-x-hidden bg-[#14110E] text-[#E0D6C5] flex flex-col relative">
      {/* Top Navbar with AG Note Circular Text Logo (No + button in header) */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenNewNote={() => {
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        unlockedCount={unlockedNoteIds.size}
        onLockAll={handleLockAll}
        activeColorFilter={activeColorFilter}
        onColorFilterChange={setActiveColorFilter}
        onSync={handleSync}
        lastSyncTime={lastSyncTime}
        isSyncing={syncInProgress}
      />

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-[105px] sm:pt-[76px] pb-8 flex-1 w-full max-w-full overflow-x-hidden flex flex-col md:flex-row gap-4 sm:gap-5">
        {/* Sidebar */}
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          isTrashView={isTrashView}
          totalNotesCount={notes.length}
          pinnedNotesCount={notes.filter((n) => n.isPinned).length}
          uncategorizedCount={uncategorizedCount}
          lockedNotesCount={lockedNotesCount}
          trashNotesCount={trashNotes.length}
          categoryCounts={categoryCounts}
          sortMode={sortMode}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSelectedNoteIds([]);
          }}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          onDeleteCategory={handleDeleteCategory}
          onToggleTrashView={(show) => {
            setIsTrashView(show);
            setSelectedNoteIds([]);
          }}
          onChangeSort={setSortMode}
          onExportNotes={handleExportNotes}
          onImportNotes={handleImportNotes}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {isTrashView ? (
            <TrashView
              trashNotes={trashNotes}
              onRestoreNote={handleRestoreNote}
              onRestoreAll={handleRestoreAll}
              onRequestPermanentDelete={requestPermanentDelete}
              onRequestEmptyTrash={requestEmptyTrash}
              onBackToNotes={() => setIsTrashView(false)}
            />
          ) : (
            <div className="space-y-3.5">
              {/* Header Info & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {activeCategory === 'all' && 'All Notes'}
                    {activeCategory === 'pinned' && (
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <Pin className="w-4 h-4 fill-amber-500" /> Pinned Notes
                      </span>
                    )}
                    {activeCategory === 'uncategorized' && (
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <HelpCircle className="w-4 h-4 text-indigo-500" /> Uncategorized Notes
                      </span>
                    )}
                    {activeCategory === 'locked' && (
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <Lock className="w-4 h-4 text-amber-500" /> Locked Notes
                      </span>
                    )}
                    {activeCategory !== 'all' &&
                      activeCategory !== 'pinned' &&
                      activeCategory !== 'uncategorized' &&
                      activeCategory !== 'locked' && (
                        <span className="flex items-center gap-1.5">
                          <FolderOpen className="w-4 h-4 text-blue-500" /> {activeCategory}
                        </span>
                      )}
                  </h2>

                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    ({filteredNotes.length})
                  </span>
                </div>

                {/* Batch Actions Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {filteredNotes.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
                    >
                      {selectedNoteIds.length === filteredNotes.length ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Select All</span>
                    </button>
                  )}

                  {selectedNoteIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedNoteIds([])}
                      title="Deselect all"
                      className="text-xs text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear Selection</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notes Grid or List (Compact, showing only 1st line of content or "Locked"!) */}
              {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                    <FolderOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No notes found
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {searchQuery
                      ? 'No notes matched your search query.'
                      : activeCategory === 'uncategorized'
                      ? 'No uncategorized notes found.'
                      : activeCategory === 'locked'
                      ? 'No locked notes found.'
                      : 'No notes in this category.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleReloadAttachedNotes}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Reload All 856 Attached Notes
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      viewMode="grid"
                      isSelected={selectedNoteIds.includes(note.id)}
                      isUnlocked={unlockedNoteIds.has(note.id)}
                      onSelect={handleToggleSelectNote}
                      onView={(n) => setViewingNote(n)}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setIsNoteModalOpen(true);
                      }}
                      onDelete={requestDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleLockNote={handleToggleLockNote}
                      onUnlockRequest={handleUnlockRequest}
                      onRelockNote={handleRelockNote}
                      onShowToast={showToast}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      viewMode="list"
                      isSelected={selectedNoteIds.includes(note.id)}
                      isUnlocked={unlockedNoteIds.has(note.id)}
                      onSelect={handleToggleSelectNote}
                      onView={(n) => setViewingNote(n)}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setIsNoteModalOpen(true);
                      }}
                      onDelete={requestDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleLockNote={handleToggleLockNote}
                      onUnlockRequest={handleUnlockRequest}
                      onRelockNote={handleRelockNote}
                      onShowToast={showToast}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Note Create & Edit Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        initialNote={editingNote}
        categories={categories}
        onSave={handleSaveNote}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      {/* Note Detail View Modal */}
      <ViewNoteModal
        note={viewingNote}
        isOpen={!!viewingNote}
        onClose={() => setViewingNote(null)}
        onEdit={(n) => {
          setEditingNote(n);
          setIsNoteModalOpen(true);
        }}
        onDelete={requestDeleteNote}
        onTogglePin={handleTogglePin}
        onToggleLockNote={handleToggleLockFromView}
        onRelockNote={handleRelockNote}
        onShowToast={showToast}
      />

      {/* Password Unlock Modal */}
      <PasswordModal
        isOpen={passwordModal.isOpen}
        note={passwordModal.note}
        targetAction={passwordModal.targetAction}
        onUnlockSuccess={handleUnlockSuccess}
        onClose={() => setPasswordModal({ isOpen: false, note: null })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        noteTitle={deleteModal.noteTitle}
        count={deleteModal.count}
        isPermanent={deleteModal.isPermanent}
        onConfirm={deleteModal.onConfirm}
        onClose={() => setDeleteModal({ isOpen: false, onConfirm: () => {} })}
      />

      {/* Manage Categories Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        existingCategories={categories}
        categoryCounts={categoryCounts}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Batch Assign Category Modal */}
      <BatchCategoryModal
        isOpen={isBatchCategoryModalOpen}
        selectedCount={selectedNoteIds.length}
        categories={categories}
        categoryCounts={categoryCounts}
        onAssignCategory={handleBatchAssignCategory}
        onCreateAndAssign={handleCreateAndBatchAssign}
        onClose={() => setIsBatchCategoryModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={() => {}}
        initialUrl={FIXED_SHEET_ID}
      />

      {/* Floating Circular Action Button for New Note on Right Side of Display */}
      <button
        type="button"
        onClick={() => {
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }}
        title="Create New Note"
        className={`fixed bottom-6 sm:bottom-8 right-4 sm:right-7 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl flex items-center justify-center border-2 border-white dark:border-slate-800 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer ring-4 ring-blue-500/20 ${
          selectedNoteIds.length > 0 ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Create New Note"
      >
        <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
      </button>

      {/* Floating Batch Action Bar (Appears when notes are selected) */}
      <FloatingBatchBar
        selectedCount={selectedNoteIds.length}
        onClear={() => setSelectedNoteIds([])}
        onAssignCategory={() => setIsBatchCategoryModalOpen(true)}
        onDelete={requestBatchDelete}
      />

      {/* Action Toast (Auto-dismisses in 3 seconds) */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

// Global listener for settings trigger
window.addEventListener('openSettings', () => {
    (window as any)._triggerOpenSettings?.();
});
