import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/EventCard';
import { 
  Trophy, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  QrCode,
  FileCheck,
  LogIn,
  UserPlus
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export async function PublicFestShowcase() {
  const flagshipFest = await prisma.fest.findUnique({
    where: { slug: 'tech-carnival-2026' },
    include: {
      organization: true,
      events: {
        include: {
          _count: { select: { registrations: true } },
        },
        orderBy: { eventDate: 'asc' },
      },
    },
  });

  const totalRegistrations = await prisma.registration.count();
  const totalEvents = await prisma.event.count();
  const totalFests = await prisma.fest.count();

  const featuredContest = flagshipFest?.events.find(
    (e) => e.slug === 'ai-web-development-contest'
  );

  return (
    <div className="w-full space-y-8">
      {/* 1. Header / Hero section */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DRMC IT Club · 9th International Tech Carnival 2026</span>
              <span className="text-zinc-400">|</span>
              <span className="text-violet-600 dark:text-violet-400 font-mono">Public Fest Showcase</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Smart Club Operations & Competition Management Platform
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
              Eliminating Google Forms for student clubs with atomic capacity slot locking, instant QR gate check-in, 
              certified judge rubric scoring, contestant help desk ticketing, and live scoreboard standings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
            >
              <UserPlus className="h-4 w-4" />
              Register as Contestant
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <LogIn className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Sign In (Demo Switcher)
            </Link>
          </div>
        </div>

        {/* Operational Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="text-[11px] font-mono uppercase">Live Fests</span>
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalFests}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">DRMC Tech Carnival 2026</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="text-[11px] font-mono uppercase">Total Competitions</span>
              <Trophy className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalEvents}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Hackathons, Robotics, Esports</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
              <span className="text-[11px] font-mono uppercase">Total Registrations</span>
              <Users className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalRegistrations}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Atomic Postgres & Redis locks</p>
          </div>
        </div>
      </section>

      {/* 2. Flagship Centerpiece: AI Web Development Contest Showcase */}
      {featuredContest && (
        <section className="rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/20 dark:bg-zinc-900/30 p-6 relative overflow-hidden shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold bg-violet-100 dark:bg-violet-950/60 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800">
                  Featured Official Contest
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Submissions Open
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {featuredContest.title}
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                9th DRMC International Tech Carnival 2026 · Official Theme: Smart Club Operations Platform
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/events/${featuredContest.slug}/register`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
              >
                Register Team
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/events/${featuredContest.slug}/submit`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <FileCheck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                Submit Project
              </Link>
              <Link
                href={`/events/${featuredContest.slug}/leaderboard`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <Trophy className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                Standings
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <div className="lg:col-span-2 space-y-3">
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-xs sm:text-sm">
                {featuredContest.description}
              </p>
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">Official Evaluation Criteria (120 pts total):</p>
                  <span className="font-mono text-[10px] text-violet-600 dark:text-violet-400">Rulebook Compliant</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-zinc-400 block text-[10px]">Fest & UX</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">30 pts</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-zinc-400 block text-[10px]">Registration</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">30 pts</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-zinc-400 block text-[10px]">Organizer Ops</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">30 pts</span>
                  </div>
                  <div className="p-2 rounded bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-900/50">
                    <span className="text-violet-500 block text-[10px]">Bonus / Creative</span>
                    <span className="font-semibold text-violet-700 dark:text-violet-300">30 pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              {featuredContest.bannerUrl && (
                <div className="relative w-full aspect-video rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950">
                  <Image
                    src={featuredContest.bannerUrl}
                    alt={featuredContest.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Submission Deadline</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                  {featuredContest.registrationDeadline
                    ? formatDateTime(featuredContest.registrationDeadline)
                    : 'Date TBA'}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-zinc-500">Capacity & Spots</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                  {featuredContest._count?.registrations || 0} / {featuredContest.capacity} Registered
                </p>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div 
                    className="bg-violet-600 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, ((featuredContest._count?.registrations || 0) / featuredContest.capacity) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href={`/events/${featuredContest.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  View Complete Contest Specification →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Tech Carnival 2026 Competitions Directory Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Tech Carnival Competitions Directory
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Browse competitions across Hackathons, Algorithmic Programming, Autonomous Robotics, and Esports.
            </p>
          </div>
          <Link
            href="/events"
            className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium inline-flex items-center gap-1"
          >
            View all ({flagshipFest?.events.length || 0}) competitions →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {flagshipFest?.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              festSlug={flagshipFest.slug}
            />
          ))}
        </div>
      </section>

      {/* 4. ClubSphere Operational Architecture Pillars */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-6 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Why ClubSphere: Eliminating Google Forms for Student Clubs
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Designed for real-world school and university fest scale, eliminating spreadsheet confusion, ticket fraud, and manual score tallying.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            <div className="p-2 w-fit rounded bg-violet-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200">Atomic Seat Locks</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Concurrency-safe slot decrementing with automatic waitlist promotion via Redis when cancellations occur.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            <div className="p-2 w-fit rounded bg-violet-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400">
              <QrCode className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200">In-Browser QR Scanner</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Webcam gate check-in with audio feedback. Passes remain cached client-side even if auditorium Wi-Fi drops.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            <div className="p-2 w-fit rounded bg-violet-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200">Dynamic Team Codes</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Team captains generate shareable invite codes for seamless teammate joining with capacity enforcement.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
            <div className="p-2 w-fit rounded bg-violet-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200">Verifiable Certificates</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Tamper-proof digital certificates with cryptographic verification URLs and downloadable credentials.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
