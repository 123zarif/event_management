'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { submitProject } from '@/actions/competitions';
import { ArrowLeft, FileCheck, Globe, Video, CheckCircle2, Clock, AlertCircle, History } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function SubmitProjectPage() {
  const router = useRouter();
  const params = useParams();
  const eventSlug = params.eventSlug as string;

  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<{ 
    id: string; 
    title: string; 
    registrationDeadline?: string;
    existingSubmission?: {
      id: string;
      title: string;
      repoUrl: string;
      liveDemoUrl: string;
      videoUrl?: string | null;
      description: string;
      revisionNumber: number;
      submittedAt: string;
    } | null;
  } | null>(null);

  const [title, setTitle] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/events/${eventSlug}`);
        if (res.ok) {
          const data = await res.json();
          setEventData(data);

          // Prefill existing submission data (Items #20 & #21)
          if (data.existingSubmission) {
            setTitle(data.existingSubmission.title || '');
            setRepoUrl(data.existingSubmission.repoUrl || '');
            setLiveDemoUrl(data.existingSubmission.liveDemoUrl || '');
            setVideoUrl(data.existingSubmission.videoUrl || '');
            setDescription(data.existingSubmission.description || '');
          }
        }
      } catch {
        // ignore
      }
    }
    load();
  }, [eventSlug]);

  const existingSub = eventData?.existingSubmission;
  const isDeadlinePassed = Boolean(
    eventData?.registrationDeadline && new Date() > new Date(eventData.registrationDeadline)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData) return;

    if (isDeadlinePassed) {
      toast.error('Submission deadline has passed. Revisions are closed.');
      return;
    }

    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      const userId = userData?.id;

      if (!userId) {
        toast.error('Please sign in to submit a project');
        setLoading(false);
        return;
      }

      const res = await submitProject(eventData.id, userId, {
        title,
        repoUrl,
        liveDemoUrl,
        videoUrl: videoUrl.trim() || undefined,
        description,
      });

      if (!res.success) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      toast.success(res.message);
      router.push(`/events/${eventSlug}?submitted=true`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href={`/events/${eventSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Event Overview
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Submission Form */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-[10px] font-mono uppercase tracking-wider font-bold">
              <FileCheck className="h-4 w-4" />
              <span>Contest Entry Submission</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {eventData?.title || 'Project Submission'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Submit your project repository and live URL for judge evaluation. You can update this entry as many times as you like before the deadline.
            </p>
          </div>

          {/* Existing Submission Status / Revisions Banner (Items #20 & #21) */}
          {existingSub && (
            <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Existing Submission: Revision #{existingSub.revisionNumber}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-zinc-500">
                  Last submitted {formatDateTime(existingSub.submittedAt)}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Your previous entry details have been prefilled below. Making changes and submitting will record <strong>Revision #{existingSub.revisionNumber + 1}</strong>.
              </p>
            </div>
          )}

          {/* Deadline Alert Banner */}
          {eventData?.registrationDeadline && (
            <div className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
              isDeadlinePassed
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}>
              {isDeadlinePassed ? (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              ) : (
                <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
              )}
              <div>
                <span>
                  {isDeadlinePassed
                    ? `Submission Closed: The deadline passed on ${formatDateTime(eventData.registrationDeadline)}. Revisions are no longer accepted.`
                    : `Revision Window Open: You can submit updates freely until ${formatDateTime(eventData.registrationDeadline)}.`}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                Project Title *
              </label>
              <input
                type="text"
                required
                disabled={isDeadlinePassed}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ClubSphere — Smart Club Operations"
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs focus:border-violet-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                Public GitHub Repository URL *
              </label>
              <input
                type="url"
                required
                disabled={isDeadlinePassed}
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your-username/your-repo"
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono text-xs focus:border-violet-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-zinc-500">
                Must be public and include an MIT License per contest rulebook guidelines.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                Live Working Deployment URL *
              </label>
              <input
                type="url"
                required
                disabled={isDeadlinePassed}
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                placeholder="https://your-project.vercel.app"
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono text-xs focus:border-violet-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-zinc-500">
                Judges will interact with and stress-test this live URL.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                Video Demo / Walkthrough URL (Optional)
              </label>
              <input
                type="url"
                disabled={isDeadlinePassed}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or Loom"
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono text-xs focus:border-violet-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                Technical Highlights & Architecture Notes (Markdown) *
              </label>
              <textarea
                required
                disabled={isDeadlinePassed}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail key architectural decisions: Next.js App Router, Docker PostgreSQL/Redis, concurrency handling, QR scanner, and bonus features..."
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs focus:border-violet-600 outline-none font-mono resize-y disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || isDeadlinePassed}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors disabled:opacity-50 shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Submitting to Evaluation Queue...'
                  : isDeadlinePassed
                  ? 'Revisions Closed (Deadline Passed)'
                  : existingSub
                  ? `Save & Submit Revision #${existingSub.revisionNumber + 1}`
                  : 'Submit Entry for Official Judging'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Evaluation Rubric Card */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 text-xs shadow-xs">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Evaluation Rubric (120 pts)
            </h3>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Fest Directory & UX (30 pts)</span>
                <span className="text-[10px] text-zinc-500">Design clarity, dark mode, responsive layout</span>
              </div>

              <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Registration Flow (30 pts)</span>
                <span className="text-[10px] text-zinc-500">Dynamic fields, teams, concurrency locks</span>
              </div>

              <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Organizer Ops (30 pts)</span>
                <span className="text-[10px] text-zinc-500">Webcam QR check-in, export, ticket queue</span>
              </div>

              <div className="p-2.5 rounded bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900">
                <span className="font-semibold text-violet-700 dark:text-violet-300 block">Creative & Bonus (30 pts)</span>
                <span className="text-[10px] text-violet-600 dark:text-violet-400">Scoreboard freeze, bracket progression, certs</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Live scores update automatically</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
