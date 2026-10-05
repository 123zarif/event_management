'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { assignJudgeToEvent, removeJudgeFromEvent } from '@/actions/judges';
import { 
  ArrowLeft, 
  Award, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface JudgeInfo {
  id: string;
  name: string;
  email: string;
  institution?: string | null;
  avatarUrl?: string | null;
}

interface AssignedJudgeItem {
  assignmentId: string;
  assignedAt: string;
  judge: JudgeInfo;
  evaluatedCount: number;
}

interface JudgeRosterClientProps {
  event: {
    id: string;
    slug: string;
    title: string;
    category: string;
    festTitle: string;
    totalSubmissions: number;
  };
  assignedJudges: AssignedJudgeItem[];
  availableJudges: JudgeInfo[];
}

export function JudgeRosterClient({
  event,
  assignedJudges: initialAssigned,
  availableJudges: initialAvailable,
}: JudgeRosterClientProps) {
  const router = useRouter();
  const [assigned, setAssigned] = useState(initialAssigned);
  const [available, setAvailable] = useState(initialAvailable);
  const [selectedJudgeId, setSelectedJudgeId] = useState(initialAvailable[0]?.id || '');
  const [loading, setLoading] = useState(false);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJudgeId) {
      toast.error('Please select a judge to assign.');
      return;
    }

    setLoading(true);

    try {
      const res = await assignJudgeToEvent(event.id, selectedJudgeId);

      if (!res.success) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      toast.success(res.message);

      const assignedJudgeObj = available.find((j) => j.id === selectedJudgeId);
      if (assignedJudgeObj) {
        setAssigned((prev) => [
          ...prev,
          {
            assignmentId: `temp-${Date.now()}`,
            assignedAt: new Date().toISOString(),
            judge: assignedJudgeObj,
            evaluatedCount: 0,
          },
        ]);
        const remaining = available.filter((j) => j.id !== selectedJudgeId);
        setAvailable(remaining);
        setSelectedJudgeId(remaining[0]?.id || '');
      }

      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to assign judge.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (judgeId: string, judgeName: string) => {
    if (!confirm(`Are you sure you want to remove ${judgeName} from this competition track?`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await removeJudgeFromEvent(event.id, judgeId);

      if (!res.success) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      toast.success(res.message);

      const removedItem = assigned.find((a) => a.judge.id === judgeId);
      if (removedItem) {
        setAssigned((prev) => prev.filter((a) => a.judge.id !== judgeId));
        setAvailable((prev) => [...prev, removedItem.judge]);
        if (!selectedJudgeId) setSelectedJudgeId(removedItem.judge.id);
      }

      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to remove judge.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Competition Brief
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Judge Roster
            </span>
            <span className="text-xs text-zinc-500 font-mono">{event.festTitle}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-2">
            <Award className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            {event.title} — Official Judges
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Assign certified judges to this track. Only judges in this roster are authorized to evaluate and score submitted student projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/judge"
            className="px-3.5 py-2 rounded-md text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            Judge Portal Overview
          </Link>
        </div>
      </div>

      {/* Fair-Play Callout */}
      <div className="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/80 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-violet-900 dark:text-violet-200">
            Strict Track-Judge Isolation Enforced
          </p>
          <p className="text-violet-700 dark:text-violet-300/90 leading-relaxed">
            By assigning judges below, you grant them exclusive authorization to grade entries for this specific track. Judges assigned to other tracks or unassigned judges are strictly blocked from scoring these projects. Organizers and Admins remain read-only auditors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Judges List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                  Assigned Track Judges ({assigned.length})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Total track submissions to evaluate: <strong className="text-zinc-900 dark:text-zinc-100">{event.totalSubmissions}</strong>
                </p>
              </div>

              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active Roster
              </span>
            </div>

            {assigned.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
                <Users className="h-8 w-8 text-zinc-400 mx-auto" />
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">No Judges Assigned Yet</p>
                <p className="text-[11px] text-zinc-500">
                  Select a certified judge from the right panel to assign them to evaluate this track.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assigned.map(({ assignmentId, judge, evaluatedCount }) => (
                  <div
                    key={assignmentId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center font-mono text-xs shrink-0">
                        {judge.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{judge.name}</p>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            Authorized
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{judge.email}</p>
                        {judge.institution && (
                          <p className="text-[11px] text-zinc-400 mt-0.5">{judge.institution}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                          {evaluatedCount} / {event.totalSubmissions}
                        </span>
                        <p className="text-[10px] text-zinc-500">Evaluated</p>
                      </div>

                      <button
                        onClick={() => handleRemove(judge.id, judge.name)}
                        disabled={loading}
                        className="px-2.5 py-1.5 rounded text-xs text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1"
                        title="Remove Judge from Roster"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Assign Judge Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <UserPlus className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              Assign Certified Judge
            </h3>

            <form onSubmit={handleAssign} className="space-y-3 text-xs">
              {available.length === 0 ? (
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-center">
                  All available certified judges in the system are currently assigned to this competition.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1.5">
                      Select Certified Judge
                    </label>
                    <select
                      value={selectedJudgeId}
                      onChange={(e) => setSelectedJudgeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                    >
                      {available.map((judge) => (
                        <option key={judge.id} value={judge.id}>
                          {judge.name} ({judge.institution || judge.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedJudgeId}
                    className="w-full py-2.5 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Authorize & Assign to Track</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
