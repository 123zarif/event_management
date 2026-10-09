'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Menu, 
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  Award,
  Ticket,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FestSwitcher } from '@/components/FestSwitcher';

interface NavbarProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
  onOpenSearch?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
}

export function Navbar({
  currentUser,
  onOpenSearch,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: NavbarProps) {
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setPersonaDropdownOpen(false);
      }
    }
    if (personaDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [personaDropdownOpen]);

  const handleLogout = async () => {
    setPersonaDropdownOpen(false);
    await logoutAction();
  };

  const currentRole = currentUser?.role;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="flex h-14 w-full items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left Side: Sidebar Toggle, Mobile Brand, and Context Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onOpenMobileSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile Brand Mark Link (Visible on mobile where sidebar is hidden) */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 lg:hidden group py-1"
            title="ClubSphere Home"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-violet-600 dark:text-violet-400 font-bold text-xs tracking-tight shadow-xs group-hover:border-violet-300 dark:group-hover:border-violet-700 transition-colors">
              CS
            </div>
            <span className="font-bold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 hidden min-[390px]:inline">
              ClubSphere
            </span>
          </Link>

          {/* Desktop sidebar toggle button */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Active Context: Festival Context Switcher (Desktop header only; on mobile it resides in the sidebar drawer) */}
          <div className="hidden lg:flex items-center min-w-0">
            <FestSwitcher currentUser={currentUser} />
          </div>
        </div>

        {/* Right Side: Search, Theme Toggle, Persona Switcher & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Command Search Bar Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex h-8 sm:h-auto items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
            title="Search competitions, participants, rules (Cmd+K)"
            aria-label="Quick search"
          >
            <Search className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-950 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-800">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle (Light / Dark mode) */}
          <ThemeToggle />

          {/* Authenticated State */}
          {currentUser ? (
            <div className="relative" ref={personaRef}>
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex h-8 sm:h-auto items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-zinc-800 dark:text-zinc-200 cursor-pointer shrink-0"
                aria-label="Open user profile menu"
                aria-expanded={personaDropdownOpen}
              >
                <div className="h-5 w-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="font-medium hidden md:inline truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hidden sm:inline-block">
                  {currentRole}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-500 shrink-0" />
              </button>

              {/* Mobile backdrop for persona dropdown */}
              {personaDropdownOpen && (
                <div
                  onClick={() => setPersonaDropdownOpen(false)}
                  className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs sm:hidden"
                  aria-hidden="true"
                />
              )}

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-2 border-b border-zinc-200 dark:border-zinc-800 mb-1.5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-mono text-violet-600 dark:text-violet-400">
                      <span>Active Role:</span>
                      <span className="font-semibold uppercase">{currentRole}</span>
                    </div>
                  </div>

                  {/* Role Quick Links */}
                  <div className="space-y-0.5 border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1.5">
                    {currentRole === 'ATTENDEE' && (
                      <Link
                        href="/my-registrations"
                        onClick={() => setPersonaDropdownOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <Ticket className="h-3.5 w-3.5 text-violet-500" />
                        <span>My Registration Passes</span>
                      </Link>
                    )}

                    {currentRole === 'ORGANIZER' && (
                      <Link
                        href="/admin"
                        onClick={() => setPersonaDropdownOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded text-violet-600 dark:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-medium"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Organizer Dashboard</span>
                      </Link>
                    )}

                    {currentRole === 'JUDGE' && (
                      <Link
                        href="/judge"
                        onClick={() => setPersonaDropdownOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded text-violet-600 dark:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-medium"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Judge Evaluation Portal</span>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/login"
                className="flex h-8 items-center justify-center px-2 sm:px-3 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors shrink-0"
                title="Sign In"
              >
                <LogIn className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
              <Link
                href="/register"
                className="flex h-8 items-center justify-center px-2.5 sm:px-3 rounded-md text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs shrink-0"
              >
                <UserPlus className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden min-[420px]:inline">Join DRMC</span>
                <span className="min-[420px]:hidden">Join</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
