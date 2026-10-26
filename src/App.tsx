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
import importedNotesRaw from './data/importedNotes.json';

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

export default function App() {
  // Primary States: Initializing with persistent storage and deleted IDs filtering
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const deletedIds = getDeletedNoteIds();
      const isInitialized = localStorage.getItem('smart_notepad_initialized_v4');
      const savedV4 = localStorage.getItem('smart_notepad_notes_v4');

      if (isInitialized && savedV4 !== null) {
        const parsed = JSON.parse(savedV4);
        if (Array.isArray(parsed)) {
          return parsed.filter((n: Note) => !deletedIds.has(n.id));
        }
      }

      // Migration / Initial import
      let initialList: Note[] = [];
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
          category: 'Uncategorized',
        }));
      }

      const filtered = initialList.filter((n: Note) => !deletedIds.has(n.id));
      localStorage.setItem('smart_notepad_notes_v4', JSON.stringify(filtered));
      localStorage.setItem('smart_notepad_initialized_v4', 'true');
      return filtered;
    } catch {
      return [];
    }
  });

  const [trashNotes, setTrashNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('smart_notepad_trash');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
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

  // Password Unlock State (Set of note IDs unlocked in current session)
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        if (!matchesTitle && !matchesContent && !matchesCategory) {
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
  }, [notes, activeCategory, searchQuery, sortMode, unlockedNoteIds]);

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

    if (noteData.id) {
      // Update
      setNotes((prev) =>
        prev.map((n) =>
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
        )
      );

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
      setNotes((prev) => [newNote, ...prev]);

      if (newNote.isLocked) {
        setUnlockedNoteIds((prev) => new Set([...prev, newId]));
      }
      showToast('New note created');
    }
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextState = !n.isPinned;
          showToast(nextState ? 'Note pinned' : 'Note unpinned');
          return { ...n, isPinned: nextState, updatedAt: new Date().toISOString() };
        }
        return n;
      })
    );

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

        addDeletedNoteIds([note.id]);
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
        setTrashNotes((prev) => [trashedNote, ...prev]);
        setSelectedNoteIds((prev) => prev.filter((id) => id !== note.id));

        if (viewingNote?.id === note.id) {
          setViewingNote(null);
        }

        // Show toast with Undo (3 seconds auto-dismiss)
        showToast('Note moved to Trash', 'success', () => {
          removeDeletedNoteIds([note.id]);
          setTrashNotes((currTrash) => currTrash.filter((t) => t.id !== note.id));
          setNotes((currNotes) => [note, ...currNotes]);
          showToast('Note restored');
        });
      },
    });
  };

  // Batch delete selected active notes
  const requestBatchDelete = () => {
    if (selectedNoteIds.length === 0) return;
    const selectedCount = selectedNoteIds.length;
    const currentSelectedIds = [...selectedNoteIds];

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

        addDeletedNoteIds(currentSelectedIds);
        setNotes(remaining);
        setTrashNotes((prev) => [...toTrash, ...prev]);
        setSelectedNoteIds([]);

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
    setNotes((prev) => [{ ...noteToRestore, deletedAt: undefined }, ...prev]);
    showToast('Note restored successfully');
  };

  // Restore all notes from trash
  const handleRestoreAll = () => {
    if (trashNotes.length === 0) return;
    const count = trashNotes.length;
    const ids = trashNotes.map((n) => n.id);
    removeDeletedNoteIds(ids);
    setNotes((prev) => [...trashNotes.map((n) => ({ ...n, deletedAt: undefined })), ...prev]);
    setTrashNotes([]);
    showToast(`All ${count} notes restored`);
  };

  // Permanently delete single note from trash
  const requestPermanentDelete = (note: Note) => {
    setDeleteModal({
      isOpen: true,
      noteTitle: note.title,
      isPermanent: true,
      count: 1,
      onConfirm: () => {
        addDeletedNoteIds([note.id]);
        setTrashNotes((prev) => prev.filter((n) => n.id !== note.id));
        showToast('Note permanently deleted');
      },
    });
  };

  // Empty entire trash
  const requestEmptyTrash = () => {
    if (trashNotes.length === 0) return;
    setDeleteModal({
      isOpen: true,
      isPermanent: true,
      count: trashNotes.length,
      onConfirm: () => {
        addDeletedNoteIds(trashNotes.map((n) => n.id));
        setTrashNotes([]);
        showToast('Trash emptied');
      },
    });
  };

  // Re-import all notes from the attached file on demand
  const handleReloadAttachedNotes = () => {
    localStorage.removeItem('smart_notepad_deleted_ids');
    setNotes(importedNotesRaw as Note[]);
    setCategories(DEFAULT_CATEGORIES);
    setUnlockedNoteIds(new Set());
    localStorage.setItem('smart_notepad_imported_856', 'true');
    localStorage.setItem('smart_notepad_notes_v4', JSON.stringify(importedNotesRaw));
    showToast(`Imported ${importedNotesRaw.length} notes from attached file!`);
  };

  // Batch Category Assignment
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
    showToast(`${count} notes assigned to "${targetCategory}"`);
    setSelectedNoteIds([]);
    setIsBatchCategoryModalOpen(false);
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

  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setNotes((prev) =>
      prev.map((n) => (n.category === oldName ? { ...n, category: trimmed } : n))
    );
    setTrashNotes((prev) =>
      prev.map((n) => (n.category === oldName ? { ...n, category: trimmed } : n))
    );
    if (activeCategory === oldName) {
      setActiveCategory(trimmed);
    }
    showToast(`Category renamed to "${trimmed}"`);
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
        setNotes((prev) =>
          prev.map((n) =>
            n.category === catToDelete ? { ...n, category: 'Uncategorized' } : n
          )
        );
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
            ? `Category "${catToDelete}" removed. Notes moved to Uncategorized.`
            : `Category "${catToDelete}" removed.`
        );
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
    <div className="min-h-screen max-w-full w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-500/20 relative">
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
