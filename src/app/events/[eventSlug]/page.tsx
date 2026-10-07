import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  FileCheck, 
  Trophy, 
  HelpCircle,
  FileText,
  Sliders,
  Award,
  Edit3,
  ExternalLink,
  Code2,
  Video,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface JudgingCriterionItem {
  id?: string;
  name: string;
  maxScore: number;
  description?: string;
}

interface EventPageProps {
  params: Promise<{ eventSlug: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { eventSlug } = await params;
  const user = await getCurrentUser();

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      fest: true,
      creator: true,
      _count: { select: { registrations: true, submissions: true } },
    },
  });

  if (!event) {
    notFound();
  }

  // Check if current user already registered
  const existingRegistration = user
    ? await prisma.registration.findFirst({
        where: {
          eventId: event.id,
          userId: user.id,
          status: { not: 'CANCELLED' },
        },
      })
    : null;

  const isExpired = event.registrationDeadline ? new Date() > new Date(event.registrationDeadline) : false;
  const registeredCount = event._count?.registrations ?? 0;
  const isFull = registeredCount >= event.capacity;
  const isFillingFast = !isFull && registeredCount >= event.capacity * 0.7;
  const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';
  const isJudge = user?.role === 'JUDGE';

  // Check if judge is assigned to this event
  const isAssignedJudge = isJudge
    ? await prisma.eventJudge.findFirst({
        where: { eventId: event.id, judgeId: user.id },
      })
    : null;

  // Query past submission if attendee
  const userSubmission = user && user.role === 'ATTENDEE'
    ? await prisma.submission.findFirst({
        where: {
          eventId: event.id,
          userId: user.id,
        },
        include: {
          scores: {
            include: {
              judge: { select: { name: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      })
    : null;

  // Deadline calculation
  const now = new Date().getTime();
  const deadlineTime = event.registrationDeadline ? new Date(event.registrationDeadline).getTime() : 0;
  const diffHours = deadlineTime > now ? Math.max(0, Math.floor((deadlineTime - now) / (1000 * 60 * 60))) : 0;
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/fests" className="hover:text-zinc-900 dark:hover:text-zinc-200">
          Fests
        </Link>
        <span>/</span>
        <Link href={`/fests/${event.fest.slug}`} className="hover:text-zinc-900 dark:hover:text-zinc-200">
          {event.fest.title}
        </Link>
        <span>/</span>
        <span className="text-zinc-800 dark:text-zinc-200 truncate font-medium">{event.title}</span>
      </div>

      {/* Contest Banner Hero */}
      {event.bannerUrl && (
        <div className="relative w-full aspect-21/9 max-h-72 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-xs">
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-violet-300 font-bold px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-violet-500/40 shadow-xs">
              {event.customCategory || event.category}
            </span>
            <span className="text-xs font-mono text-zinc-300 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-zinc-700/60 shadow-xs">
              {event.fest.title}
            </span>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800">
                {event.customCategory || event.category}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {event.fest.title}
              </span>
              {isOrganizer && (
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                  Created by {event.creator?.name || 'Club Organizer'} on {formatDateTime(event.createdAt).split(',')[0]}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {event.title}
            </h1>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Action CTAs: Organizers & Judges do NOT see disabled warning (Item 34) */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
            {isOrganizer ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={`/admin/events/${event.slug}/edit`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Track & Settings</span>
                </Link>
                {event.isCompetitive && (
                  <Link
                    href={`/admin/competitions/${event.slug}/judges`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Award className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    <span>Manage Judges</span>
                  </Link>
                )}
              </div>
            ) : isJudge ? (
              isAssignedJudge ? (
                <Link
                  href={`/judge/events/${event.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Open Judge Evaluation Portal</span>
                </Link>
              ) : null
            ) : existingRegistration ? (
              <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 text-xs">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">You are Registered!</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80 mt-0.5">Ticket: {existingRegistration.ticketCode}</p>
                <Link
                  href={`/tickets/${existingRegistration.ticketCode}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-violet-700 dark:text-white underline font-medium"
                >
                  View Digital Pass →
                </Link>
              </div>
            ) : isExpired ? (
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-xs text-zinc-500">
                Registration Closed
              </div>
            ) : (
              <Link
                href={`/events/${event.slug}/register`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm"
              >
                <span>{isFull ? 'Join Automated Waitlist' : 'Register Now'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <div className="flex items-center gap-2">
              <Link
                href={`/events/${event.slug}/leaderboard`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <Trophy className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                Live Standings
              </Link>

              <Link
                href={`/support?eventId=${event.id}`}
                className="inline-flex items-center justify-center p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
                title="Ask Question / Help Desk"
              >
                <HelpCircle className="h-4 w-4" />
              </Link>
            </div>

            {event.rulebookUrl && (event.isRulebookPublished || isOrganizer) && (
              <a
                href={event.rulebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors shadow-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>
                  {event.isRulebookPublished ? 'Download Rulebook (PDF)' : 'Draft Rulebook (Unpublished)'}
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Schedule & Capacity Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-zinc-200 dark:border-zinc-800/80 pt-6 text-xs">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-mono text-zinc-500">Event Date & Time</p>
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200 font-medium">
              <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span>
                {event.isDateUndecided || !event.eventDate
                  ? 'Date TBA (Undecided)'
                  : formatDateTime(event.eventDate)}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-mono text-zinc-500">Venue</p>
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200 font-medium">
              <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span className="truncate">{event.venue || 'TBA / Campus Wide'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-mono text-zinc-500">Registration Deadline</p>
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200 font-medium">
              <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span>
                {isExpired
                  ? 'Expired'
                  : `${diffDays > 0 ? `${diffDays}d ` : ''}${remainingHours}h remaining`}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>CAPACITY</span>
              <span className="text-zinc-800 dark:text-zinc-300 font-semibold">{registeredCount} / {event.capacity}</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${
                  isFull ? 'bg-amber-500' : isFillingFast ? 'bg-orange-500' : 'bg-violet-600 dark:bg-violet-500'
                }`}
                style={{ width: `${Math.min(100, (registeredCount / event.capacity) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rules, Structure & Project Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules & Guidelines */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Competition Rules & Guidelines
            </h2>
            <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-3 leading-relaxed">
              {event.rules ? (
                <p className="whitespace-pre-line">{event.rules}</p>
              ) : (
                <p className="text-zinc-500">No specific rules posted. Follow standard DRMC IT Club contest code of conduct.</p>
              )}
            </div>
          </div>

          {/* Official Judging Rubric & Criteria */}
          {Array.isArray(event.judgingCriteria) && event.judgingCriteria.length > 0 && (event.isJudgingPublished || isOrganizer) && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <span>Official Evaluation Rubric & Criteria</span>
                    {!event.isJudgingPublished && isOrganizer && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Draft (Unpublished)
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Evaluated exclusively by certified Judges. Organizers are prohibited from scoring entries.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                  Total: {(event.judgingCriteria as unknown as JudgingCriterionItem[]).reduce((a, b) => a + Number(b.maxScore || 0), 0)} Points
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(event.judgingCriteria as unknown as JudgingCriterionItem[]).map((crit, idx) => (
                  <div
                    key={crit.id || idx}
                    className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {idx + 1}. {crit.name}
                      </span>
                      <span className="font-mono text-violet-600 dark:text-violet-400 font-bold">
                        {crit.maxScore} pts
                      </span>
                    </div>
                    {crit.description && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {crit.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Section: STRICTLY for Attendees only (Item 19 & 21) */}
          {event.isCompetitive && (!user || user.role === 'ATTENDEE') && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5 shadow-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    Project Submission Portal
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Submit your GitHub repository, live deployment URL, and presentation video before the deadline.
                  </p>
                </div>
              </div>

              {/* If user already submitted: Show their submitted project status and scores */}
              {userSubmission ? (
                <div className="p-4 rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-200/60 dark:border-violet-900/40 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{userSubmission.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-800">
                        Rev {userSubmission.revisionNumber}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Last Updated: {formatDateTime(userSubmission.updatedAt)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {userSubmission.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <a
                      href={userSubmission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-violet-500 transition-colors font-medium shadow-xs"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Code Repository</span>
                      <ExternalLink className="h-3 w-3 text-zinc-400" />
                    </a>

                    <a
                      href={userSubmission.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-violet-500 transition-colors font-medium shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-violet-500" />
                      <span>Live Deployment</span>
                    </a>

                    {userSubmission.videoUrl && (
                      <a
                        href={userSubmission.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-violet-500 transition-colors font-medium shadow-xs"
                      >
                        <Video className="h-3.5 w-3.5 text-blue-500" />
                        <span>Video Presentation</span>
                      </a>
                    )}
                  </div>

                  {/* Evaluation Scores by certified judges */}
                  {userSubmission.scores && userSubmission.scores.length > 0 ? (
                    <div className="mt-3 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <p className="text-[11px] font-mono uppercase font-semibold text-zinc-500">
                        Official Evaluation Result:
                      </p>
                      {userSubmission.scores.map((sc) => (
                        <div key={sc.id} className="text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              Graded: {sc.totalScore} pts by Judge {sc.judge?.name || 'Assigned Judge'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {formatDateTime(sc.updatedAt)}
                            </span>
                          </div>
                          {sc.feedback && (
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-100 dark:border-zinc-800/80">
                              Remarks: &ldquo;{sc.feedback}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Pending evaluation by assigned judge panel.</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-violet-200/40 dark:border-violet-900/40 flex justify-end">
                    <Link
                      href={`/events/${event.slug}/submit`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-xs"
                    >
                      <span>Update Project (Submit Rev {userSubmission.revisionNumber + 1})</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {event._count?.submissions || 0} Project Submissions Received
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Judges will evaluate entries based on official criteria configured for this track.
                    </p>
                  </div>

                  <Link
                    href={`/events/${event.slug}/submit`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs"
                  >
                    <span>Submit Project Entry</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info: Format & Team Size */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 text-xs shadow-xs">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Participation Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Format</p>
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {event.isTeamEvent ? 'Team Based' : 'Individual / Solo'}
                </p>
              </div>

              {event.isTeamEvent && (
                <div>
                  <p className="text-[10px] uppercase font-mono text-zinc-500">Team Size</p>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {event.minTeamSize} to {event.maxTeamSize} Members
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Registration Fee</p>
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {formatCurrency(event.fee)}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Organizing Fest</p>
                <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {event.fest.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
