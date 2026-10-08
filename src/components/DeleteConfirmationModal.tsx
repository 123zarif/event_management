'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName: string;
  expectedSlug: string;
  impactNotice?: React.ReactNode;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  expectedSlug,
  impactNotice,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  const [typedSlug, setTypedSlug] = useState('');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setTypedSlug('');
    }
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const isMatch = typedSlug.trim().toLowerCase() === expectedSlug.trim().toLowerCase();

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || isDeleting) return;
    await onConfirm();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl text-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 id="delete-dialog-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[260px]">
                {itemName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Impact Warning */}
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <span>⚠️ Irreversible Action</span>
          </p>
          {impactNotice ? (
            <div className="text-[11px] opacity-90 leading-relaxed">{impactNotice}</div>
          ) : (
            <p className="text-[11px] opacity-90 leading-relaxed">
              This action cannot be undone. All associated registrations, submissions, judge scorecards, and data will be permanently purged.
            </p>
          )}
        </div>

        {/* Form requiring typing slug */}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-zinc-700 dark:text-zinc-300 font-medium">
              To confirm, type <span className="font-mono font-bold text-rose-600 dark:text-rose-400 select-all">{expectedSlug}</span> below:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={typedSlug}
              onChange={(e) => setTypedSlug(e.target.value)}
              disabled={isDeleting}
              placeholder={expectedSlug}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-3.5 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMatch || isDeleting}
              className={`px-4 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                isMatch && !isDeleting
                  ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Permanently Delete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
