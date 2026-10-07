'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateEvent, JudgingCriterionInput } from '@/actions/events';
import { createCategory } from '@/actions/categories';
import { EventCategory } from '@prisma/client';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Sliders, 
  Layers, 
  Loader2,
  Trophy,
  Calendar,
  Tag,
  X,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  description?: string | null;
}

export interface ExistingEventData {
  id: string;
  festId: string;
  title: string;
  slug: string;
  category: EventCategory;
  categoryId?: string | null;
  customCategory?: string | null;
  isCompetitive: boolean;
  description: string;
  rules?: string | null;
  rulebookUrl?: string | null;
  bannerUrl?: string | null;
  judgingCriteria: JudgingCriterionInput[];
  venue?: string | null;
  isDateUndecided: boolean;
  hasSpecificTime: boolean;
  eventDate?: string | null;
  registrationDeadline?: string | null;
  isRulebookPublished: boolean;
  isJudgingPublished: boolean;
  capacity: number;
  fee: number;
  isTeamEvent: boolean;
  minTeamSize: number;
  maxTeamSize: number;
}

interface EditEventFormProps {
  event: ExistingEventData;
  fests: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
  }>;
  initialCategories?: CategoryItem[];
}

export function EditEventForm({ 
  event, 
  fests, 
  initialCategories = [] 
}: EditEventFormProps) {
  const router = useRouter();

  // Mode: Competitive Track vs General Event
  const [isCompetitive, setIsCompetitive] = useState(event.isCompetitive);

  // Dynamic Categories
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    event.categoryId || initialCategories[0]?.id || ''
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('violet');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Basic Information
  const [festId, setFestId] = useState(event.festId);
  const [title, setTitle] = useState(event.title);
  const [slug, setSlug] = useState(event.slug);
  const [category, setCategory] = useState<EventCategory>(event.category);
  const [customCategory, setCustomCategory] = useState(event.customCategory || '');
  const [description, setDescription] = useState(event.description);
  const [rules, setRules] = useState(event.rules || '');
  const [venue, setVenue] = useState(event.venue || '');
  const [isDateUndecided, setIsDateUndecided] = useState(event.isDateUndecided);
  const [hasSpecificTime, setHasSpecificTime] = useState(event.hasSpecificTime);
  const [eventDate, setEventDate] = useState(
    event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : ''
  );
  const [registrationDeadline, setRegistrationDeadline] = useState(
    event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : ''
  );
  const [capacity, setCapacity] = useState(event.capacity);
  const [fee, setFee] = useState(event.fee);

  // Team Configuration
  const [isTeamEvent, setIsTeamEvent] = useState(event.isTeamEvent);
  const [minTeamSize, setMinTeamSize] = useState(event.minTeamSize);
  const [maxTeamSize, setMaxTeamSize] = useState(event.maxTeamSize);

  // PDF Rulebook State
  const [rulebookFile, setRulebookFile] = useState<File | null>(null);
  const [rulebookUrl, setRulebookUrl] = useState(event.rulebookUrl || '');
  const [isRulebookPublished, setIsRulebookPublished] = useState(event.isRulebookPublished);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');

  // Banner Artwork State
  const [bannerUrl, setBannerUrl] = useState(event.bannerUrl || '');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState('');

  // Judging Criteria Rubric Builder
  const [isJudgingPublished, setIsJudgingPublished] = useState(event.isJudgingPublished);
  const [criteria, setCriteria] = useState<JudgingCriterionInput[]>(
    event.judgingCriteria.length > 0
      ? event.judgingCriteria
      : [
          { id: 'c1', name: 'UI/UX Polish & Visual Hierarchy', maxScore: 30, description: 'Clean layout, typography, edge-to-edge desktop & responsive mobile design' },
          { id: 'c2', name: 'System Architecture & Concurrency', maxScore: 30, description: 'PostgreSQL transactions, Redis waitlists, and concurrency safety' },
          { id: 'c3', name: 'Operational Tools & QR Check-in', maxScore: 30, description: 'Live scanner, attendee registry, status triage, and CSV export' },
          { id: 'c4', name: 'Bonus Features & Fair-Play Safeguards', maxScore: 30, description: 'Verifiable tickets, offline support, role separation safeguards' },
        ]
  );

  const [submitting, setSubmitting] = useState(false);

  // PDF File Selection and Upload
  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfError('');

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

  // Banner File Selection and Upload
  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerError('');

    const validExts = ['.png', '.jpg', '.jpeg', '.webp'];
    const lowerName = file.name.toLowerCase();
    if (!validExts.some((ext) => lowerName.endsWith(ext))) {
      setBannerError('Invalid format: Only PNG, JPEG, and WebP images are permitted.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setBannerError('File size exceeds 10 MB limit.');
      return;
    }

    setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventSlug', slug || 'banner');

      const res = await fetch('/api/admin/upload-banner', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload banner');
      }

      setBannerUrl(data.url);
      toast.success('Banner uploaded successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      setBannerError(error.message);
      toast.error(error.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  // Criteria operations
  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
        id: `c_${Date.now()}`,
        name: 'Evaluation Criterion',
        maxScore: 25,
        description: 'Specific performance requirement or rubric metric',
      },
    ]);
  };

  const updateCriterion = (index: number, field: keyof JudgingCriterionInput, value: string | number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length <= 1) {
      toast.error('Competitions must have at least one evaluation criterion.');
      return;
    }
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const totalMaxScore = criteria.reduce((sum, c) => sum + (Number(c.maxScore) || 0), 0);

  // Quick category creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCat(true);
    try {
      const res = await createCategory({
        name: newCatName.trim(),
        color: newCatColor,
        description: newCatDesc.trim(),
      });

      if (!res.success || !res.category) {
        toast.error(res.message);
        setCreatingCat(false);
        return;
      }

      toast.success(res.message);
      const newCat: CategoryItem = {
        id: res.category.id,
        name: res.category.name,
        slug: res.category.slug,
        color: res.category.color,
        description: res.category.description,
      };

      setCategories((prev) => [...prev, newCat]);
      setSelectedCategoryId(newCat.id);
      setCustomCategory(newCat.name);
      setNewCatName('');
      setNewCatDesc('');
      setShowCategoryModal(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create category');
    } finally {
      setCreatingCat(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a track title.');
      return;
    }

    if (!slug.trim()) {
      toast.error('Please enter a valid URL slug.');
      return;
    }

    if (!isDateUndecided && !eventDate) {
      toast.error('Please specify an event date, or mark the date as undecided.');
      return;
    }

    if (isCompetitive && criteria.length === 0) {
      toast.error('Competitions must have at least one judging criterion.');
      return;
    }

    setSubmitting(true);

    try {
      const selectedCatObj = categories.find((c) => c.id === selectedCategoryId);

      const res = await updateEvent(event.id, {
        festId,
        title: title.trim(),
        slug: slug.trim(),
        category,
        categoryId: selectedCategoryId || undefined,
        customCategory: selectedCatObj ? selectedCatObj.name : customCategory.trim() || undefined,
        isCompetitive,
        description: description.trim(),
        rules: rules.trim() || undefined,
        rulebookUrl: isCompetitive ? (rulebookUrl.trim() || undefined) : undefined,
        bannerUrl: bannerUrl.trim() || undefined,
        isRulebookPublished,
        isJudgingPublished,
        judgingCriteria: isCompetitive ? criteria : undefined,
        venue: venue.trim() || undefined,
        isDateUndecided,
        hasSpecificTime,
        eventDate: !isDateUndecided && eventDate ? new Date(eventDate).toISOString() : undefined,
        registrationDeadline: !isDateUndecided && registrationDeadline ? new Date(registrationDeadline).toISOString() : undefined,
        capacity: Number(capacity) || 50,
        fee: Number(fee) || 0,
        isTeamEvent,
        minTeamSize: isTeamEvent ? Number(minTeamSize) : 1,
        maxTeamSize: isTeamEvent ? Number(maxTeamSize) : 1,
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
      toast.error(error.message || 'Failed to update track.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Competition Hub
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Organizer Track Studio
            </span>
            <span className="text-xs text-zinc-500 font-mono">Track & Rules Editor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
            Edit Track: {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Update event parameters, PDF rulebooks, and rubric evaluation rubrics. Publish or hold rulebooks and criteria in draft.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/events/${event.slug}`}
            className="px-4 py-2 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Save Track Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Classification & Core Info */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              1. Competition Track Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Host Carnival / Fest *
                </label>
                <select
                  value={festId}
                  onChange={(e) => setFestId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                >
                  {fests.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title} ({f.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Track Nature
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCompetitive(true)}
                    className={`py-2 px-3 rounded-md text-xs font-medium border text-center transition-colors cursor-pointer ${
                      isCompetitive
                        ? 'bg-violet-600 text-white border-violet-600 font-semibold shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Competitive Contest
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompetitive(false)}
                    className={`py-2 px-3 rounded-md text-xs font-medium border text-center transition-colors cursor-pointer ${
                      !isCompetitive
                        ? 'bg-violet-600 text-white border-violet-600 font-semibold shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    General Session
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Track Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. National High School Hackathon 2026"
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  URL Slug *
                </label>
                <div className="flex items-center rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">/events/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="w-full bg-transparent border-none outline-none font-mono text-zinc-900 dark:text-zinc-100 ml-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Category Classification
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-[10px] text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="h-2.5 w-2.5" />
                    <span>New Category</span>
                  </button>
                </div>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    const selected = categories.find((c) => c.id === e.target.value);
                    if (selected) {
                      setCustomCategory(selected.name);
                      const slugUpper = selected.slug.toUpperCase();
                      if (['HACKATHON', 'CONTEST', 'WORKSHOP', 'ROBOTICS', 'GAMING'].includes(slugUpper)) {
                        setCategory(slugUpper as EventCategory);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Overview & Summary *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this competition entails..."
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Date, Time & Venue */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              2. Schedule & Physical Venue
            </h2>

            <div className="flex flex-wrap items-center gap-6 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={isDateUndecided}
                  onChange={(e) => setIsDateUndecided(e.target.checked)}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />
                <span>Schedule TBA / Date Not Yet Decided</span>
              </label>

              {!isDateUndecided && (
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={hasSpecificTime}
                    onChange={(e) => setHasSpecificTime(e.target.checked)}
                    className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Include Specific Time (Hour/Minute)</span>
                </label>
              )}
            </div>

            {!isDateUndecided && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Contest Date {hasSpecificTime ? '& Start Time' : ''} *
                  </label>
                  <input
                    type={hasSpecificTime ? 'datetime-local' : 'date'}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required={!isDateUndecided}
                    className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Registration Deadline
                  </label>
                  <input
                    type={hasSpecificTime ? 'datetime-local' : 'date'}
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Physical Campus Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Auditorium Hall B, 3rd Floor (leave blank if undecided / campus-wide)"
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
              />
            </div>
          </div>

          {/* Section 3: Rules & PDF Rulebook Upload (Item 15 & 37) */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  3. Rules & Official PDF Rulebook
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Publish or hold rulebook release until ready.
                </p>
              </div>

              {/* Publish Toggle (Item 15) */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-500">Release:</span>
                <button
                  type="button"
                  onClick={() => setIsRulebookPublished(!isRulebookPublished)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                    isRulebookPublished
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {isRulebookPublished ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Published to Public</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                      <span>Draft (Unpublished)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Rules & Guidelines Text
              </label>
              <textarea
                rows={4}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Detail eligibility, code of conduct, disqualification criteria, and required equipment..."
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none leading-relaxed"
              />
            </div>

            {/* PDF File Upload */}
            {isCompetitive && (
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Official Rulebook Document (Strictly PDF)
                </label>

                {rulebookUrl ? (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                          {rulebookFile ? rulebookFile.name : rulebookUrl.split('/').pop()}
                        </p>
                        <a
                          href={rulebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-violet-600 dark:text-violet-400 underline font-mono"
                        >
                          Preview Document →
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePdf}
                      className="p-1 text-zinc-400 hover:text-rose-500 transition-colors ml-2"
                      title="Remove PDF"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-5 text-center space-y-2">
                    <input
                      type="file"
                      id="pdfUpload"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfSelect}
                      className="hidden"
                      disabled={uploadingPdf}
                    />
                    <label
                      htmlFor="pdfUpload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
                    >
                      {uploadingPdf ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Uploading PDF...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-3.5 w-3.5 text-violet-600" />
                          <span>Choose PDF Rulebook Document</span>
                        </>
                      )}
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Upload official competition rulebook (.pdf only, max 25 MB).
                    </p>
                    {pdfError && <p className="text-xs text-rose-500">{pdfError}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Evaluation Rubric & Judging Criteria (Item 15 & 37) */}
          {isCompetitive && (
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
                    <Sliders className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    4. Evaluation Rubric & Judging Criteria
                  </h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Evaluated exclusively by assigned judges.
                  </p>
                </div>

                {/* Rubric Publish Toggle (Item 15) */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-zinc-500">Release:</span>
                  <button
                    type="button"
                    onClick={() => setIsJudgingPublished(!isJudgingPublished)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                      isJudgingPublished
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {isJudgingPublished ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Public Rubric</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                        <span>Draft / Secret Rubric</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800">
                    Total: {totalMaxScore} Pts
                  </span>
                </div>
              </div>

              {/* Rubric Items */}
              <div className="space-y-3">
                {criteria.map((crit, index) => (
                  <div
                    key={crit.id || index}
                    className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={crit.name}
                        onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                        placeholder="Criterion Name (e.g. Code Architecture)"
                        required
                        className="flex-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
                      />

                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={crit.maxScore}
                          onChange={(e) => updateCriterion(index, 'maxScore', Number(e.target.value) || 0)}
                          required
                          className="w-16 px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-right font-mono font-bold text-violet-600 dark:text-violet-400 outline-none"
                        />
                        <span className="text-xs font-mono text-zinc-500">pts</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                        title="Remove criterion"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={crit.description || ''}
                      onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                      placeholder="Scoring guidance for evaluator (e.g. Clean separation of concerns, test coverage)..."
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addCriterion}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Rubric Criterion</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Configuration (Right Column) */}
        <div className="space-y-6">
          {/* Capacity & Fee */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              Capacity & Pricing
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Maximum Slot Capacity *
              </label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Waitlist is automatically activated when limit is reached.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Admission Fee (BDT)
              </label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Enter 0 for free participant entry.
              </p>
            </div>
          </div>

          {/* Team Participation */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Participation Structure
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={isTeamEvent}
                  onChange={(e) => setIsTeamEvent(e.target.checked)}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />
                <span>Team-Based Competition</span>
              </label>

              {isTeamEvent && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                      Min Members
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={minTeamSize}
                      onChange={(e) => setMinTeamSize(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 mb-1">
                      Max Members
                    </label>
                    <input
                      type="number"
                      min={minTeamSize}
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Banner Graphic Artwork */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              Contest Card Banner
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Upload Banner Image or Paste URL
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  id="bannerUploadEdit"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBannerSelect}
                  className="hidden"
                  disabled={uploadingBanner}
                />
                <label
                  htmlFor="bannerUploadEdit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
                >
                  {uploadingBanner ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Uploading banner...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5 text-violet-600" />
                      <span>Upload Image File</span>
                    </>
                  )}
                </label>
                {bannerError && <p className="text-xs text-rose-500">{bannerError}</p>}
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>
            </div>

            {bannerUrl && (
              <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video relative bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-violet-600" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Create Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Data Science & ML"
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Accent Color
                </label>
                <select
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  <option value="violet">Electric Violet</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="cyan">Cyan Blue</option>
                  <option value="amber">Amber Gold</option>
                  <option value="rose">Rose Red</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Summary of this category..."
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCat}
                  className="px-3.5 py-1.5 rounded-md bg-violet-600 text-white font-semibold flex items-center gap-1.5"
                >
                  {creatingCat ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <span>Create</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
