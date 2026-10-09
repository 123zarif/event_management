'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SubNavbar } from './SubNavbar';
import { CommandMenu } from './CommandMenu';
import { Footer } from './Footer';

interface AppNavigationProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
  children: React.ReactNode;
}

export function AppNavigation({ currentUser, children }: AppNavigationProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen overflow-hidden flex flex-row w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* 1. Persistent Left Sidebar (Desktop collapsible, Mobile drawer) */}
      <Sidebar
        currentUser={currentUser}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Work Area (Fixed viewport height, pinned header, scrollable main content) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Pinned Header Block: Tier 1 Utility Navbar + Tier 2 Operational Sub-Navbar */}
        <div className="shrink-0 z-30 flex flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
          <Navbar
            currentUser={currentUser}
            onOpenSearch={() => setCommandOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          />
          <SubNavbar currentUser={currentUser} />
        </div>

        {/* Scrollable Main Viewport (The ONLY container that scrolls on the webpage) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {/* Dynamic Page Content Slot - 100% fluid edge-to-edge with balanced padding */}
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          {/* Full-width Footer */}
          <Footer currentUser={currentUser} />
        </div>
      </div>

      {/* ⌘K Global Command Palette */}
      <CommandMenu isOpen={commandOpen} onClose={() => setCommandOpen(false)} currentUser={currentUser} />
    </div>
  );
}
