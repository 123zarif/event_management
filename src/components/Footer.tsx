import React from 'react';
import Link from 'next/link';

interface FooterProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Footer({ currentUser }: FooterProps = {}) {
  const isAttendee = currentUser?.role === 'ATTENDEE';
  const isJudge = currentUser?.role === 'JUDGE';
  const isOrganizer = currentUser?.role === 'ORGANIZER' || currentUser?.role === 'ADMIN';

  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 text-xs text-zinc-600 dark:text-zinc-400 no-print transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">ClubSphere</span>
              <span className="text-zinc-400 dark:text-zinc-600">/</span>
              <span className="text-zinc-600 dark:text-zinc-400">DRMC IT Club</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] max-w-md">
              Smart Club Operations & Competition Management Platform. Built for the 9th DRMC International Tech Carnival 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
            <Link href="/fests" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              Fests Directory
            </Link>
            <Link href="/events" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              Competitions
            </Link>
            <Link href="/support" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              Help Desk
            </Link>
            <Link href="/verify-certificate" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
              Verify Certificate
            </Link>
            {currentUser ? (
              <>
                {isAttendee && (
                  <Link href="/my-registrations" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors font-medium">
                    My Passes
                  </Link>
                )}
                {isJudge && (
                  <Link href="/judge" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors font-medium">
                    Judge Workstation
                  </Link>
                )}
                {isOrganizer && (
                  <Link href="/admin" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                    Organizer Portal
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors font-medium">
                  Sign In
                </Link>
                <Link href="/admin" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                  Organizer Portal
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-500">
          <p>© 2026 Dhaka Residential Model College IT Club. Released under the MIT License.</p>
          <p className="font-mono text-[10px]">Theme: Smart Club Operations · Dual Light/Dark Mode</p>
        </div>
      </div>
    </footer>
  );
}
