'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Calendar, Trophy, ShieldCheck, Ticket, Users, HelpCircle, ArrowRight } from 'lucide-react';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered from parent or global handler
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { title: 'AI Web Development Contest', category: 'Competitions', href: '/events/ai-web-development-contest', icon: Trophy },
    { title: 'National Collegiate Programming Contest', category: 'Competitions', href: '/events/national-programming-contest', icon: Trophy },
    { title: 'Autonomous Robotics Challenge', category: 'Competitions', href: '/events/autonomous-robotics-challenge', icon: Trophy },
    { title: 'Valorant Champions Invitational', category: 'Competitions', href: '/events/valorant-champions-cup', icon: Trophy },
    { title: '9th DRMC International Tech Carnival 2026', category: 'Fests', href: '/fests/tech-carnival-2026', icon: Calendar },
    { title: 'Winter Tech Fest 2026', category: 'Fests', href: '/fests/winter-tech-fest-2026', icon: Calendar },
    { title: 'Freshers Tech Fest 2027', category: 'Fests', href: '/fests/freshers-tech-fest-2027', icon: Calendar },
    { title: 'Live Standings & Leaderboard', category: 'Leaderboards', href: '/leaderboards', icon: Trophy },
    { title: 'My Registrations & Tickets', category: 'Attendee Portal', href: '/my-registrations', icon: Ticket },
    { title: 'Contestant Help Desk', category: 'Support', href: '/support', icon: HelpCircle },
    { title: 'Verify Digital Certificate', category: 'Verification', href: '/verify-certificate', icon: ShieldCheck },
    { title: 'Organizer Admin Dashboard', category: 'Management', href: '/admin', icon: Users },
    { title: 'Webcam QR Check-in Scanner', category: 'Management', href: '/admin/scanner', icon: ShieldCheck },
    { title: 'Judge Evaluation Scoring Portal', category: 'Judging', href: '/judge', icon: Trophy },
  ];

  const filtered = query.trim() === ''
    ? items
    : items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-2xl transition-colors">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/80">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search competitions, fests, or operations..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto py-2 divide-y divide-zinc-100 dark:divide-zinc-900">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-zinc-500">No results found for &ldquo;{query}&rdquo;</p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
                    <div>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-violet-600 dark:group-hover:text-violet-300">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
                </button>
              );
            })
          )}
        </div>

        <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-800/80 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
          <span>Navigation Shortcut</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
