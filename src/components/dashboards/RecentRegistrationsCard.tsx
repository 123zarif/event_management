'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { Users, Filter } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { RegistrationStatus } from '@prisma/client';

export interface RegistrationItemData {
  id: string;
  status: RegistrationStatus;
  ticketCode: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    title: string;
  };
}

interface RecentRegistrationsCardProps {
  activeRegistrations: RegistrationItemData[];
  cancelledRegistrations: RegistrationItemData[];
}

export function RecentRegistrationsCard({
  activeRegistrations,
  cancelledRegistrations,
}: RecentRegistrationsCardProps) {
  const [filter, setFilter] = useState<'ACTIVE' | 'CANCELLED'>('ACTIVE');

  const displayList = filter === 'ACTIVE' ? activeRegistrations : cancelledRegistrations;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
            Recent Registrations
          </h3>
        </div>

        {/* Filter Toggle: Active by default, Cancelled behind a filter (Item 23) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'ACTIVE'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Active ({activeRegistrations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('CANCELLED')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                filter === 'CANCELLED'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Filter className="h-3 w-3" />
              <span>Cancelled ({cancelledRegistrations.length})</span>
            </button>
          </div>

          <Link
            href="/admin/participants"
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium shrink-0 ml-1"
          >
            Full Registry →
          </Link>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
        {displayList.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-500 font-mono">
            {filter === 'ACTIVE'
              ? 'No active registrations found.'
              : 'No cancelled registrations recorded.'}
          </p>
        ) : (
          displayList.map((r) => (
            <div key={r.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {r.user.name}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">
                  {r.ticketCode} · {r.event.title}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <StatusBadge status={r.status} />
                <span className="text-[10px] font-mono text-zinc-400">
                  {formatDateTime(r.createdAt).split(',')[0]}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

