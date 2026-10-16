'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { QuickJournalModal } from './QuickJournalModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useAppStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);

  // Authentication Guard: Redirect to /login if trying to access dashboard routes when unauthenticated
  useEffect(() => {
    if (!currentUser && pathname !== '/' && pathname !== '/login') {
      router.push('/login');
    }
  }, [currentUser, pathname, router]);

  // If on login page or guest on landing page ('/'), show public layout without dashboard shell
  if (pathname === '/login' || (!currentUser && pathname === '/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenQuickJournal={() => setIsQuickJournalOpen(true)}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenQuickJournal={() => setIsQuickJournalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenQuickJournal={() => setIsQuickJournalOpen(true)} />

      {/* Quick Journal Fast-Entry Modal (< 1 minute) */}
      <QuickJournalModal
        isOpen={isQuickJournalOpen}
        onClose={() => setIsQuickJournalOpen(false)}
      />
    </div>
  );
}
