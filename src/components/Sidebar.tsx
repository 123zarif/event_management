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
  Tag
} from 'lucide-react';
import { switchPersonaAction } from '@/actions/auth';

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

  const handlePersonaSwitch = async (email: string) => {
    await switchPersonaAction(email);
  };

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

  // 2. Contestant Space (Visible to Attendee, Organizer, or authenticated user)
  if (currentRole === 'ATTENDEE' || currentRole === 'ORGANIZER' || currentRole === 'ADMIN') {
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

  // 3. Judge Portal (Only for JUDGE, ORGANIZER, or ADMIN)
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
        { label: 'New Competition', href: '/admin/events/new', icon: Plus, badge: 'New' },
        { label: 'Event Categories', href: '/admin/categories', icon: Tag },
        { label: 'Attendee Registry', href: '/admin/participants', icon: Users },
        { label: 'QR Gate Scanner', href: '/admin/scanner', icon: QrCode, badge: 'Live' },
        { label: 'Support Queue', href: '/admin/support', icon: LifeBuoy },
        { label: 'Security Audit Log', href: '/admin/audit-logs', icon: History },
        { label: 'Audit Judge Scores', href: '/judge', icon: Award, badge: 'Audit' },
      ],
    });
  }

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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-200 ease-in-out lg:static lg:translate-x-0 ${
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
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

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

        {/* Footer info & Persona Quick Switching */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {!collapsed ? (
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Persona Role</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900/50">
                  {currentRole || 'GUEST'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => handlePersonaSwitch('student@drmc.edu')}
                  title="Switch to Student Attendee"
                  className={`px-1.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                    currentRole === 'ATTENDEE'
                      ? 'bg-violet-600 text-white border-violet-600 font-semibold'
                      : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handlePersonaSwitch('organizer@drmc.edu')}
                  title="Switch to Club Organizer"
                  className={`px-1.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                    currentRole === 'ORGANIZER'
                      ? 'bg-violet-600 text-white border-violet-600 font-semibold'
                      : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handlePersonaSwitch('judge@drmc.edu')}
                  title="Switch to Contest Judge"
                  className={`px-1.5 py-1 text-[10px] font-mono rounded border transition-colors ${
                    currentRole === 'JUDGE'
                      ? 'bg-violet-600 text-white border-violet-600 font-semibold'
                      : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Judge
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono pt-1 border-t border-zinc-200 dark:border-zinc-800/60">
                <Database className="h-3 w-3 text-emerald-500" />
                <span>Postgres & Redis Online</span>
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
