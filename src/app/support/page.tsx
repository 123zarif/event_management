'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupportTicket } from '@/actions/support';
import { StatusBadge } from '@/components/StatusBadge';
import { HelpCircle, Plus, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface TicketItem {
  id: string;
  ticketNumber: number;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  messages: Array<{ id: string; message: string; createdAt: string }>;
  event?: { title: string } | null;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [subject, setSubject] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [category, setCategory] = useState<'TECHNICAL' | 'TEAM_ISSUES' | 'RULES_CLARIFICATION' | 'REGISTRATION' | 'GENERAL'>('GENERAL');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'URGENT'>('NORMAL');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/support/my-tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        setEvents(data.events || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/support/my-tickets');
        if (res.ok && !ignore) {
          const data = await res.json();
          setTickets(data.tickets || []);
          setEvents(data.events || []);
        }
      } catch {
        // ignore
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRes = await fetch('/api/auth/me');
      const user = await userRes.json();
      const userId = user?.id;

      if (!userId) {
        toast.error('Please sign in to submit a support ticket');
        setLoading(false);
        return;
      }

      const res = await createSupportTicket(userId, {
        eventId: selectedEventId || undefined,
        subject,
        category,
        priority,
        initialMessage: message,
      });

      if (!res.success) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      toast.success(res.message);
      setShowCreateModal(false);
      setSubject('');
      setMessage('');
      loadData();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Contestant Help Desk & Support
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Need assistance with registrations, team rosters, or contest rules? Open a ticket to speak directly with organizers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {tickets.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-3 shadow-xs">
            <MessageSquare className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No support tickets found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              If you have any doubts, inquiries, or team issues, click above to open a ticket.
            </p>
          </div>
        ) : (
          tickets.map((t) => (
            <Link
              key={t.id}
              href={`/support/${t.id}`}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group block shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-violet-600 dark:text-violet-400">
                    #TK-{t.ticketNumber}
                  </span>
                  <StatusBadge status={t.status} />
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                    {t.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                  {t.subject}
                </h3>

                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  {t.event && <span>Event: {t.event.title}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(t.createdAt)}
                  </span>
                  <span>{t.messages.length} messages</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                <span>View Discussion</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Open Support Ticket
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 text-xs"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about team member replacement"
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as typeof category)}
                    className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none"
                  >
                    <option value="GENERAL">General Inquiry</option>
                    <option value="TECHNICAL">Technical Doubt</option>
                    <option value="TEAM_ISSUES">Team / Roster Issue</option>
                    <option value="RULES_CLARIFICATION">Rules Clarification</option>
                    <option value="REGISTRATION">Registration Issue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as typeof priority)}
                    className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Related Event (Optional)
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none"
                >
                  <option value="">None / General Fest</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Message / Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your question or issue for the organizers..."
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
