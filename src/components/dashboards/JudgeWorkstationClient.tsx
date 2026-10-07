'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  FileText,
  Lock,
  Layers,
  UserCheck,
  Search
} from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { formatDateTime } from '@/lib/utils';
import { claimSubmissionForReview, releaseSubmissionClaim } from '@/actions/competitions';
import { toast } from 'sonner';

export interface SubmissionItem {
  id: string;
  eventId: string;
  title: string;
  repoUrl: string;
  liveDemoUrl: string;
  videoUrl?: string | null;
  description: string;
  submittedAt: Date | string;
  revisionNumber?: number;
  team?: { name: string } | null;
  user: { name: string; email: string };
  claimedByJudgeId?: string | null;
  claimedByJudge?: { id: string; name: string; email: string } | null;
  scores: Array<{
    id: string;
    judgeId: string;
    totalScore: number;
    judge: { id: string; name: string; email: string };
  }>;
  event: {
    id: string;
    slug: string;
    title: string;
    category: string;
    customCategory?: string | null;
    isScoreboardFrozen: boolean;
    rulebookUrl?: string | null;
    fest: {
      title: string;
    };
  };
}

interface JudgeWorkstationClientProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedTracks: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    customCategory?: string | null;
    rulebookUrl?: string | null;
    submissionsCount: number;
  }>;
  initialSubmissions: SubmissionItem[];
}

