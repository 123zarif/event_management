'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateFest, deleteFest } from '@/actions/fests';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { FestStatus } from '@prisma/client';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Layers, 
  Loader2,
  CheckCircle2,
  UploadCloud,
  Trash2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
}

interface FestData {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: FestStatus;
  bannerUrl?: string | null;
  organizationId: string;
}

interface EditFestFormProps {
  fest: FestData;
  organizations: OrganizationItem[];
}

export function EditFestForm({ fest, organizations }: EditFestFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(fest.title);
  const [slug, setSlug] = useState(fest.slug);
  const [organizationId, setOrganizationId] = useState(fest.organizationId);
  const [location, setLocation] = useState(fest.location);
  const [startDate, setStartDate] = useState(
    fest.startDate ? new Date(fest.startDate).toISOString().slice(0, 16) : ''
  );
  const [endDate, setEndDate] = useState(
    fest.endDate ? new Date(fest.endDate).toISOString().slice(0, 16) : ''
  );
  const [status, setStatus] = useState<FestStatus>(fest.status);
  const [description, setDescription] = useState(fest.description);
  const [bannerUrl, setBannerUrl] = useState(fest.bannerUrl || '');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      formData.append('eventSlug', slug || 'fest-banner');

      const res = await fetch('/api/admin/upload-banner', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload banner');
      }

      setBannerUrl(data.url);
      toast.success('Festival banner uploaded successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      setBannerError(error.message);
      toast.error(error.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const removeBanner = () => {
    setBannerUrl('');
    setBannerError('');
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
      const res = await updateFest(fest.id, {
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
      router.push(`/fests/${res.festSlug}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update festival.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteFest(fest.id);
      if (!res.success) {
        toast.error(res.message);
        setDeleting(false);
        return;
      }

      toast.success(res.message);
      setShowDeleteModal(false);
      router.push('/admin');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete festival.');
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <Link
            href={`/fests/${fest.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Festival Hub
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Organizer Studio
            </span>
            <span className="text-xs text-zinc-500 font-mono">Festival Editor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
            Edit Festival: {fest.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Update carnival identity, dates, status, venue, and descriptions. Changes reflect immediately across attendee directory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Permanently delete this festival"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Festival</span>
          </button>
          <Link
            href={`/fests/${fest.slug}`}
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
                <span>Save Festival Changes</span>
              </>
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
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 9th Tech Carnival 2026 or Winter Science Fest 2025"
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  URL Identifier (Slug) *
                </label>
                <div className="flex items-center rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs">
                  <span className="text-zinc-400 font-mono text-[11px]">/fests/</span>
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
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Host Organization
                </label>
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

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Overview & Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the festival..."
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Dates & Venue */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              2. Dates & Main Venue
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Main Campus Venue / Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. DRMC Main Campus, Mirpur Road, Dhaka"
                required
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Lifecycle & Banner */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              Festival Status
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Current Operational State
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FestStatus)}
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:border-violet-600 outline-none font-semibold"
              >
                <option value={FestStatus.UPCOMING}>UPCOMING (Announced)</option>
                <option value={FestStatus.ONGOING}>ONGOING (Live Carnivals)</option>
                <option value={FestStatus.COMPLETED}>COMPLETED (Past Fest)</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                Festival Banner Graphic
              </h2>
              <span className="text-[10px] text-zinc-500 font-mono">PNG, JPG, WEBP (Max 10MB)</span>
            </div>

            {!bannerUrl ? (
              <div>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-violet-500/80 rounded-xl cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/40 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    {uploadingBanner ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {uploadingBanner ? 'Verifying and uploading banner...' : 'Click to select or drag and drop festival banner'}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Standard 16:9 banner artwork displayed on festival portal, directory, and event showcases.
                  </p>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                    onChange={handleBannerSelect}
                    disabled={uploadingBanner}
                    className="hidden"
                  />
                </label>
                {bannerError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {bannerError}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-xs">
                <div className="relative aspect-video w-full max-h-56 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerUrl}
                    alt="Banner Preview"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Banner Attached
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 font-medium cursor-pointer">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                        onChange={handleBannerSelect}
                        disabled={uploadingBanner}
                        className="hidden"
                      />
                      {uploadingBanner ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <span>Replace Image</span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-rose-500/30 dark:border-rose-900/40 bg-rose-500/5 dark:bg-rose-950/20 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Danger Zone
              </span>
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Delete this Festival
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Permanently delete <strong className="text-zinc-800 dark:text-zinc-200">{fest.title}</strong> along with all associated competition tracks, registrations, project submissions, and judge scores.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs flex-shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Festival</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Festival"
        itemName={fest.title}
        expectedSlug={fest.slug}
        impactNotice={
          <p>
            Permanently deletes <strong className="font-semibold text-rose-700 dark:text-rose-300">{fest.title}</strong> and cascades to all nested competition tracks, attendee registrations, and judging records.
          </p>
        }
        isDeleting={deleting}
      />
    </form>
  );
}
