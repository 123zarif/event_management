'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createFest } from '@/actions/fests';
import { FestStatus } from '@prisma/client';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Layers, 
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
}

interface CreateFestFormProps {
  organizations: OrganizationItem[];
}

export function CreateFestForm({ organizations }: CreateFestFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id || '');
  const [location, setLocation] = useState('DRMC Main Campus, Mirpur Road, Dhaka');
  const [startDate, setStartDate] = useState('2026-11-15T09:00');
  const [endDate, setEndDate] = useState('2026-11-17T18:00');
  const [status, setStatus] = useState<FestStatus>(FestStatus.UPCOMING);
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-slug generator
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a festival/event title.');
      return;
    }

    if (!slug.trim()) {
      toast.error('Please enter a valid slug.');
      return;
    }

    if (!location.trim()) {
      toast.error('Please enter the venue location.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after the end date.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await createFest({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate,
        endDate,
        status,
        bannerUrl: bannerUrl.trim() || undefined,
        organizationId: organizationId || undefined,
      });

      if (!res.success) {
        toast.error(res.message);
        setSubmitting(false);
        return;
      }

      toast.success(res.message);
      // Immediately forward into the newly created festival view where they can add competitions
      router.push(`/fests/${res.festSlug}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to publish festival.');
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
            <span className="text-xs text-zinc-500 font-mono">Carnival & Festival Creator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
            Create Overarching Festival / Event
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Publish overarching carnivals, olympiads, or science fests. You can immediately add and attach competitions to this event.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/fests"
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
                Publishing Festival...
              </>
            ) : (
              'Publish Festival & Open Tracks'
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              1. Festival Identity & Branding
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Festival / Event Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., 8th Tech Carnival 2026 or Winter Science Fest 2025"
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    URL Identifier (Slug) *
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
                  <span className="text-zinc-400 font-mono text-[11px]">/fests/</span>
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
                  Host Organization *
                </label>
                <div className="relative">
                  <select
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Venue & Campus Location *
              </label>
              <div className="flex items-center rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., DRMC Main Campus & Science Laboratories, Dhaka"
                  required
                  className="w-full bg-transparent border-0 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Festival Description & Overview
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive summary of the festival, participating schools/colleges, exhibitions, and schedule..."
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Dates & Schedule */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              2. Festival Dates & Schedule
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Opening Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Closing Date & Ceremony *
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Status & Next Steps */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Operational Status
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FestStatus)}
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-medium"
                >
                  <option value={FestStatus.UPCOMING}>UPCOMING (Announced, registrations open)</option>
                  <option value={FestStatus.ONGOING}>ONGOING (Carnival is live right now)</option>
                  <option value={FestStatus.COMPLETED}>COMPLETED (Past Carnival archive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Workflow Explanation Card */}
          <div className="p-5 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/60 space-y-3">
            <h4 className="text-xs font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Hierarchy Workflow
            </h4>
            <div className="text-[11px] space-y-2 text-zinc-600 dark:text-zinc-300">
              <p>
                <strong>1. Publish Festival Container:</strong> Creates the umbrella event (e.g., <em>{title || 'Your Festival'}</em>).
              </p>
              <p>
                <strong>2. Attach Competitions:</strong> After saving, you will be taken to the festival page to attach specific contests (Robotics, Coding, AI, Esports).
              </p>
              <p>
                <strong>3. Global Switcher:</strong> This festival will instantly be available in the top navigation bar for all users to switch between editions.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-3 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish & Open Track Studio'
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
