'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth';
import { LogIn, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);
    if (res && !res.success) {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-12 flex items-center justify-center min-h-[calc(100vh-14rem)] px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Authentication Card */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-sm dark:shadow-none space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-zinc-900 border border-violet-200 dark:border-zinc-800 text-violet-600 dark:text-violet-400 mb-2">
              <LogIn className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Sign In to ClubSphere
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your credentials to access your authorized station.
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
              <label htmlFor="email" className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@institution.edu"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Password
                </label>
                <Link
                  href="/support"
                  className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Need help?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs focus:border-violet-600 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              Join DRMC
            </Link>
          </div>
        </div>

        {/* Quick Credentials Reference for Evaluators & Judges */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Evaluation Credentials</span>
            <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/60">Demo Roster</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center justify-between">
              <span><strong>Certified Judge:</strong> judge@drmc.edu</span>
              <button
                type="button"
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passInput) {
                    emailInput.value = 'judge@drmc.edu';
                    passInput.value = 'Judge@123';
                  }
                }}
                className="text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span><strong>Organizer:</strong> organizer@drmc.edu</span>
              <button
                type="button"
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passInput) {
                    emailInput.value = 'organizer@drmc.edu';
                    passInput.value = 'Admin@123';
                  }
                }}
                className="text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span><strong>Student:</strong> student@drmc.edu</span>
              <button
                type="button"
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passInput = document.getElementById('password') as HTMLInputElement;
                  if (emailInput && passInput) {
                    emailInput.value = 'student@drmc.edu';
                    passInput.value = 'Student@123';
                  }
                }}
                className="text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
