'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  Bell, 
  Moon, 
  Sun, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle,
  Menu,
  BookOpen,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { formatDateShortIndo } from '@/lib/utils';

export function Navbar({ onOpenMobileMenu, onOpenQuickJournal }: { onOpenMobileMenu?: () => void; onOpenQuickJournal?: () => void }) {
  const { currentUser, logout, isDarkMode, toggleDarkMode, getOverdueFollowUps, getTodayFollowUps } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const overdue = getOverdueFollowUps();
  const todayFollowUps = getTodayFollowUps();
  const totalAlerts = overdue.length + todayFollowUps.length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-tight flex items-center gap-1.5">
                <span>BK Harian</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                  AI Ready
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-none font-medium">
                MAN 1 Majene • Bimbingan Konseling
              </div>
            </div>
          </Link>
        </div>

        {/* Center/Quick Action (Desktop) */}
        {onOpenQuickJournal && (
          <div className="hidden lg:flex items-center">
            <button
              onClick={onOpenQuickJournal}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Catat Jurnal Cepat (&lt; 1 Menit)</span>
            </button>
          </div>
        )}

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Pengingat Tindak Lanjut"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-3 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Pengingat Tindak Lanjut</span>
                  </div>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                    {totalAlerts} Jatuh Tempo
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 my-1">
                  {totalAlerts === 0 ? (
                    <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                      🎉 Tidak ada tindak lanjut yang tertunda hari ini. Semua terkelola dengan baik!
                    </div>
                  ) : (
                    <>
                      {overdue.map((item) => (
                        <Link
                          key={item.id}
                          href="/tindak-lanjut"
                          onClick={() => setShowNotifications(false)}
                          className="block py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-slate-800 dark:text-slate-200 text-xs group-hover:text-teal-600">
                              {item.jenis_kegiatan}
                            </span>
                            <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold px-1.5 py-0.5 rounded">
                              Terlambat
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {item.tindak_lanjut}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Target: {formatDateShortIndo(item.tanggal_tindak_lanjut)}</span>
                          </div>
                        </Link>
                      ))}

                      {todayFollowUps.map((item) => (
                        <Link
                          key={item.id}
                          href="/tindak-lanjut"
                          onClick={() => setShowNotifications(false)}
                          className="block py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-slate-800 dark:text-slate-200 text-xs group-hover:text-teal-600">
                              {item.jenis_kegiatan}
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded">
                              Hari Ini
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {item.tindak_lanjut}
                          </p>
                        </Link>
                      ))}
                    </>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    href="/tindak-lanjut"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <span>Lihat Semua Jadwal Tindak Lanjut</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.nama}
                  </div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium capitalize">
                    {currentUser.role === 'admin' ? 'Administrator' : 'Guru BK'}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-xs shadow-inner overflow-hidden border border-teal-500">
                  {currentUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentUser.avatar} alt={currentUser.nama} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.nama.substring(0, 2).toUpperCase()
                  )}
                </div>
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 text-xs animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.nama}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                    {currentUser.nip && (
                      <p className="text-slate-400 text-[10px] mt-0.5">NIP: {currentUser.nip}</p>
                    )}
                  </div>

                  <Link
                    href="/pengaturan"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <UserIcon className="w-4 h-4 text-teal-600" />
                    <span>Profil & Pengaturan</span>
                  </Link>

                  <Link
                    href="/audit-log"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Log Keamanan & Akses</span>
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Masuk
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
