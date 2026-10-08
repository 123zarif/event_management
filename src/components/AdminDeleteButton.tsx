'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteEvent } from '@/actions/events';
import { deleteFest } from '@/actions/fests';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { toast } from 'sonner';

interface AdminDeleteButtonProps {
  id: string;
  slug: string;
  title: string;
  type: 'event' | 'fest';
  className?: string;
  variant?: 'button' | 'icon';
}

export function AdminDeleteButton({
  id,
  slug,
  title,
  type,
  className = '',
  variant = 'button',
}: AdminDeleteButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = type === 'event' ? await deleteEvent(id) : await deleteFest(id);
      if (!res.success) {
        toast.error(res.message);
        setIsDeleting(false);
        return;
      }

      toast.success(res.message);
      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || `Failed to delete ${type}.`);
      setIsDeleting(false);
    }
  };

  const isEvent = type === 'event';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          (variant === 'icon'
            ? 'p-1.5 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer'
            : 'inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors cursor-pointer')
        }
        title={isEvent ? 'Delete Competition Track' : 'Delete Festival'}
      >
        <Trash2 className="h-3 w-3" />
        {variant !== 'icon' && <span>Delete</span>}
      </button>

      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={isEvent ? 'Delete Competition Track' : 'Delete Festival'}
        itemName={title}
        expectedSlug={slug}
        impactNotice={
          isEvent ? (
            <p>
              Permanently purges <strong className="font-semibold text-rose-700 dark:text-rose-300">{title}</strong> and all related registrations, submissions, and judge scores.
            </p>
          ) : (
            <p>
              Permanently purges <strong className="font-semibold text-rose-700 dark:text-rose-300">{title}</strong> along with all associated competition tracks and registrations.
            </p>
          )
        }
        isDeleting={isDeleting}
      />
    </>
  );
}

