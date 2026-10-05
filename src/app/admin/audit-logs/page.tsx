import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { History, ArrowLeft, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    redirect('/');
  }

  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <History className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Operational Audit Trail ({logs.length})
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Immutable log of all registration movements, check-ins, waitlist auto-promotions, and administrative actions.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-900 overflow-hidden text-xs shadow-xs">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-zinc-500">No audit log entries recorded yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded font-semibold bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    {log.action}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                    Target: <strong className="text-zinc-800 dark:text-zinc-200">{log.entityType}</strong> ({log.entityId})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDateTime(log.createdAt)}</span>
                </div>
              </div>

              {log.actor && (
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Triggered by: <span className="text-zinc-900 dark:text-zinc-200 font-medium">{log.actor.name}</span> ({log.actor.email})
                </p>
              )}

              {log.metadata && (
                <pre className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-700 dark:text-zinc-400 overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
