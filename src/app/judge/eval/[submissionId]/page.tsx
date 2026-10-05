'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { submitJudgeScore } from '@/actions/competitions';
import { ArrowLeft, Globe, Video, Sliders, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
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
    team?: { name: string } | null;
    user: { name: string; email: string };
    event: { 
      title: string; 
      rulebookUrl?: string | null;
      judgingCriteria?: JudgingCriterion[] | null;
    };
    myScore?: {
      criteriaBreakdown: Record<string, number>;
      totalScore: number;
      feedback?: string | null;
    };
  } | null>(null);

  // Dynamic criteria state
  const [dynamicScores, setDynamicScores] = useState<Record<string, number>>({});
  
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

          const eventCriteria = data.event?.judgingCriteria as JudgingCriterion[] | undefined;
          if (eventCriteria && Array.isArray(eventCriteria) && eventCriteria.length > 0) {
            // Initialize dynamic criteria
            const initialScores: Record<string, number> = {};
            eventCriteria.forEach((c) => {
              initialScores[c.id] = data.myScore?.criteriaBreakdown?.[c.id] ?? Math.round(c.maxScore * 0.8);
            });
            setDynamicScores(initialScores);
          } else if (data.myScore?.criteriaBreakdown) {
            // Fallback legacy rubric
            setFestDirectoryUX(data.myScore.criteriaBreakdown.festDirectoryUX ?? 25);
            setRegistrationSystem(data.myScore.criteriaBreakdown.registrationSystem ?? 25);
            setOrganizerManagement(data.myScore.criteriaBreakdown.organizerManagement ?? 25);
            setBonusSolutions(data.myScore.criteriaBreakdown.bonusSolutions ?? 25);
          }
          if (data.myScore?.feedback) {
            setFeedback(data.myScore.feedback);
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

  const total = hasCustomCriteria
    ? Object.values(dynamicScores).reduce((a, b) => a + Number(b || 0), 0)
    : Number(festDirectoryUX) + Number(registrationSystem) + Number(organizerManagement) + Number(bonusSolutions);

  const maxPossible = hasCustomCriteria
    ? customCriteria.reduce((a, b) => a + Number(b.maxScore || 0), 0)
    : 120;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJudge) {
      toast.error('Fair play restriction: Only official Judges can evaluate and submit scores. Organizers cannot judge.');
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700"
          >
            <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            Official Track Rulebook (PDF)
          </a>
        )}
      </div>

      {/* Role Alert Banner if Organizer/Admin */}
      {currentUser && !isJudge && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold tracking-tight">Fair-Play Auditing Mode Active</p>
            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
              You are signed in as an <strong>{currentUser.role}</strong>. In accordance with carnival integrity standards, organizers and admins are strictly prohibited from evaluating or scoring submitted projects. Scoring controls are locked to read-only mode and can only be submitted by official certified Judges.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left 2 cols: Submission links & Brief */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                {submission?.event.title || 'Competition Track'}
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {submission?.title || 'Loading project...'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Submitted by{' '}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {submission?.team?.name || submission?.user.name}
                </span>{' '}
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
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors text-xs text-zinc-700 dark:text-zinc-300"
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
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors text-xs text-zinc-700 dark:text-zinc-300"
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
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors text-xs text-zinc-700 dark:text-zinc-300"
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
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  {hasCustomCriteria ? 'Track-Specific Evaluation Rubric' : 'Collegiate Competition Rubric'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isJudge 
                    ? 'Adjust the scoring sliders across the official evaluation dimensions.' 
                    : 'Read-only scorecard audit view. Only official judges can award points.'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400">{total}</span>
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
                      disabled={!isJudge}
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
                      disabled={!isJudge}
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
                      disabled={!isJudge}
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
                      disabled={!isJudge}
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
                      disabled={!isJudge}
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
                  disabled={!isJudge}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    isJudge
                      ? 'Leave constructive evaluation feedback for the contestants...'
                      : 'Feedback can only be provided by certified judges.'
                  }
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {isJudge ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {loading ? 'Submitting Official Score...' : `Submit Evaluation (${total}/${maxPossible} pts)`}
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-center border border-zinc-200 dark:border-zinc-700">
                  Scoring Locked — Reserved Exclusively for Official Judges
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
