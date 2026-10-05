'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createEvent, JudgingCriterionInput } from '@/actions/events';
import { EventCategory } from '@prisma/client';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Sliders, 
  Layers, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface CreateEventFormProps {
  fests: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
  }>;
}

export function CreateEventForm({ fests }: CreateEventFormProps) {
  const router = useRouter();

  // Basic Information
  const [festId, setFestId] = useState(fests[0]?.id || '');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [category, setCategory] = useState<EventCategory>(EventCategory.CONTEST);
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('DRMC Computing Labs & Auditorium');
  const [eventDate, setEventDate] = useState('2026-10-09T18:00');
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-10-09T12:00');
  const [capacity, setCapacity] = useState(50);
  const [fee, setFee] = useState(0);

  // Team Configuration
  const [isTeamEvent, setIsTeamEvent] = useState(true);
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(4);

  // PDF Rulebook State
  const [rulebookFile, setRulebookFile] = useState<File | null>(null);
  const [rulebookUrl, setRulebookUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');

  // Judging Criteria Rubric Builder
  const [criteria, setCriteria] = useState<JudgingCriterionInput[]>([
    { id: 'c1', name: 'UI/UX Polish & Visual Hierarchy', maxScore: 30, description: 'Clean layout, typography, edge-to-edge desktop & responsive mobile design' },
    { id: 'c2', name: 'System Architecture & Concurrency', maxScore: 30, description: 'PostgreSQL transactions, Redis waitlists, and concurrency safety' },
    { id: 'c3', name: 'Operational Tools & QR Check-in', maxScore: 30, description: 'Live scanner, attendee registry, status triage, and CSV export' },
    { id: 'c4', name: 'Bonus Features & Fair-Play Safeguards', maxScore: 30, description: 'Verifiable tickets, offline support, role separation safeguards' },
  ]);

  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // PDF File Selection and Upload
  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfError('');

    // Strict validation: Must end with .pdf and have application/pdf MIME type
    if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
      const errorMsg = 'Invalid file type: Strictly official PDF documents (.pdf) are permitted.';
      setPdfError(errorMsg);
      toast.error(errorMsg);
      e.target.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      const errorMsg = 'File exceeds maximum limit of 25 MB.';
      setPdfError(errorMsg);
      toast.error(errorMsg);
      e.target.value = '';
      return;
    }

    setRulebookFile(file);
    setUploadingPdf(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventSlug', slug || 'competition');

      const res = await fetch('/api/admin/upload-rulebook', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload PDF rulebook');
      }

      setRulebookUrl(data.url);
      toast.success('PDF rulebook verified and uploaded successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      setPdfError(error.message);
      toast.error(error.message);
      setRulebookFile(null);
    } finally {
      setUploadingPdf(false);
    }
  };

  const removePdf = () => {
    setRulebookFile(null);
    setRulebookUrl('');
    setPdfError('');
  };

  // Criteria Management
  const addCriterion = () => {
    const nextId = `c${Date.now()}`;
    setCriteria((prev) => [
      ...prev,
      { id: nextId, name: 'New Evaluation Dimension', maxScore: 25, description: '' },
    ]);
  };

  const updateCriterion = (id: string, updates: Partial<JudgingCriterionInput>) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeCriterion = (id: string) => {
    if (criteria.length <= 1) {
      toast.error('Competitions require at least 1 judging criterion.');
      return;
    }
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const applyPreset = (preset: '120pt' | '100pt' | 'robotics') => {
    if (preset === '120pt') {
      setCriteria([
        { id: 'c1', name: 'UI/UX Polish & Visual Hierarchy', maxScore: 30, description: 'Clean layout, typography, edge-to-edge desktop & responsive mobile design' },
        { id: 'c2', name: 'System Architecture & Concurrency', maxScore: 30, description: 'PostgreSQL transactions, Redis waitlists, and concurrency safety' },
        { id: 'c3', name: 'Operational Tools & QR Check-in', maxScore: 30, description: 'Live scanner, attendee registry, status triage, and CSV export' },
        { id: 'c4', name: 'Bonus Features & Fair-Play Safeguards', maxScore: 30, description: 'Verifiable tickets, offline support, role separation safeguards' },
      ]);
      toast.info('Applied 120-Point Collegiate Carnival Rubric');
    } else if (preset === '100pt') {
      setCriteria([
        { id: 'c1', name: 'Code Quality & Technical Execution', maxScore: 40, description: 'Code architecture, test coverage, and documentation' },
        { id: 'c2', name: 'Product Innovation & Impact', maxScore: 30, description: 'Novel solution approach, originality, and problem solving' },
        { id: 'c3', name: 'UI/UX Design & Usability', maxScore: 30, description: 'Intuitive user interface, accessibility, and responsiveness' },
      ]);
      toast.info('Applied 100-Point Hackathon Rubric');
    } else if (preset === 'robotics') {
      setCriteria([
        { id: 'c1', name: 'Arena Navigation & Speed Time', maxScore: 50, description: 'Time taken to complete course obstacles without faults' },
        { id: 'c2', name: 'Mechanical & Sensor Precision', maxScore: 30, description: 'Chassis build quality, sensor calibration, and wiring' },
        { id: 'c3', name: 'Autonomous Recovery & Robustness', maxScore: 20, description: 'Recovery from loss of line tracking or collisions' },
      ]);
      toast.info('Applied Robotics Arena Rubric');
    }
  };

  const totalRubricScore = criteria.reduce((sum, c) => sum + (Number(c.maxScore) || 0), 0);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a competition title.');
      return;
    }

    if (!slug.trim()) {
      toast.error('Please enter a valid slug.');
      return;
    }

    if (!festId) {
      toast.error('Please select a target festival.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await createEvent({
        festId,
        title: title.trim(),
        slug: slug.trim(),
        category,
        description: description.trim(),
        venue: venue.trim(),
        eventDate,
        registrationDeadline,
        capacity: Number(capacity) || 50,
        fee: Number(fee) || 0,
        isTeamEvent,
        minTeamSize: isTeamEvent ? Number(minTeamSize) : 1,
        maxTeamSize: isTeamEvent ? Number(maxTeamSize) : 1,
        rulebookUrl: rulebookUrl || undefined,
        judgingCriteria: criteria,
      });

      if (!res.success) {
        toast.error(res.message);
        setSubmitting(false);
        return;
      }

      toast.success(res.message);
      router.push(`/events/${res.eventSlug}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to publish competition.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Organizer Command Center
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Organizer Studio
            </span>
            <span className="text-xs text-zinc-500 font-mono">Create Competition / Event</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
            New Competition Track
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Configure competition rules, team constraints, official PDF rulebook, and dynamic judging criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Publishing Track...
              </>
            ) : (
              'Publish Competition'
            )}
          </button>
        </div>
      </div>

      {/* Fair-Play Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-900 dark:text-amber-200">Fair-Play Architecture & Role Separation</p>
          <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
            As an Organizer, you configure this competition, its PDF rulebook, and its evaluation criteria. However, <strong>organizers and administrators cannot evaluate or score submitted student projects</strong>. Scoring is strictly restricted to certified Judge accounts to eliminate bias and ensure fair carnival play.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              1. Competition Track Metadata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Target Festival *
                </label>
                <select
                  value={festId}
                  onChange={(e) => setFestId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                >
                  {fests.map((fest) => (
                    <option key={fest.id} value={fest.id}>
                      {fest.title} ({fest.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                >
                  <option value={EventCategory.CONTEST}>CONTEST (Competitive Programming, Olympiad)</option>
                  <option value={EventCategory.HACKATHON}>HACKATHON (AI, Web, App Dev)</option>
                  <option value={EventCategory.ROBOTICS}>ROBOTICS (LFR, Robo Soccer, Combat)</option>
                  <option value={EventCategory.GAMING}>GAMING (Esports, Valorant, FIFA)</option>
                  <option value={EventCategory.WORKSHOP}>WORKSHOP (Technical Bootcamp)</option>
                  <option value={EventCategory.SEMINAR}>SEMINAR (Keynote, Panel)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Competition Track Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Autonomous Line Following Robotics (LFR)"
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[10px] text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    {autoSlug ? 'Customize Slug' : 'Auto Slug'}
                  </button>
                </div>
                <div className="flex items-center rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">/events/</span>
                  <input
                    type="text"
                    value={slug}
                    readOnly={autoSlug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="w-full bg-transparent border-0 text-zinc-900 dark:text-zinc-100 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Venue & Room *
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g., DRMC Central Arena / Lab 3"
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Description & Contest Theme
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the competition track, problem statements, and requirements..."
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Strict PDF-Only Rulebook Upload */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                  2. Official Rulebook Document
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Upload the official competition regulations document. <strong className="text-violet-600 dark:text-violet-400 font-mono">Strictly PDF format only.</strong>
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                PDF Only
              </span>
            </div>

            {/* Dropzone */}
            {!rulebookUrl ? (
              <div>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-violet-500/80 rounded-xl cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/40 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    {uploadingPdf ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {uploadingPdf ? 'Verifying and uploading PDF...' : 'Click to select or drag and drop PDF rulebook'}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Accepts only <span className="font-mono text-violet-600 dark:text-violet-400">.pdf</span> (MIME application/pdf). Max 25 MB.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfSelect}
                    disabled={uploadingPdf}
                    className="hidden"
                  />
                </label>
                {pdfError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {pdfError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {rulebookFile?.name || 'Verified Rulebook.pdf'}
                      </p>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      application/pdf • Verified PDF signature • Accessible at {rulebookUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={rulebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
                  >
                    Preview
                  </a>
                  <button
                    type="button"
                    onClick={removePdf}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Dynamic Judging Criteria & Rubric Builder */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  3. Dynamic Judging Criteria & Rubric
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Define custom scoring dimensions for official judges. Sliders and scorecards will automatically adapt.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-500">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('120pt')}
                  className="px-2 py-1 text-[11px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  120-pt
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('100pt')}
                  className="px-2 py-1 text-[11px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  100-pt
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('robotics')}
                  className="px-2 py-1 text-[11px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  Robotics
                </button>
              </div>
            </div>

            {/* Criteria List */}
            <div className="space-y-3">
              {criteria.map((c, idx) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-mono text-xs w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
                      placeholder="Criterion Dimension Name"
                      className="flex-1 px-2.5 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:border-violet-600 outline-none font-medium"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-zinc-500 font-mono text-[11px]">Max:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={c.maxScore}
                        onChange={(e) => updateCriterion(c.id, { maxScore: Number(e.target.value) })}
                        className="w-16 px-2 py-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                      />
                      <span className="text-zinc-500 text-[11px]">pts</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriterion(c.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors ml-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={c.description || ''}
                    onChange={(e) => updateCriterion(c.id, { description: e.target.value })}
                    placeholder="Brief evaluation guideline for judges (optional)..."
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] focus:border-violet-600 outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={addCriterion}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700 self-start"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Evaluation Dimension
              </button>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-zinc-500">Cumulative Rubric Max:</span>
                <span className="font-bold text-violet-600 dark:text-violet-400 text-sm">
                  {totalRubricScore} Points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Operations & Capacity */}
        <div className="space-y-6">
          {/* Schedule & Capacity */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Schedule & Quotas
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Event Date & Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Capacity Limit *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Entry Fee (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Participation Mode */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                Participation Mode
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isTeamEvent}
                  onChange={(e) => setIsTeamEvent(e.target.checked)}
                  className="rounded accent-violet-600"
                />
                Team Event
              </label>
            </div>

            {isTeamEvent ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxTeamSize}
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min={minTeamSize}
                    max="10"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Solo contestant registration. Each participant registers independently.
              </p>
            )}
          </div>

          {/* Quick Submit Card */}
          <div className="p-5 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/60 space-y-3">
            <h4 className="text-xs font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Publishing Checklist
            </h4>
            <ul className="text-[11px] space-y-1.5 text-zinc-600 dark:text-zinc-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className={`h-3.5 w-3.5 ${title ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <span>Track title & slug configured</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className={`h-3.5 w-3.5 ${rulebookUrl ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <span>{rulebookUrl ? 'PDF Rulebook attached' : 'PDF Rulebook optional'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className={`h-3.5 w-3.5 ${criteria.length > 0 ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <span>{criteria.length} Judging dimensions ({totalRubricScore} pts)</span>
              </li>
            </ul>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publishing Track...
                </>
              ) : (
                'Publish Competition Track'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
