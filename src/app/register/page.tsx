'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signupAction, switchPersonaAction } from '@/actions/auth';
import { UserPlus, ArrowRight, Shield, Award, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signupAction(formData);
    if (res && !res.success) {
      setError(res.message);
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    setLoading(true);
    await switchPersonaAction(
      email,
      email === 'organizer@drmc.edu' ? '/admin' : email === 'judge@drmc.edu' ? '/judge' : '/events'
    );
  };

  return (
    <div className="w-full py-8 flex items-center justify-center min-h-[calc(100vh-14rem)]">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-sm dark:shadow-none space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 dark:bg-zinc-900 border border-violet-200 dark:border-zinc-800 text-violet-600 dark:text-violet-400 mb-2">
              <UserPlus className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Register for tech festivals, join competitive teams, and generate tickets.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Tanvir Hasan"
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="tanvir@institution.edu"
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block">
                Password (min. 6 characters) <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-medium text-zinc-700 dark:text-zinc-300 block">
                  Institution
                </label>
                <input
                  type="text"
                  name="institution"
                  placeholder="DRMC / College"
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-zinc-700 dark:text-zinc-300 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+880 1711..."
                  className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account & Continue'}
            </button>
          </form>

          {/* 1-Click Demo Personas for Judges */}
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 text-center">
              Or Fast-Login as Evaluator Persona
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('organizer@drmc.edu')}
                className="flex items-center justify-between p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-violet-400 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <div>
                    <span className="font-medium">Club Organizer</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">organizer@drmc.edu</span>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('judge@drmc.edu')}
                className="flex items-center justify-between p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-violet-400 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <div>
                    <span className="font-medium">Contest Judge</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">judge@drmc.edu</span>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student@drmc.edu')}
                className="flex items-center justify-between p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-violet-400 text-xs text-zinc-800 dark:text-zinc-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <div>
                    <span className="font-medium">Student Attendee</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">student@drmc.edu</span>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-violet-600 dark:text-violet-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
