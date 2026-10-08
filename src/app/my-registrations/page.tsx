import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Ticket, 
  Calendar, 
  ArrowRight, 
  XCircle, 
  FolderGit2, 
  ExternalLink, 
  Video, 
  FileCheck, 
  Clock, 
  Award,
  Plus
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { formatDateTime } from '@/lib/utils';
import { cancelRegistration } from '@/actions/registration';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Event Registrations & Tickets',
  description: 'Manage your collegiate event tickets, team registrations, and project submissions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MyRegistrationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  // FAIR PLAY & RBAC RESTRICTION: Non-attendees cannot register, so block this route (Item #42)
  if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
    redirect('/admin');
  }

  if (user.role === 'JUDGE') {
    redirect('/judge');
  }

  const [registrations, submissions] = await Promise.all([
    user
      ? prisma.registration.findMany({
          where: { userId: user.id },
          include: {
            event: {
              include: { fest: true },
            },
            team: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [],
    user
      ? prisma.submission.findMany({
          where: { userId: user.id },
          include: {
            event: true,
            scores: {
              include: { judge: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        })
      : [],
  ]);

  const submissionMap = new Map(submissions.map((s) => [s.eventId, s]));

  async function handleCancel(formData: FormData) {
    'use server';
    const ticketCode = formData.get('ticketCode') as string;
    if (ticketCode) {
      await cancelRegistration(ticketCode);
      revalidatePath('/my-registrations');
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Ticket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          My Registrations & Project Submissions
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          View your active festival accreditation passes, check-in status, and track your submitted competition entries.
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-3 shadow-xs">
          <Ticket className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No event registrations found</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You have not registered for any competitions or festival events yet.
          </p>
          <div className="pt-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
            >
              Browse Competitions
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {registrations.map((reg) => {
            const submission = submissionMap.get(reg.eventId);
            const isCompetitive = reg.event.isCompetitive;
            const latestScore = submission?.scores && submission.scores.length > 0 ? submission.scores[0] : null;

            return (
              <div
                key={reg.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs overflow-hidden"
              >
                {/* Main Pass Row */}
                <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                        {reg.event.fest.title}
                      </span>
                      <StatusBadge status={reg.status} />
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      <Link href={`/events/${reg.event.slug}`} className="hover:text-violet-600 dark:hover:text-violet-400">
                        {reg.event.title}
                      </Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-mono text-zinc-800 dark:text-zinc-300 font-medium">Ticket: {reg.ticketCode}</span>
                      {reg.team && (
                        <span className="text-violet-600 dark:text-violet-400 font-medium">Team: {reg.team.name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                        {reg.event.eventDate ? formatDateTime(reg.event.eventDate) : 'Date TBA'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {reg.status !== 'CANCELLED' ? (
                      <>
                        <Link
                          href={`/tickets/${reg.ticketCode}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 dark:hover:text-white transition-colors"
                        >
                          <span>Digital Pass (QR)</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        {reg.status !== 'CHECKED_IN' && (
                          <form action={handleCancel}>
                            <input type="hidden" name="ticketCode" value={reg.ticketCode} />
                            <button
                              type="submit"
                              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                              title="Cancel Registration (Freed slot promotes next waitlist candidate)"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </form>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono">Cancelled</span>
                    )}
                  </div>
                </div>

                {/* Submissions Section (Item #21) */}
                {isCompetitive && reg.status !== 'CANCELLED' && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 sm:p-5">
                    {submission ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                              {submission.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                              Rev {submission.revisionNumber}
                            </span>
                          </div>

                          {/* Judge score / Evaluation status */}
                          <div>
                            {latestScore ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                <Award className="h-3.5 w-3.5" />
                                <span>Graded: {latestScore.totalScore} pts (Judge {latestScore.judge.name})</span>
                              </div>
                            ) : submission.claimedByJudgeId ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-700 dark:text-amber-300">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Under Active Judge Review</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Submitted · Awaiting Evaluation</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {submission.description && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {submission.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                          {/* Links */}
                          <div className="flex flex-wrap items-center gap-3">
                            {submission.repoUrl && (
                              <a
                                href={submission.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                              >
                                <FolderGit2 className="h-3.5 w-3.5 text-zinc-400" />
                                <span>Repository</span>
                              </a>
                            )}
                            {submission.liveDemoUrl && (
                              <a
                                href={submission.liveDemoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                                <span>Live Demo</span>
                              </a>
                            )}
                            {submission.videoUrl && (
                              <a
                                href={submission.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                              >
                                <Video className="h-3.5 w-3.5 text-zinc-400" />
                                <span>Demo Pitch</span>
                              </a>
                            )}
                          </div>

                          {/* Update Project Action */}
                          <Link
                            href={`/events/${reg.event.slug}/submit`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            <span>Update Project (Submit Rev {submission.revisionNumber + 1})</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                            Project Submission Portal Open
                          </p>
                          <p className="text-zinc-500">
                            You haven&apos;t submitted your project repo or demo for this track yet.
                          </p>
                        </div>

                        <Link
                          href={`/events/${reg.event.slug}/submit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-xs shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Submit Project Now</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
