'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { submitJudgeScore } from '@/actions/competitions';
import { ArrowLeft, Globe, Video, Sliders } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { toast } from 'sonner';

export default function JudgeEvaluationPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.submissionId as string;

  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<{
    id: string;
    title: string;
    repoUrl: string;
    liveDemoUrl: string;
    videoUrl?: string | null;
    description: string;
    team?: { name: string } | null;
    user: { name: string; email: string };
    event: { title: string };
    myScore?: {
      criteriaBreakdown: {
        festDirectoryUX: number;
        registrationSystem: number;
        organizerManagement: number;
        bonusSolutions: number;
      };
      feedback?: string | null;
    };
  } | null>(null);

  // Criteria scores (0 to 30 each)
  const [festDirectoryUX, setFestDirectoryUX] = useState(25);
  const [registrationSystem, setRegistrationSystem] = useState(25);
  const [organizerManagement, setOrganizerManagement] = useState(25);
  const [bonusSolutions, setBonusSolutions] = useState(25);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/judge/submission/${submissionId}`);
        if (res.ok) {
          const data = await res.json();
          setSubmission(data);
          if (data.myScore?.criteriaBreakdown) {
            setFestDirectoryUX(data.myScore.criteriaBreakdown.festDirectoryUX || 25);
            setRegistrationSystem(data.myScore.criteriaBreakdown.registrationSystem || 25);
            setOrganizerManagement(data.myScore.criteriaBreakdown.organizerManagement || 25);
            setBonusSolutions(data.myScore.criteriaBreakdown.bonusSolutions || 25);
            setFeedback(data.myScore.feedback || '');
          }
        }
      } catch {
        // ignore
      }
    }
    load();
  }, [submissionId]);

  const total = Number(festDirectoryUX) + Number(registrationSystem) + Number(organizerManagement) + Number(bonusSolutions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRes = await fetch('/api/auth/me');
      const judge = await userRes.json();
      const judgeId = judge?.id;

      if (!judgeId) {
        toast.error('Please sign in as a judge to submit evaluation');
        setLoading(false);
        return;
      }

      const res = await submitJudgeScore(submissionId, judgeId, {
        festDirectoryUX,
        registrationSystem,
        organizerManagement,
        bonusSolutions,
        feedback,
      });

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
      <Link
        href="/judge"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Judge Queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left 2 cols: Submission links & Brief */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 text-xs shadow-xs">
            <div>
              <p className="text-[10px] uppercase font-mono text-violet-600 dark:text-violet-400 font-bold">
                {submission?.event.title}
              </p>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {submission?.title || 'Project Submission'}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                {submission?.team ? `Team: ${submission.team.name}` : `Author: ${submission?.user.name}`}
              </p>
            </div>

            <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800/80 pt-3">
              <a
                href={submission?.liveDemoUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-violet-600 dark:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Open Live Working App</span>
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">External ↗</span>
              </a>

              <a
                href={submission?.repoUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GithubIcon className="h-4 w-4" />
                  <span>Inspect GitHub Repository</span>
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">External ↗</span>
              </a>

              {submission?.videoUrl && (
                <a
                  href={submission.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Watch Demo Presentation</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">External ↗</span>
                </a>
              )}
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-3 space-y-1">
              <p className="text-[10px] uppercase font-mono text-zinc-500">Project Overview</p>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {submission?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right 3 cols: Official Rubric Sliders & Scoring */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-6 shadow-xs">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  Official Scoring Rubric
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Evaluate each section out of 30 points (Total maximum: 120 pts).
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400">{total}</span>
                <span className="text-xs text-zinc-500 font-mono"> / 120</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
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
                  onChange={(e) => setFestDirectoryUX(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
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
                  onChange={(e) => setRegistrationSystem(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
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
                  onChange={(e) => setOrganizerManagement(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
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
                  onChange={(e) => setBonusSolutions(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Judge Feedback & Operational Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Leave constructive evaluation feedback for the contestants..."
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Submitting Score...' : `Submit Evaluation (${total}/120 pts)`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
