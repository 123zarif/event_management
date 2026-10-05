import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { replyToSupportTicket } from '@/actions/support';
import { ArrowLeft, Send, UserCheck, Shield } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

interface TicketDetailPageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { ticketId } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: true,
      event: true,
      assignedTo: true,
      messages: {
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  async function handleSendReply(formData: FormData) {
    'use server';
    const message = formData.get('message') as string;
    const user = await getCurrentUser();
    if (message && message.trim() !== '' && user) {
      await replyToSupportTicket(ticketId, user.id, message.trim());
      revalidatePath(`/support/${ticketId}`);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Support Tickets
        </Link>
      </div>

      {/* Ticket Header Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                #TK-{ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                {ticket.priority} Priority
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {ticket.subject}
            </h1>
          </div>

          <div className="text-right text-xs text-zinc-500">
            <p>Created by: <span className="text-zinc-800 dark:text-zinc-300 font-medium">{ticket.user.name}</span></p>
            {ticket.event && <p className="mt-0.5">Event: {ticket.event.title}</p>}
          </div>
        </div>

        {/* Message Thread */}
        <div className="space-y-4 pt-2">
          {ticket.messages.map((msg) => {
            const isOrganizer = msg.sender.role === 'ORGANIZER' || msg.sender.role === 'ADMIN';
            return (
              <div
                key={msg.id}
                className={`p-4 rounded-lg border text-xs space-y-2 ${
                  isOrganizer
                    ? 'border-violet-200 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-950/20 ml-4 sm:ml-8'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 mr-4 sm:mr-8'
                }`}
              >
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {isOrganizer ? (
                      <Shield className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                    )}
                    <span className={`font-semibold ${isOrganizer ? 'text-violet-700 dark:text-violet-300' : 'text-zinc-900 dark:text-zinc-200'}`}>
                      {msg.sender.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                      {msg.sender.role}
                    </span>
                  </div>

                  <span className="text-zinc-500 font-mono text-[10px]">
                    {formatDateTime(msg.createdAt)}
                  </span>
                </div>

                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line pl-5">
                  {msg.message}
                </p>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        {ticket.status !== 'CLOSED' && (
          <form action={handleSendReply} className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 block">
              Send Reply
            </label>
            <div className="flex gap-2">
              <textarea
                name="message"
                required
                rows={2}
                placeholder="Type your response to the organizers..."
                className="flex-1 px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs focus:border-violet-600 outline-none leading-relaxed"
              />
              <button
                type="submit"
                className="px-4 rounded-md bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors flex items-center justify-center shadow-xs"
                title="Send Reply"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
