import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Eye, EyeOff, X, AlertCircle, KeyRound } from 'lucide-react';
import { Note, verifyNotePassword } from '../types/note';

interface PasswordModalProps {
  isOpen: boolean;
  note: Note | null;
  targetAction?: 'view' | 'edit' | 'unlock';
  onUnlockSuccess: (note: Note, action?: 'view' | 'edit' | 'unlock') => void;
  onSetPassword?: (noteId: string, isLocked: boolean, password?: string) => void;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  note,
  targetAction = 'view',
  onUnlockSuccess,
  onClose,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setShowPassword(false);
      setError('');
    }
  }, [isOpen, note]);

  if (!isOpen || !note) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setError('Please enter the password');
      return;
    }

    if (verifyNotePassword(note, passwordInput.trim())) {
      onUnlockSuccess(note, targetAction);
      onClose();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon Emblem */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 ring-8 ring-amber-50/50 dark:ring-amber-950/20">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
            Locked Note
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
            This note is password protected. Enter the password to reveal its content.
          </p>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Enter Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Password..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-medium flex items-start gap-1.5 mt-2 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900/40">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </p>
            )}
          </div>


          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
