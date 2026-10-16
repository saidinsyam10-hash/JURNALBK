'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Plus, 
  BookMarked, 
  Clock 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function MobileNav({ onOpenQuickJournal }: { onOpenQuickJournal: () => void }) {
  const pathname = usePathname();
  const { getOverdueFollowUps, getTodayFollowUps } = useAppStore();
  const totalAlerts = getOverdueFollowUps().length + getTodayFollowUps().length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium transition-colors ${
          pathname === '/'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Beranda</span>
      </Link>

      <Link
        href="/kelompok"
        className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium transition-colors ${
          pathname.startsWith('/kelompok')
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Kelompok</span>
      </Link>

      {/* Center Action Button */}
      <button
        onClick={onOpenQuickJournal}
        className="-top-5 relative flex flex-col items-center group cursor-pointer"
        aria-label="Catat Jurnal Cepat"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 group-active:scale-95 transition-transform border-4 border-slate-50 dark:border-slate-950">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 -mt-1">
          Catat
        </span>
      </button>

      <Link
        href="/jurnal"
        className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium transition-colors ${
          pathname.startsWith('/jurnal')
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <BookMarked className="w-4 h-4" />
        <span>Jurnal</span>
      </Link>

      <Link
        href="/tindak-lanjut"
        className={`relative flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-medium transition-colors ${
          pathname.startsWith('/tindak-lanjut')
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>Pengingat</span>
        {totalAlerts > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        )}
      </Link>
    </div>
  );
}
