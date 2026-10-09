'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerForEvent } from '@/actions/registration';
import { createTeam, joinTeam } from '@/actions/teams';
import { 
  ArrowLeft, 
  Users, 
  User, 
  KeyRound, 
  CheckCircle2,
  Calendar,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function EventRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const eventSlug = params.eventSlug as string;

  const [eventData, setEventData] = useState<{
    id: string;
    title: string;
    slug: string;
    description: string;
    isTeamEvent: boolean;
    minTeamSize: number;
    maxTeamSize: number;
    fee: number;
    capacity: number;
    venue: string;
    eventDate: string;
    registrationDeadline: string;
    fest: { title: string };
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'CREATE_TEAM' | 'JOIN_TEAM' | 'SOLO'>('CREATE_TEAM');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventSlug}`);
        if (res.ok) {
          const data = await res.json();
          setEventData(data);
          if (!data.isTeamEvent) {
            setMode('SOLO');
          }
        }
      } catch {
        // ignore
      }
    }
    fetchEvent();
  }, [eventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData) return;

    setLoading(true);

    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      const userId = userData?.id;

      if (!userId) {
        toast.error('Please sign in to register for this event');
        router.push(`/login?callbackUrl=${encodeURIComponent(`/events/${eventSlug}/register`)}`);
        return;
      }

      let resultTicketCode: string | undefined;

      if (mode === 'CREATE_TEAM') {
        if (!teamName.trim()) {
          toast.error('Please enter a team name');
          setLoading(false);
          return;
        }
        const res = await createTeam(eventData.id, userId, teamName);
        if (!res.success) {
          toast.error(res.message);
          setLoading(false);
          return;
        }
        toast.success(res.message);
        resultTicketCode = res.ticketCode;
      } else if (mode === 'JOIN_TEAM') {
        if (!inviteCode.trim()) {
          toast.error('Please enter a team invite code');
          setLoading(false);
          return;
        }
        const res = await joinTeam(inviteCode, userId);
        if (!res.success) {
          toast.error(res.message);
          setLoading(false);
          return;
        }
        toast.success(res.message);
        resultTicketCode = res.ticketCode;
      } else {
        const res = await registerForEvent(eventData.id, userId, {});
        if (!res.success) {
          toast.error(res.message);
          setLoading(false);
          return;
        }
        toast.success(res.message);
        resultTicketCode = res.ticketCode;
      }

      if (resultTicketCode) {
        router.push(`/tickets/${resultTicketCode}`);
      } else {
        router.push('/my-registrations');
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb back link */}
      <div>
        <Link
          href={`/events/${eventSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {eventData?.title || 'Event Details'}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Structured Registration Form */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <p className="text-[10px] uppercase font-mono tracking-wider text-violet-600 dark:text-violet-400 font-bold">
              Official Registration Form
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {eventData?.title || 'Event Registration'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Secure your spot with instant ticket issuance. Zero manual forms or spreadsheet delays.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Mode Switcher for Team Events */}
            {eventData?.isTeamEvent && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Select Registration Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('CREATE_TEAM')}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border text-xs font-medium transition-colors ${
                      mode === 'CREATE_TEAM'
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Create New Team</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('JOIN_TEAM')}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border text-xs font-medium transition-colors ${
                      mode === 'JOIN_TEAM'
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Join with Invite Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* Fields based on mode */}
            {mode === 'CREATE_TEAM' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Neural Pioneers"
                  className="w-full px-3.5 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs focus:border-violet-600 outline-none"
                />
                <p className="text-[11px] text-zinc-500">
                  As the team captain, you will receive a shareable invite code to add teammates.
                </p>
              </div>
            )}

            {mode === 'JOIN_TEAM' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Team Invite Code *
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TC-4X9B2"
                  className="w-full px-3.5 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono text-xs uppercase focus:border-violet-600 outline-none"
                />
                <p className="text-[11px] text-zinc-500">
                  Enter the unique code provided by your team captain.
                </p>
              </div>
            )}

            {mode === 'SOLO' && (
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Individual Participant Registration
                </p>
                <p>You will be accredited as a solo competitor. A QR digital pass will be generated instantly.</p>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {loading ? 'Processing Registration...' : 'Confirm Registration & Issue Ticket Pass'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Event Overview & Rules Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 text-xs shadow-xs">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Event Summary
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Festival</p>
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {eventData?.fest?.title || 'DRMC Tech Carnival 2026'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Venue</p>
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-violet-500" />
                  <span>{eventData?.venue || 'Campus Auditorium'}</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Event Date</p>
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-violet-500" />
                  <span>{eventData?.eventDate ? formatDateTime(eventData.eventDate) : 'TBD'}</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Registration Fee</p>
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {eventData ? formatCurrency(eventData.fee) : 'Free'}
                </p>
              </div>

              {eventData?.isTeamEvent && (
                <div>
                  <p className="text-[10px] uppercase font-mono text-zinc-500">Roster Capacity</p>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {eventData.minTeamSize} - {eventData.maxTeamSize} Members per team
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Instant Ticket Issuance Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
