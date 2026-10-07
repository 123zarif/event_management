'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { submitJudgeScore, claimSubmissionForReview, releaseSubmissionClaim } from '@/actions/competitions';
import { ArrowLeft, Globe, Video, Sliders, ShieldAlert, FileText, CheckCircle2, UserCheck, Lock } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { toast } from 'sonner';

interface JudgingCriterion {
  id: string;
  name: string;
  maxScore: number;
  description?: string;
}

export default function JudgeEvaluationPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.submissionId as string;

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string; name: string } | null>(null);
  const [submission, setSubmission] = useState<{
    id: string;
    title: string;
    repoUrl: string;
    liveDemoUrl: string;
    videoUrl?: string | null;
    description: string;
    revisionNumber?: number;
    team?: { name: string } | null;
    user: { name: string; email: string };
    event: { 
      title: string; 
      rulebookUrl?: string | null;
      judgingCriteria?: JudgingCriterion[] | null;
    };
    claimedByJudgeId?: string | null;
    claimedByJudge?: { id: string; name: string; email: string } | null;
    myScore?: {
      criteriaBreakdown: Record<string, number>;
      totalScore: number;
      feedback?: string | null;
    } | null;
    existingOtherScore?: {
      judgeId: string;
      judge: { id: string; name: string; email: string };
      criteriaBreakdown: Record<string, number>;
      totalScore: number;
      feedback?: string | null;
    } | null;
  } | null>(null);

  // Dynamic criteria state
  const [dynamicScores, setDynamicScores] = useState<Record<string, number>>({});
  const [isAssignedJudge, setIsAssignedJudge] = useState(true);
  
  // Default fallback criteria scores (0 to 30 each)
  const [festDirectoryUX, setFestDirectoryUX] = useState(25);
  const [registrationSystem, setRegistrationSystem] = useState(25);
  const [organizerManagement, setOrganizerManagement] = useState(25);
  const [bonusSolutions, setBonusSolutions] = useState(25);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [subRes, userRes] = await Promise.all([
          fetch(`/api/judge/submission/${submissionId}`),
          fetch('/api/auth/me'),
        ]);

        if (userRes.ok) {
          const u = await userRes.json();
          setCurrentUser(u);
        }

        if (subRes.ok) {
          const data = await subRes.json();
          setSubmission(data);
          if (typeof data.isAssigned === 'boolean') {
            setIsAssignedJudge(data.isAssigned);
          }

          const activeScore = data.myScore || data.existingOtherScore;
          const eventCriteria = data.event?.judgingCriteria as JudgingCriterion[] | undefined;
          
          if (eventCriteria && Array.isArray(eventCriteria) && eventCriteria.length > 0) {
            const initialScores: Record<string, number> = {};
            eventCriteria.forEach((c) => {
              initialScores[c.id] = activeScore?.criteriaBreakdown?.[c.id] ?? Math.round(c.maxScore * 0.8);
            });
            setDynamicScores(initialScores);
          } else if (activeScore?.criteriaBreakdown) {
            setFestDirectoryUX(activeScore.criteriaBreakdown.festDirectoryUX ?? 25);
            setRegistrationSystem(activeScore.criteriaBreakdown.registrationSystem ?? 25);
            setOrganizerManagement(activeScore.criteriaBreakdown.organizerManagement ?? 25);
            setBonusSolutions(activeScore.criteriaBreakdown.bonusSolutions ?? 25);
          }

          if (activeScore?.feedback) {
            setFeedback(activeScore.feedback);
          }
        }
      } catch {
        // ignore
      }
    }
    load();
  }, [submissionId]);

  const isJudge = currentUser?.role === 'JUDGE';
  const customCriteria = submission?.event?.judgingCriteria as JudgingCriterion[] | undefined;
  const hasCustomCriteria = Array.isArray(customCriteria) && customCriteria.length > 0;

  const [claimingLoading, setClaimingLoading] = useState(false);

  // Single-judge exclusivity checks (Items #19 & #41)
  const isScoredByOther = !!submission?.existingOtherScore;
  const otherJudgeName = submission?.existingOtherScore?.judge.name;
  
  const isClaimedByOther = 
    !isScoredByOther &&
    !!submission?.claimedByJudgeId && 
    submission.claimedByJudgeId !== currentUser?.id;
  const claimJudgeName = submission?.claimedByJudge?.name;

  const isClaimedByMe = 
    !isScoredByOther &&
    !!submission?.claimedByJudgeId &&
    submission.claimedByJudgeId === currentUser?.id;

  const isUnclaimed = !isScoredByOther && !submission?.claimedByJudgeId;

  // STRICT RULE (Item #41): Judge cannot evaluate unless project is claimed by them!
  const canScore = isJudge && isAssignedJudge && !isScoredByOther && !isClaimedByOther && isClaimedByMe;

  const handleClaim = async () => {
    if (!isJudge) {
      toast.error('Only certified judges can claim submissions.');
      return;
    }
    setClaimingLoading(true);
    try {
      const res = await claimSubmissionForReview(submissionId);
      if (res.success) {
        toast.success(res.message);
        setSubmission((prev) => prev ? {
          ...prev,
          claimedByJudgeId: currentUser?.id || null,
          claimedByJudge: currentUser ? { id: currentUser.id, name: currentUser.name, email: '' } : null,
        } : null);
      } else {
        toast.error(res.message);
      }
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message || 'Failed to claim project');
    } finally {
      setClaimingLoading(false);
    }
  };

  const handleRelease = async () => {
    setClaimingLoading(true);
    try {
      const res = await releaseSubmissionClaim(submissionId);
      if (res.success) {
        toast.success(res.message);
        setSubmission((prev) => prev ? {
          ...prev,
          claimedByJudgeId: null,
          claimedByJudge: null,
        } : null);
      } else {
        toast.error(res.message);
      }
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message || 'Failed to release claim');
    } finally {
      setClaimingLoading(false);
    }
  };

  const total = hasCustomCriteria
    ? Object.values(dynamicScores).reduce((a, b) => a + Number(b || 0), 0)
    : Number(festDirectoryUX) + Number(registrationSystem) + Number(organizerManagement) + Number(bonusSolutions);

  const maxPossible = hasCustomCriteria
    ? customCriteria.reduce((a, b) => a + Number(b.maxScore || 0), 0)
    : 120;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJudge) {
      toast.error('Fair play restriction: Only official Judges can evaluate and submit scores.');
      return;
    }

    if (!isAssignedJudge) {
      toast.error('Access Denied: You are not assigned to evaluate this competition track.');
      return;
    }

    if (isScoredByOther) {
      toast.error(`Locked: This submission has already been evaluated by Judge ${otherJudgeName}.`);
      return;
    }

    if (isClaimedByOther) {
      toast.error(`Locked: This submission is currently claimed by Judge ${claimJudgeName}.`);
      return;
    }

    if (!isClaimedByMe) {
      toast.error('Mandatory Claim Required: Please claim this project before submitting your evaluation.');
      return;
    }

    setLoading(true);

    try {
      if (!currentUser?.id) {
        toast.error('Please sign in as a judge to submit evaluation');
        setLoading(false);
        return;
      }

      const payload = hasCustomCriteria
        ? { dynamicCriteria: dynamicScores, feedback }
        : { festDirectoryUX, registrationSystem, organizerManagement, bonusSolutions, feedback };

      const res = await submitJudgeScore(submissionId, currentUser.id, payload);

      if (!res.success) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      toast.success(res.message);
      router.push('/judge');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to submit score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/judge"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Evaluation Queue
        </Link>

        {submission?.event?.rulebookUrl && (
          <a
            href={submission.event.rulebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700 shadow-xs"
          >
            <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            Official Track Rulebook (PDF)
          </a>
        )}
      </div>

      {/* Exclusivity Alert 1: Already Evaluated by Another Judge */}
      {isScoredByOther && (
        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-900 dark:text-violet-200 flex items-start gap-3 shadow-xs">
          <UserCheck className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold tracking-tight">
              Single-Judge Exclusivity: Evaluated by Judge {otherJudgeName}
            </p>
            <p className="text-violet-800 dark:text-violet-300/90 leading-relaxed">
              This submission was officially reviewed and graded by <strong>Judge {otherJudgeName}</strong> (awarded {submission?.existingOtherScore?.totalScore} / {maxPossible} pts). In accordance with single-judge fair play rules, once a judge submits marks, the scorecard is finalized and other judges cannot overwrite or re-evaluate it.
            </p>
          </div>
        </div>
      )}

      {/* Exclusivity Alert 2: Claimed by Another Judge */}
      {isClaimedByOther && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold tracking-tight">
              Active Claim: Under Review by Judge {claimJudgeName}
            </p>
            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
              This submission is currently locked in review by <strong>Judge {claimJudgeName}</strong>. Scoring controls are disabled for other judges until the claim is released or scored.
            </p>
          </div>
        </div>
      )}

      {/* Assignment Alert: Judge is not assigned to this track */}
      {isJudge && !isAssignedJudge && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold tracking-tight">Competition Roster Isolation Active</p>
            <p className="text-rose-800 dark:text-rose-300/90 leading-relaxed">
              You are certified as an official Judge, but you have not been assigned to evaluate <strong>{submission?.event.title}</strong>. Competition rules mandate that only judges explicitly assigned to this specific track by the organizers are permitted to score submissions.
            </p>
          </div>
        </div>
      )}

      {/* Exclusivity Alert 3: Unclaimed Project (Item #41) */}
      {isUnclaimed && isJudge && isAssignedJudge && (
        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-900 dark:text-violet-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="text-xs space-y-1">
            <p className="font-bold tracking-tight flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Claim Required Before Evaluation (Item #41)
            </p>
            <p className="text-violet-700 dark:text-violet-300 leading-relaxed">
              Official competition rules require you to claim this project before scoring. Claiming ensures no two judges evaluate the same project (Item #19).
            </p>
          </div>
          <button
            type="button"
            onClick={handleClaim}
            disabled={claimingLoading}
            className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <UserCheck className="h-4 w-4" />
            {claimingLoading ? 'Claiming...' : 'Claim Project for Evaluation'}
          </button>
        </div>
      )}

      {/* Exclusivity Alert 4: Claimed by Current Judge */}
      {isClaimedByMe && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">Project Claimed by You — Scoring Controls Active</span>
          </div>
          {!isScoredByOther && (
            <button
              type="button"
              onClick={handleRelease}
              disabled={claimingLoading}
              className="text-[11px] font-mono text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer"
            >
              {claimingLoading ? 'Updating...' : 'Release Claim to Other Judges'}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left 2 cols: Submission links & Brief */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  {submission?.event.title || 'Competition Track'}
                </span>
                {submission?.revisionNumber && submission.revisionNumber > 1 && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    Rev {submission.revisionNumber}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {submission?.title || 'Loading project...'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                Author / Team:{' '}
                <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                  {submission?.team?.name || submission?.user.name}
                </strong>{' '}
                ({submission?.user.email})
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Project Links</h3>
              <div className="flex flex-col gap-2">
                {submission?.repoUrl && (
                  <a
                    href={submission.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors text-xs text-zinc-700 dark:text-zinc-300 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <GithubIcon className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                      <span className="font-mono text-[11px] truncate max-w-[200px]">{submission.repoUrl}</span>
                    </div>
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">Inspect Repo ↗</span>
                  </a>
                )}

                {submission?.liveDemoUrl && (
                  <a
                    href={submission.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors text-xs text-zinc-700 dark:text-zinc-300 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-mono text-[11px] truncate max-w-[200px]">{submission.liveDemoUrl}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Live Deployment ↗</span>
                  </a>
                )}

                {submission?.videoUrl && (
                  <a
                    href={submission.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors text-xs text-zinc-700 dark:text-zinc-300 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-rose-500" />
                      <span className="font-mono text-[11px] truncate max-w-[200px]">{submission.videoUrl}</span>
                    </div>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Watch Video ↗</span>
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Project Brief & Description</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {submission?.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right 3 cols: Scoring Rubric */}
        <div className="lg:col-span-3">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  {hasCustomCriteria ? 'Track-Specific Evaluation Rubric' : 'Collegiate Competition Rubric'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {canScore
                    ? 'Adjust the scoring sliders across the official evaluation dimensions.' 
                    : isScoredByOther
                    ? `Finalized scorecard graded by Judge ${otherJudgeName}.`
                    : isClaimedByOther
                    ? `Claim held by Judge ${claimJudgeName}.`
                    : 'Read-only scorecard view.'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400">
                  {isScoredByOther ? submission?.existingOtherScore?.totalScore : total}
                </span>
                <span className="text-xs text-zinc-500 font-mono"> / {maxPossible} pts</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Dynamic Rubric or Default Rubric */}
              {hasCustomCriteria ? (
                customCriteria.map((crit, idx) => (
                  <div key={crit.id} className="space-y-2 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {idx + 1}. {crit.name}
                      </label>
                      <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                        {dynamicScores[crit.id] ?? 0} / {crit.maxScore} pts
                      </span>
                    </div>
                    {crit.description && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{crit.description}</p>
                    )}
                    <input
                      type="range"
                      min="0"
                      max={crit.maxScore}
                      value={dynamicScores[crit.id] ?? 0}
                      disabled={!canScore}
                      onChange={(e) =>
                        setDynamicScores((prev) => ({
                          ...prev,
                          [crit.id]: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-violet-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ))
              ) : (
                <>
                  {/* Criterion 1: Fest Directory & UX */}
                  <div className="space-y-2 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                        1. Fest Directory & UX Polishing
                      </label>
                      <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                        {festDirectoryUX} / 30 pts
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Search, multi-filters, event details, typography hierarchy, responsive design across mobile/desktop.
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={festDirectoryUX}
                      disabled={!canScore}
                      onChange={(e) => setFestDirectoryUX(Number(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Criterion 2: Registration System */}
                  <div className="space-y-2 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                        2. Registration System & Concurrency
                      </label>
                      <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                        {registrationSystem} / 30 pts
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Dynamic form engine, team invite codes, digital QR ticket pass, capacity/deadline limits, cancellation.
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={registrationSystem}
                      disabled={!canScore}
                      onChange={(e) => setRegistrationSystem(Number(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Criterion 3: Organizer Management */}
                  <div className="space-y-2 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                        3. Organizer Operations & Tools
                      </label>
                      <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                        {organizerManagement} / 30 pts
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Participant DataTable, live webcam QR check-in scanner, status changes, CSV export, analytics.
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={organizerManagement}
                      disabled={!canScore}
                      onChange={(e) => setOrganizerManagement(Number(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Criterion 4: Bonus Solutions */}
                  <div className="space-y-2 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                        4. Standout Bonus & Creative Solutions
                      </label>
                      <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                        {bonusSolutions} / 30 pts
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Automated Redis waitlist promotion, offline ticket caching, verifiable certificates, help desk.
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={bonusSolutions}
                      disabled={!canScore}
                      onChange={(e) => setBonusSolutions(Number(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </>
              )}

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Judge Feedback & Operational Remarks
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  disabled={!canScore}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    canScore
                      ? 'Leave constructive evaluation feedback for the contestants...'
                      : 'Scorecard is finalized or locked to another judge.'
                  }
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {canScore ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {loading ? 'Submitting Official Score...' : `Submit Evaluation (${total}/${maxPossible} pts)`}
                </button>
              ) : isUnclaimed && isJudge && isAssignedJudge ? (
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claimingLoading}
                  className="w-full py-2.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="h-4 w-4" />
                  {claimingLoading ? 'Claiming Project...' : 'Claim Project to Unlock Scoring'}
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-center border border-zinc-200 dark:border-zinc-700">
                  {isScoredByOther
                    ? `Scoring Finalized — Graded by Judge ${otherJudgeName}`
                    : isClaimedByOther
                    ? `Scoring Locked — Claim held by Judge ${claimJudgeName}`
                    : 'Scoring Locked — Claim Required First'}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