export function JudgeWorkstationClient({
  currentUser,
  assignedTracks,
  initialSubmissions,
}: JudgeWorkstationClientProps) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isPending, startTransition] = useTransition();

  // Metrics calculation
  const totalSubmissions = submissions.length;
  const claimedByMeCount = submissions.filter((s) => s.claimedByJudgeId === currentUser.id).length;
  const evaluatedByMeCount = submissions.filter((s) => s.scores.some((sc) => sc.judgeId === currentUser.id)).length;
  const unclaimedCount = submissions.filter((s) => !s.claimedByJudgeId && s.scores.length === 0).length;

  // Claim handler
  const handleClaim = (submissionId: string) => {
    startTransition(async () => {
      try {
        const res = await claimSubmissionForReview(submissionId);
        if (res.success) {
          toast.success(res.message);
          setSubmissions((prev) =>
            prev.map((s) =>
              s.id === submissionId
                ? {
                    ...s,
                    claimedByJudgeId: currentUser.id,
                    claimedByJudge: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
                  }
                : s
            )
          );
        } else {
          toast.error(res.message);
        }
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'Failed to claim project');
      }
    });
  };

  // Release handler
  const handleRelease = (submissionId: string) => {
    startTransition(async () => {
      try {
        const res = await releaseSubmissionClaim(submissionId);
        if (res.success) {
          toast.success(res.message);
          setSubmissions((prev) =>
            prev.map((s) =>
              s.id === submissionId
                ? {
                    ...s,
                    claimedByJudgeId: null,
                    claimedByJudge: null,
                  }
                : s
            )
          );
        } else {
          toast.error(res.message);
        }
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'Failed to release claim');
      }
    });
  };

  // Filter & Sort logic
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. Track filter
      if (selectedTrackId !== 'all' && sub.eventId !== selectedTrackId) {
        return false;
      }

      // 2. Status filter
      if (selectedStatusFilter === 'unclaimed') {
        if (sub.claimedByJudgeId || sub.scores.length > 0) return false;
      } else if (selectedStatusFilter === 'claimed_by_me') {
        if (sub.claimedByJudgeId !== currentUser.id) return false;
      } else if (selectedStatusFilter === 'evaluated_by_me') {
        if (!sub.scores.some((sc) => sc.judgeId === currentUser.id)) return false;
      } else if (selectedStatusFilter === 'others') {
        const isMyClaim = sub.claimedByJudgeId === currentUser.id;
        const isMyScore = sub.scores.some((sc) => sc.judgeId === currentUser.id);
        const hasOtherClaim = sub.claimedByJudgeId && sub.claimedByJudgeId !== currentUser.id;
        const hasOtherScore = sub.scores.some((sc) => sc.judgeId !== currentUser.id);
        if (!hasOtherClaim && !hasOtherScore) return false;
        if (isMyClaim || isMyScore) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = sub.title.toLowerCase().includes(query);
        const matchesUser = sub.user.name.toLowerCase().includes(query) || sub.user.email.toLowerCase().includes(query);
        const matchesTeam = sub.team?.name?.toLowerCase().includes(query) || false;
        const matchesTrack = sub.event.title.toLowerCase().includes(query);
        if (!matchesTitle && !matchesUser && !matchesTeam && !matchesTrack) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (sortBy === 'revision') {
        return (b.revisionNumber || 1) - (a.revisionNumber || 1);
      }
      if (sortBy === 'track') {
        return a.event.title.localeCompare(b.event.title);
      }
      if (sortBy === 'score_desc') {
        const scoreA = a.scores[0]?.totalScore || 0;
        const scoreB = b.scores[0]?.totalScore || 0;
        return scoreB - scoreA;
      }
      return 0;
    });
  }, [submissions, selectedTrackId, selectedStatusFilter, searchQuery, sortBy, currentUser.id]);

  return (
    <div className="w-full space-y-6">
      {/* 1. Workstation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Evaluation Workstation · Item #40
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Certified Judge: {currentUser.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            Judge Scoring Suite & Global Queue
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Unified evaluation feed displaying all contestant submissions across your {assignedTracks.length} assigned competition tracks.
          </p>
        </div>

        {/* Action strip */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <span>Overview Dashboard</span>
          </Link>
          <Link
            href="/leaderboards"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Public Scoreboards</span>
          </Link>
        </div>
      </div>

      {/* 2. Executive Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase">
            <span>Total Submissions</span>
            <Trophy className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalSubmissions}</p>
          <p className="text-[10px] text-zinc-500 font-mono">Across {assignedTracks.length} tracks</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase">
            <span>Claimed By You</span>
            <Lock className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{claimedByMeCount}</p>
          <p className="text-[10px] text-zinc-500 font-mono">Locked for your evaluation</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase">
            <span>Evaluated By You</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{evaluatedByMeCount}</p>
          <p className="text-[10px] text-zinc-500 font-mono">Official scores published</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase">
            <span>Unclaimed Queue</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{unclaimedCount}</p>
          <p className="text-[10px] text-zinc-500 font-mono">Ready for judge pickup</p>
        </div>
      </div>

      {/* 3. Interactive Filtering Bar */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search title, student, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-violet-600 outline-none"
            />
          </div>

          {/* Competition Track Filter */}
          <div>
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:border-violet-600 outline-none cursor-pointer"
            >
              <option value="all">All Assigned Tracks ({assignedTracks.length})</option>
              {assignedTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.submissionsCount})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:border-violet-600 outline-none cursor-pointer"
            >
              <option value="all">All Evaluation States</option>
              <option value="unclaimed">Unclaimed (Needs Reviewer)</option>
              <option value="claimed_by_me">Claimed by You</option>
              <option value="evaluated_by_me">Evaluated by You</option>
              <option value="others">Claimed/Graded by Other Judges</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:border-violet-600 outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest Submissions First</option>
              <option value="oldest">Sort: Oldest Submissions First</option>
              <option value="revision">Sort: Highest Revision Number</option>
              <option value="track">Sort: Track Title (A–Z)</option>
              <option value="score_desc">Sort: Highest Total Score</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 font-mono">
          <div>
            Showing <strong className="text-zinc-800 dark:text-zinc-200">{filteredSubmissions.length}</strong> of{' '}
            {totalSubmissions} submissions
            {selectedTrackId !== 'all' && ' · Filtered by Track'}
            {selectedStatusFilter !== 'all' && ' · Filtered by Status'}
            {searchQuery && ` · Matching "${searchQuery}"`}
          </div>

          {(selectedTrackId !== 'all' || selectedStatusFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedTrackId('all');
                setSelectedStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* 4. High-Density Unified Submissions Queue */}
      {filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-3 shadow-xs">
          <Award className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No submissions matching criteria</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting another competition track, or resetting the evaluation status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTrackId('all');
              setSelectedStatusFilter('all');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xs divide-y divide-zinc-200 dark:divide-zinc-800">
          {filteredSubmissions.map((sub) => {
            const myScore = sub.scores.find((s) => s.judgeId === currentUser.id);
            const otherScore = sub.scores.find((s) => s.judgeId !== currentUser.id);
            const isScoredByMe = !!myScore;
            const isScoredByOther = !isScoredByMe && !!otherScore;
            const isClaimedByMe = !sub.scores.length && sub.claimedByJudgeId === currentUser.id;
            const isClaimedByOther = !sub.scores.length && !!sub.claimedByJudgeId && sub.claimedByJudgeId !== currentUser.id;
            const isUnclaimed = !sub.scores.length && !sub.claimedByJudgeId;

            return (
              <div
                key={sub.id}
                className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  isClaimedByMe
                    ? 'bg-violet-50/40 dark:bg-violet-950/20'
                    : isClaimedByOther || isScoredByOther
                    ? 'bg-zinc-50/50 dark:bg-zinc-900/20 opacity-80'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                }`}
              >
                {/* Left Area: Badges, Title, Links, Details */}
                <div className="space-y-2 max-w-2xl">
                  {/* Category & Status Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                      {sub.event.customCategory || sub.event.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 font-medium">
                      {sub.event.title}
                    </span>
                    {sub.revisionNumber && sub.revisionNumber > 1 && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        Rev #{sub.revisionNumber}
                      </span>
                    )}

                    {/* Operational Status Badges */}
                    {isScoredByMe && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Scored: {myScore?.totalScore} pts
                      </span>
                    )}

                    {isScoredByOther && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        <UserCheck className="h-3 w-3" />
                        Graded by {otherScore?.judge.name} ({otherScore?.totalScore} pts)
                      </span>
                    )}

                    {isClaimedByMe && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800 animate-pulse">
                        <Lock className="h-3 w-3" />
                        Claimed by You
                      </span>
                    )}

                    {isClaimedByOther && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Lock className="h-3 w-3" />
                        Claimed by {sub.claimedByJudge?.name || 'Another Judge'}
                      </span>
                    )}

                    {isUnclaimed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Clock className="h-3 w-3" />
                        Unclaimed · Ready for Review
                      </span>
                    )}
                  </div>

                  {/* Project Title */}
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    <Link
                      href={`/judge/eval/${sub.id}`}
                      className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                      {sub.title}
                    </Link>
                  </h3>

                  {/* Submitter & Team Information */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      Submitted by{' '}
                      <strong className="text-zinc-800 dark:text-zinc-200 font-medium">
                        {sub.team ? `${sub.team.name} (${sub.user.name})` : sub.user.name}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono">{formatDateTime(sub.submittedAt)}</span>
                  </div>

                  {/* Description snippet */}
                  {sub.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 leading-relaxed">
                      {sub.description}
                    </p>
                  )}

                  {/* Artifact Links Strip */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                    {sub.repoUrl && (
                      <a
                        href={sub.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                        <span>Repository</span>
                      </a>
                    )}
                    {sub.liveDemoUrl && (
                      <a
                        href={sub.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {sub.videoUrl && (
                      <a
                        href={sub.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-rose-500" />
                        <span>Video Demo</span>
                      </a>
                    )}
                    {sub.event.rulebookUrl && (
                      <a
                        href={sub.event.rulebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Track Rules</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Area: Fast Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800/80 justify-end">
                  {/* If claimed by me: allow release + direct evaluate */}
                  {isClaimedByMe && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRelease(sub.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Release Claim
                      </button>
                      <Link
                        href={`/judge/eval/${sub.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Evaluate Now</span>
                      </Link>
                    </>
                  )}

                  {/* If evaluated by me: view or update score */}
                  {isScoredByMe && (
                    <Link
                      href={`/judge/eval/${sub.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700 shadow-xs"
                    >
                      <Award className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>View / Edit Score</span>
                    </Link>
                  )}

                  {/* If unclaimed: fast 1-click claim button */}
                  {isUnclaimed && (
                    <button
                      type="button"
                      onClick={() => handleClaim(sub.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 dark:bg-zinc-800 hover:bg-violet-600 dark:hover:bg-violet-600 text-white transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Claim Project</span>
                    </button>
                  )}

                  {/* If claimed or scored by another judge: locked view only */}
                  {(isClaimedByOther || isScoredByOther) && (
                    <Link
                      href={`/judge/eval/${sub.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      <Lock className="h-3 w-3" />
                      <span>Inspect Details</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
