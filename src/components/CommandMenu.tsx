'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Calendar, Trophy, ShieldCheck, Ticket, Users, HelpCircle, ArrowRight, Tag, Award } from 'lucide-react';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    role: string;
  } | null;
}

export function CommandMenu({ isOpen, onClose, currentUser }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentRole = currentUser?.role;

  // Base command items
  const allItems = [
    { title: 'AI Web Development Contest', category: 'Competitions', href: '/events/ai-web-development-contest', icon: Trophy },
    { title: 'National Collegiate Programming Contest', category: 'Competitions', href: '/events/national-programming-contest', icon: Trophy },
    { title: 'Autonomous Robotics Challenge', category: 'Competitions', href: '/events/autonomous-robotics-challenge', icon: Trophy },
    { title: 'Valorant Champions Invitational', category: 'Competitions', href: '/events/valorant-champions-cup', icon: Trophy },
    { title: '9th DRMC International Tech Carnival 2026', category: 'Fests', href: '/fests/tech-carnival-2026', icon: Calendar },
    { title: 'Winter Tech Fest 2026', category: 'Fests', href: '/fests/winter-tech-fest-2026', icon: Calendar },
    { title: 'Freshers Tech Fest 2027', category: 'Fests', href: '/fests/freshers-tech-fest-2027', icon: Calendar },
    { title: 'Live Standings & Leaderboard', category: 'Leaderboards', href: '/leaderboards', icon: Trophy },
    { title: 'My Registrations & Tickets', category: 'Attendee Portal', href: '/my-registrations', icon: Ticket, roles: ['ATTENDEE', 'ORGANIZER', 'ADMIN'] },
    { title: 'Contestant Help Desk', category: 'Support', href: '/support', icon: HelpCircle, roles: ['ATTENDEE', 'ORGANIZER', 'ADMIN'] },
    { title: 'Verify Digital Certificate', category: 'Verification', href: '/verify-certificate', icon: ShieldCheck },
    { title: 'Organizer Admin Dashboard', category: 'Management', href: '/admin', icon: Users, roles: ['ORGANIZER', 'ADMIN'] },
    { title: 'Create New Competition Track', category: 'Management', href: '/admin/events/new', icon: Trophy, roles: ['ORGANIZER', 'ADMIN'] },
    { title: 'Manage Event Categories', category: 'Management', href: '/admin/categories', icon: Tag, roles: ['ORGANIZER', 'ADMIN'] },
    { title: 'Judge Rosters & Track Assignments', category: 'Management', href: '/admin/competitions/ai-web-development-contest/judges', icon: Award, roles: ['ORGANIZER', 'ADMIN'] },
    { title: 'Webcam QR Check-in Scanner', category: 'Management', href: '/admin/scanner', icon: ShieldCheck, roles: ['ORGANIZER', 'ADMIN'] },
    { title: 'Judge Evaluation Scoring Portal', category: 'Judging', href: '/judge', icon: Trophy, roles: ['JUDGE'] },
  ];

  // Filter items by role (strict RBAC invisibility)
  const allowedItems = allItems.filter((item) => {
    if (!item.roles) return true;
    if (!currentRole) return false;
    return item.roles.includes(currentRole);
  });

  const filtered = query.trim() === ''
    ? allowedItems
    : allowedItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, competition name, fest, or section..."
            className="w-full py-3.5 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-900/50">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-xs text-zinc-500">
              No matching destinations or commands found.
            </p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-900/70 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
          <span>Search DRMC operations</span>
          <div className="flex gap-2">
            <span>[Esc] to close</span>
            <span>[↵] to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
