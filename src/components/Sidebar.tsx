'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Calendar,
  Layers,
  HelpCircle,
  ShieldCheck,
  Ticket,
  Users,
  QrCode,
  Shield,
  Award,
  History,
  LifeBuoy,
  X,
  Database,
  Plus,
  Tag,
  LogIn
} from 'lucide-react';

interface SidebarProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ currentUser, collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const currentRole = currentUser?.role;

  // Build role-tailored navigation groups (Strict feature invisibility)
  const navGroups: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string;
    }>;
  }> = [];

  // 1. Common Platform Group (Available to all)
  navGroups.push({
    title: 'Platform',
    items: [
      { label: 'Overview', href: '/', icon: Trophy },
      { label: 'Fests Directory', href: '/fests', icon: Calendar },
      { label: 'Competitions', href: '/events', icon: Trophy },
      { label: 'Live Standings', href: '/leaderboards', icon: Layers },
    ],
  });

  // 2. Contestant Space (STRICTLY for ATTENDEE only)
  if (currentRole === 'ATTENDEE') {
    navGroups.push({
      title: 'Contestant Space',
      items: [
        { label: 'My Registrations', href: '/my-registrations', icon: Ticket },
        { label: 'Help Desk (Tickets)', href: '/support', icon: HelpCircle },
        { label: 'Verify Certificate', href: '/verify-certificate', icon: ShieldCheck },
      ],
    });
  } else if (!currentRole) {
    // Guest: only verify certificate
    navGroups.push({
      title: 'Credentials',
      items: [
        { label: 'Verify Certificate', href: '/verify-certificate', icon: ShieldCheck },
      ],
    });
  }

  // 3. Judge Portal (STRICTLY for JUDGE only)
  if (currentRole === 'JUDGE') {
    navGroups.push({
      title: 'Judge Portal',
      items: [
        { label: 'Judge Scoring Suite', href: '/judge', icon: Award, badge: 'Scoring' },
        { label: 'Verify Certificate', href: '/verify-certificate', icon: ShieldCheck },
      ],
    });
  }

  // 4. Operations & Staff (STRICTLY for ORGANIZER and ADMIN only)
  if (currentRole === 'ORGANIZER' || currentRole === 'ADMIN') {
    navGroups.push({
      title: 'Operations & Staff',
      items: [
        { label: 'Admin Command', href: '/admin', icon: Shield, badge: 'Staff' },
        { label: 'New Festival / Event', href: '/admin/fests/new', icon: Calendar, badge: 'New' },
        { label: 'New Competition', href: '/admin/events/new', icon: Plus, badge: 'New' },
        { label: 'Event Categories', href: '/admin/categories', icon: Tag },
        { label: 'Attendee Registry', href: '/admin/participants', icon: Users },
        { label: 'QR Gate Scanner', href: '/admin/scanner', icon: QrCode, badge: 'Live' },
        { label: 'Support Queue', href: '/admin/support', icon: LifeBuoy },
        { label: 'Security Audit Log', href: '/admin/audit-logs', icon: History },
        { label: 'Verify Certificate', href: '/verify-certificate', icon: ShieldCheck },
      ],
    });
  }

  // Find single most-specific matching link across all navigation groups
  const allHrefs = navGroups.flatMap((g) => g.items.map((i) => i.href));
  const matchingHrefs = allHrefs.filter((href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  const activeHref = matchingHrefs.length > 0
    ? matchingHrefs.reduce((longest, current) =>
        current.length > longest.length ? current : longest
      )
    : null;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-200 ease-in-out lg:static lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full'
        } ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-violet-600 dark:text-violet-400 font-bold text-sm tracking-tight shadow-xs">
              CS
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  ClubSphere
                </span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-tight truncate">
                  DRMC IT Club 2026
                </span>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Fest Status Pill */}
        {!collapsed && (
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center justify-between p-2 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-[11px]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  9th Tech Carnival
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 shrink-0">Live</span>
            </div>
          </div>
        )}

        {/* Navigation Groups (Filtered strictly by role) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === activeHref;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200/60 dark:border-violet-900/40 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300/50 dark:border-zinc-700/50">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & System Status */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {!collapsed ? (
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Station Mode</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/50 font-semibold">
                  {currentRole || 'GUEST'}
                </span>
              </div>
              {currentUser ? (
                <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                  <span className="font-medium text-zinc-900 dark:text-zinc-200 block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono truncate block">{currentUser.email}</span>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={onCloseMobile}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-md bg-violet-600 text-white text-[11px] font-medium hover:bg-violet-700 transition-colors"
                >
                  <LogIn className="h-3 w-3" />
                  <span>Sign In</span>
                </Link>
              )}
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono pt-1 border-t border-zinc-200 dark:border-zinc-800/60">
                <Database className="h-3 w-3 text-emerald-500" />
                <span>Postgres &amp; Redis Online</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500" title="System Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
