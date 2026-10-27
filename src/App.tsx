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
  // Helper to deduplicate notes by ID
  const deduplicateNotes = (noteList: Note[]): Note[] => {
    const map = new Map<string, Note>();
    noteList.forEach(n => {
      if (n && n.id) {
        const existing = map.get(n.id);
        if (!existing || new Date(n.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
          map.set(n.id, n);
        }
      }
    });
    return Array.from(map.values());
  };

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const deletedIds = getDeletedNoteIds();
      const isInitialized = localStorage.getItem('smart_notepad_initialized_v4');
      const savedV4 = localStorage.getItem('smart_notepad_notes_v4');

      let initialList: Note[] = [];

      if (isInitialized && savedV4 !== null) {
        const parsed = JSON.parse(savedV4);
        if (Array.isArray(parsed)) initialList = parsed;
      } else {
        if (initialList.length === 0 && !isInitialized) {
          initialList = (importedNotesRaw as Note[]).map((n) => ({
            ...n,
            category: n.category || 'Uncategorized',
          }));
        }
      }

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
    } catch { /* ignore */ }
    return [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smart_notepad_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return DEFAULT_CATEGORIES;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>(() => (localStorage.getItem('smart_notepad_sort') as SortMode) || 'newest');
  const [viewMode, setViewMode] = useState<ViewMode>(() => (localStorage.getItem('smart_notepad_view') as ViewMode) || 'grid');
  const [isTrashView, setIsTrashView] = useState<boolean>(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<Set<string>>(new Set());

  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('smart_notepad_sidebar_open');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 768;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smart_notepad_sidebar_open', String(isSidebarOpen));
    } catch { /* ignore */ }
  }, [isSidebarOpen]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    note: Note | null;
    targetAction?: 'view' | 'edit';
  }>({ isOpen: false, note: null, targetAction: 'view' });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('notepad_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
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

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteTitle?: string;
    count?: number;
    isPermanent?: boolean;
    onConfirm: () => void;
  }>({ isOpen: false, onConfirm: () => {} });

  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', onUndo?: () => void) => {
    setToast({ id: String(Date.now()), message, type, onUndo });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => { counts[c] = notes.filter((n) => n.category === c).length; });
    return counts;
  }, [categories, notes]);

  const uncategorizedCount = useMemo(() => notes.filter(n => !n.category || n.category.trim() === '' || n.category.toLowerCase() === 'uncategorized').length, [notes]);
  const lockedNotesCount = useMemo(() => notes.filter((n) => n.isLocked).length, [notes]);

  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => {
      if (activeCategory === 'pinned') { if (!note.isPinned) return false; }
      else if (activeCategory === 'uncategorized') { if (note.category && note.category.trim() !== '' && note.category.toLowerCase() !== 'uncategorized') return false; }
      else if (activeCategory === 'locked') { if (!note.isLocked) return false; }
      else if (activeCategory !== 'all') { if (note.category !== activeCategory) return false; }
      if (activeColorFilter && note.color !== activeColorFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const isNoteUnlocked = unlockedNoteIds.has(note.id);
        if (note.isLocked && !isNoteUnlocked) return 'locked'.includes(q);
        const matchesTitle = (note.title || '').toLowerCase().includes(q);
        const matchesContent = (note.content || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      if (sortMode === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortMode === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortMode === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortMode === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
    return result;
  }, [notes, activeCategory, searchQuery, sortMode, unlockedNoteIds, activeColorFilter]);

  // Listen for openSettings event from other components
  useEffect(() => {
    const handleOpen = () => setIsSettingsModalOpen(true);
    window.addEventListener('openSettings', handleOpen);
    return () => window.removeEventListener('openSettings', handleOpen);
  }, []);

  const handleExportNotes = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `ag_notepad_backup_${new Date().toISOString().slice(0, 10)}.json`);
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

  const handleSaveNote = (noteData: any) => {
    const now = new Date().toISOString();
    let updatedNotes: Note[] = [];
    if (noteData.id) {
      updatedNotes = notes.map((n) => n.id === noteData.id ? { ...n, ...noteData, updatedAt: now } : n);
    } else {
      const newNote: Note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...noteData,
        createdAt: now,
        updatedAt: now,
        isPinned: false
      };
      updatedNotes = [newNote, ...notes];
    }
    setNotes(updatedNotes);
    showToast(noteData.id ? 'Note updated' : 'New note created');
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) => {
      const next = prev.map((n) => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n);
      return next;
    });
  };

  const handleUnlockRequest = (note: Note, action: 'view' | 'edit' = 'view') => {
    if (unlockedNoteIds.has(note.id)) {
      if (action === 'view') setViewingNote(note);
      else { setEditingNote(note); setIsNoteModalOpen(true); }
      return;
    }
    setPasswordModal({ isOpen: true, note, targetAction: action });
  };

  const handleUnlockSuccess = (note: Note, action?: any) => {
    setUnlockedNoteIds((prev) => new Set([...prev, note.id]));
    showToast('Note unlocked');
    if (action === 'view') setViewingNote(note);
    else if (action === 'edit') { setEditingNote(note); setIsNoteModalOpen(true); }
  };

  const handleRelockNote = (id: string) => {
    setUnlockedNoteIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    if (viewingNote?.id === id) setViewingNote(null);
    showToast('Note locked');
  };

  const handleLockAll = () => {
    setUnlockedNoteIds(new Set());
    if (viewingNote?.isLocked) setViewingNote(null);
    showToast('All notes locked');
  };

  const handleToggleLockNote = (note: Note) => {
    const nextLocked = !note.isLocked;
    setNotes((prev) => {
      const next = prev.map((n) => n.id === note.id ? { ...n, isLocked: nextLocked, password: nextLocked ? (n.password || MASTER_PASSWORD) : undefined, updatedAt: new Date().toISOString() } : n);
      return next;
    });
    if (nextLocked) {
      setUnlockedNoteIds((prev) => { const next = new Set(prev); next.delete(note.id); return next; });
      if (viewingNote?.id === note.id) setViewingNote(null);
    }
    showToast(nextLocked ? 'Note locked' : 'Lock removed');
  };

  const requestDeleteNote = (note: Note) => {
    if (note.isLocked) { showToast('Unlock first', 'error'); return; }
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

  return (
    <div className="min-h-screen w-full bg-[#14241D] text-[#F0F7F4] flex flex-col">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onOpenNewNote={() => { setEditingNote(null); setIsNoteModalOpen(true); }}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onToggleMobileMenu={() => setIsSidebarOpen(prev => !prev)}
        unlockedCount={unlockedNoteIds.size}
        onLockAll={handleLockAll}
        activeColorFilter={activeColorFilter}
        onColorFilterChange={setActiveColorFilter}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-8 flex-1 w-full flex flex-col md:flex-row gap-4">
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          isTrashView={isTrashView}
          totalNotesCount={notes.length}
          pinnedNotesCount={notes.filter(n => n.isPinned).length}
          uncategorizedCount={uncategorizedCount}
          lockedNotesCount={lockedNotesCount}
          trashNotesCount={trashNotes.length}
          categoryCounts={categoryCounts}
          sortMode={sortMode}
          onSelectCategory={(cat) => { setActiveCategory(cat); setSelectedNoteIds([]); }}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          onDeleteCategory={handleDeleteCategory}
          onToggleTrashView={setIsTrashView}
          onChangeSort={setSortMode}
          onExportNotes={handleExportNotes}
          onImportNotes={handleImportNotes}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        <main className="flex-1 min-w-0">
          {isTrashView ? (
            <TrashView
              trashNotes={trashNotes}
              onRestoreNote={handleRestoreNote}
              onRestoreAll={() => {}}
              onRequestPermanentDelete={() => {}}
              onRequestEmptyTrash={() => {}}
              onBackToNotes={() => setIsTrashView(false)}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold">{activeCategory === 'all' ? 'All Notes' : activeCategory}</h2>
                  {activeColorFilter && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#162920] border border-[#2D4A3D] rounded-full text-xs">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-white/40"
                        style={{
                          backgroundColor:
                            activeColorFilter === 'blue'
                              ? '#3B82F6'
                              : activeColorFilter === 'emerald'
                              ? '#10B981'
                              : activeColorFilter === 'amber'
                              ? '#F59E0B'
                              : activeColorFilter === 'rose'
                              ? '#F43F5E'
                              : activeColorFilter === 'purple'
                              ? '#A855F7'
                              : activeColorFilter === 'cyan'
                              ? '#06B6D4'
                              : '#64748B',
                        }}
                      />
                      <span className="text-[#8DA89B] text-[11px] font-semibold">ফিল্টার চালু</span>
                      <button
                        type="button"
                        onClick={() => setActiveColorFilter(null)}
                        className="ml-0.5 text-[#8DA89B] hover:text-[#F0F7F4] cursor-pointer"
                        title="রঙ ফিল্টার বন্ধ করুন"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-xs text-[#8DA89B] font-semibold">{filteredNotes.length} notes</span>
              </div>
              
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    isSelected={selectedNoteIds.includes(note.id)}
                    isUnlocked={unlockedNoteIds.has(note.id)}
                    onSelect={(id) => setSelectedNoteIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                    onView={setViewingNote}
                    onEdit={(n) => { setEditingNote(n); setIsNoteModalOpen(true); }}
                    onDelete={requestDeleteNote}
                    onTogglePin={handleTogglePin}
                    onToggleLockNote={handleToggleLockNote}
                    onUnlockRequest={handleUnlockRequest}
                    onRelockNote={handleRelockNote}
                    onShowToast={showToast}
                  />
                ))}
              </div>
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
        onTogglePin={handleTogglePin}
        onToggleLockNote={handleToggleLockNote}
        onRelockNote={handleRelockNote}
        onShowToast={showToast}
      />

      <PasswordModal
        isOpen={passwordModal.isOpen}
        note={passwordModal.note}
        targetAction={passwordModal.targetAction}
        onUnlockSuccess={handleUnlockSuccess}
        onClose={() => setPasswordModal({ isOpen: false, note: null })}
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

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        totalNotes={notes.length}
        pinnedCount={notes.filter(n => n.isPinned).length}
        lockedCount={lockedNotesCount}
        trashCount={trashNotes.length}
        categoryCount={categories.length}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
        onEmptyTrash={() => {
          setTrashNotes([]);
          showToast('Trash emptied');
        }}
      />

      <button
        onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#D4AF37] text-[#14241D] flex items-center justify-center shadow-2xl hover:bg-[#D4AF37]/95 hover:scale-105 active:scale-95 transition-all cursor-pointer z-30"
        title="নতুন নোট লিখুন"
      >
        <Plus className="w-8 h-8 stroke-[2.5]" />
      </button>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
