'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Calendar,
  Layers,
  HelpCircle,
  Ticket,
  QrCode,
  Shield,
  Award,
  ShieldCheck
} from 'lucide-react';

interface SubNavbarProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function SubNavbar({ currentUser }: SubNavbarProps) {
  const pathname = usePathname();
  const currentRole = currentUser?.role;

  // Build role-tailored horizontal tabs (Strict feature invisibility)
  const tabs: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: string;
    badge?: string;
    highlight?: boolean;
  }> = [];

  // 1. Core tabs
  tabs.push({ label: 'Overview', href: '/', icon: Trophy });
  tabs.push({ label: 'Competitions', href: '/events', icon: Trophy, count: '6' });

  // 2. Fests (for guests, attendees, organizers)
  if (currentRole !== 'JUDGE') {
    tabs.push({ label: 'Fests', href: '/fests', icon: Calendar });
  }

  // 3. Standings (always useful for all)
  tabs.push({ label: 'Live Standings', href: '/leaderboards', icon: Layers, highlight: true });

  // 4. Role-specific items
  if (currentRole === 'ATTENDEE') {
    tabs.push({ label: 'My Passes', href: '/my-registrations', icon: Ticket });
    tabs.push({ label: 'Help Desk', href: '/support', icon: HelpCircle });
  } else if (currentRole === 'JUDGE') {
    tabs.push({ label: 'Judge Suite', href: '/judge', icon: Award, badge: 'Scoring' });
  } else if (currentRole === 'ORGANIZER' || currentRole === 'ADMIN') {
    tabs.push({ label: 'Organizer Ops', href: '/admin', icon: Shield, badge: 'Staff' });
    tabs.push({ label: 'QR Check-in', href: '/admin/scanner', icon: QrCode, badge: 'Live' });
    tabs.push({ label: 'Judge Suite', href: '/judge', icon: Award });
    tabs.push({ label: 'Help Desk Queue', href: '/admin/support', icon: HelpCircle });
    tabs.push({ label: 'My Passes', href: '/my-registrations', icon: Ticket });
  }

  // 5. Verifier (available to all)
  tabs.push({ label: 'Verify Cert', href: '/verify-certificate', icon: ShieldCheck });

  return (
    <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xs px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none transition-colors">
      <nav className="flex items-center gap-1 sm:gap-2 h-10 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all relative whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-violet-600 dark:text-violet-400 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>

              {tab.highlight && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}

              {tab.badge && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {tab.badge}
                </span>
              )}

              {tab.count && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300">
                  {tab.count}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 inset-x-2 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
