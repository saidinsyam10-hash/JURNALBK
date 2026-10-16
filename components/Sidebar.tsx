'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookMarked, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Settings,
  X,
  Layers,
  Plus,
  GraduationCap
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenQuickJournal?: () => void;
}

export function Sidebar({ isOpenMobile, onCloseMobile, onOpenQuickJournal }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, getOverdueFollowUps, getTodayFollowUps } = useAppStore();

  const totalFollowUpAlerts = getOverdueFollowUps().length + getTodayFollowUps().length;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Kelompok Siswa',
      href: '/kelompok',
      icon: Layers,
      active: pathname.startsWith('/kelompok'),
    },
    {
      label: 'Data Siswa',
      href: '/siswa',
      icon: Users,
      active: pathname.startsWith('/siswa'),
    },
    {
      label: 'Jurnal Harian',
      href: '/jurnal',
      icon: BookMarked,
      active: pathname.startsWith('/jurnal'),
    },
    {
      label: 'Tindak Lanjut',
      href: '/tindak-lanjut',
      icon: Clock,
      active: pathname.startsWith('/tindak-lanjut'),
      badge: totalFollowUpAlerts > 0 ? totalFollowUpAlerts : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      label: 'Laporan & Rekap',
      href: '/laporan',
      icon: FileText,
      active: pathname.startsWith('/laporan'),
    },
    {
      label: 'Audit & Keamanan',
      href: '/audit-log',
      icon: ShieldCheck,
      active: pathname.startsWith('/audit-log'),
    },
    {
      label: 'Pengaturan',
      href: '/pengaturan',
      icon: Settings,
      active: pathname.startsWith('/pengaturan'),
    },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      <div>
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
              BK
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              BK Harian
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Button */}
        {onOpenQuickJournal && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenQuickJournal();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/25 hover:shadow-lg transition-all mb-5 group cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span>+ Catat Jurnal Cepat</span>
          </button>
        )}

        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group ${
                  item.active
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs border border-indigo-100 dark:border-indigo-900/60'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      item.active
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Info / Kelas Bimbingan */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span>Kelas Bimbingan</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {currentUser?.kelas_bimbingan && currentUser.kelas_bimbingan.length > 0 ? (
              currentUser.kelas_bimbingan.map((k) => (
                <span
                  key={k}
                  className="text-[10px] bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-medium"
                >
                  {k}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-400">Semua Kelas</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-[calc(100vh-4rem)] sticky top-16 shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
