'use client';

import React, { useState } from 'react';
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
import { switchPersonaAction, logoutAction } from '@/actions/auth';
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

  const handlePersonaSwitch = async (email: string) => {
    setPersonaDropdownOpen(false);
    await switchPersonaAction(email);
  };

  const handleLogout = async () => {
    setPersonaDropdownOpen(false);
    await logoutAction();
  };

  const currentRole = currentUser?.role;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Sidebar Toggle & Context Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Active Context: Festival Context Switcher */}
          <div className="flex items-center gap-2">
            <FestSwitcher currentUser={currentUser} />
          </div>
        </div>

        {/* Right Side: Search, Theme Toggle, Persona Switcher & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Command Search Bar Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Search competitions, participants, rules (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-950 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-800">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle (Light / Dark mode) */}
          <ThemeToggle />

          {/* Authenticated State */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <div className="h-5 w-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="font-medium hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {currentRole}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
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

                  {/* Instant Persona Switcher */}
                  <div className="py-1">
                    <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                      Fast Persona Switcher
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handlePersonaSwitch('organizer@drmc.edu')}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                          currentRole === 'ORGANIZER'
                            ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <span>Club Organizer</span>
                        <span className="text-[10px] text-zinc-400 font-mono">organizer@drmc.edu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePersonaSwitch('judge@drmc.edu')}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                          currentRole === 'JUDGE'
                            ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <span>Contest Judge</span>
                        <span className="text-[10px] text-zinc-400 font-mono">judge@drmc.edu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePersonaSwitch('student@drmc.edu')}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                          currentRole === 'ATTENDEE'
                            ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <span>Student Attendee</span>
                        <span className="text-[10px] text-zinc-400 font-mono">student@drmc.edu</span>
                      </button>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Join DRMC</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
