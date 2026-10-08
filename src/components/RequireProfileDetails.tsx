'use client';

import React, { useState } from 'react';
import { updateProfileDetailsAction, logoutAction } from '@/actions/auth';
import { AuthUser } from '@/lib/auth';
import { Building2, Phone, AlertCircle, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface RequireProfileDetailsProps {
  currentUser: AuthUser | null;
}

export function RequireProfileDetails({ currentUser }: RequireProfileDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is not logged in, or already has both institution and phone, render nothing
  if (!currentUser) return null;
  const hasInstitution = Boolean(currentUser.institution && currentUser.institution.trim().length > 0);
  const hasPhone = Boolean(currentUser.phone && currentUser.phone.trim().length > 0);

  if (hasInstitution && hasPhone) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfileDetailsAction(formData);

    if (!res.success) {
      setError(res.message);
      setLoading(false);
      toast.error(res.message);
    } else {
      toast.success('Profile updated successfully!');
      // State will update as server revalidates layout
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 text-violet-600 dark:text-violet-400 mb-1">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 id="profile-dialog-title" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Profile Details Required
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Your educational institution and contact phone number are mandatory on ClubSphere for official event participation, ticketing, and verification.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="modal-institution" className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>Educational Institution / Organization</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              id="modal-institution"
              type="text"
              name="institution"
              required
              defaultValue={currentUser.institution || ''}
              placeholder="e.g. Dhaka Residential Model College"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="modal-phone" className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-zinc-400" />
              <span>Contact Phone Number</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              id="modal-phone"
              type="tel"
              name="phone"
              required
              defaultValue={currentUser.phone || ''}
              placeholder="e.g. +880 1711 000000"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Details...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Save &amp; Continue</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out Instead</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

