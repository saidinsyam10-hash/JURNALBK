'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  Users, 
  BookMarked, 
  AlertTriangle, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Lock, 
  ShieldAlert, 
  Sparkles,
  Layers,
  FileSpreadsheet,
  Check,
  Compass,
  Hourglass,
  Smile,
  Star,
  MessageCircle
} from 'lucide-react';
import { 
  formatDateIndo, 
  formatDateShortIndo, 
  getStatusBadgeConfig, 
  getActivityBadgeClass, 
  getAspectBadgeClass,
  getGreetingByHour,
  getScoreFace
} from '@/lib/utils';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { AspectsBarChart, MonthlyTrendChart } from '@/components/charts/DashboardCharts';
import { QuickJournalModal } from '@/components/QuickJournalModal';
import { AISuggestionModal } from '@/components/AISuggestionModal';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import { LandingPage } from '@/components/LandingPage';
import { MascotBiko } from '@/components/MascotBiko';
import { STUDENT_GROUPS_CONFIG, ALL_STUDENT_GROUPS, checkStudentNeedsVisit } from '@/lib/grouping-rules';
import { Student, JournalEntry } from '@/lib/types';

export default function HomePage() {
  const { 
    currentUser, 
    students, 
    journals, 
    getGroupCounts,
    getOverdueFollowUps, 
    getTodayFollowUps, 
    getStudentsUnrecorded14Days 
  } = useAppStore();

  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);
  const [selectedStudentForJournal, setSelectedStudentForJournal] = useState<string | undefined>(undefined);
  const [aiModalStudent, setAiModalStudent] = useState<Student | null>(null);
  const [waModalStudent, setWaModalStudent] = useState<Student | null>(null);
  const [waModalJournal, setWaModalJournal] = useState<JournalEntry | undefined>(undefined);

  // If user is not logged in, render the public Landing Page
  if (!currentUser) {
    return <LandingPage />;
  }

  const groupCounts = getGroupCounts();
  const overdueFollowUps = getOverdueFollowUps();
  const todayFollowUps = getTodayFollowUps();
  const unrecordedStudents = getStudentsUnrecorded14Days();

  // Today's journal entries
  const todayDateOnly = new Date().toISOString().split('T')[0];
  const todayJournals = journals.filter((j) => j.tanggal === todayDateOnly);

  // Urgent students: Status 'Perlu Intervensi Segera', 'Perlu Bimbingan', overdue/today follow-up, or >14d unrecorded
  const attentionStudentIds = new Set<string>();
  
  students
    .filter((s) => s.kelompok_terkini === 'Perlu Intervensi Segera' || s.kelompok_terkini === 'Perlu Bimbingan' || s.kelompok_terkini === 'Belum Ada Kemajuan')
    .forEach((s) => attentionStudentIds.add(s.id));
  
  overdueFollowUps.forEach((j) => attentionStudentIds.add(j.student_id));
  todayFollowUps.forEach((j) => attentionStudentIds.add(j.student_id));
  
  // Also check students unrecorded >14 days that need visit
  students.forEach((s) => {
    const studentJournals = journals.filter((j) => j.student_id === s.id);
    const latestDate = studentJournals.length > 0
      ? studentJournals.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0].tanggal
      : undefined;
    if (checkStudentNeedsVisit(s, latestDate)) {
      attentionStudentIds.add(s.id);
    }
  });

  const attentionStudents = students.filter((s) => attentionStudentIds.has(s.id));

  // Recent journals (5 most recent)
  const recentJournals = [...journals]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 6);

  const openJournalFor = (studentId: string) => {
    setSelectedStudentForJournal(studentId);
    setIsQuickJournalOpen(true);
  };

  const todayStr = formatDateIndo(new Date().toISOString().split('T')[0]);
  const greetingText = getGreetingByHour(currentUser.nama);

  return (
    <div className="space-y-7">
      
      {/* 1. Header Greeting & Mascot Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/15">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="shrink-0 drop-shadow-lg">
              <MascotBiko size={105} expression="welcoming" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-indigo-100 text-xs font-semibold mb-2">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{todayStr}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                {greetingText}
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                "Setiap Siswa Punya Cerita. Catat, Pahami, Dampingi." Si Biko siap membantu bimbingan dan analisis tindak lanjut hari ini.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setSelectedStudentForJournal(undefined);
                setIsQuickJournalOpen(true);
              }}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-indigo-950 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/20 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-950 text-amber-400 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>+ Catat Jurnal Baru</span>
            </button>
            <Link
              href="/kelompok"
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-2xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <Layers className="w-4 h-4 text-indigo-200" />
              <span>Papan Kelompok</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top 5-Group & Operational Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Distribusi 5 Kelompok Siswa
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              (Berdasarkan riwayat skor & tren BK)
            </span>
          </div>
          <Link
            href="/kelompok"
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Buka Papan Kanban</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_STUDENT_GROUPS.map((groupKey) => {
            const cfg = STUDENT_GROUPS_CONFIG[groupKey];
            const count = groupCounts[groupKey] || 0;
            const percent = students.length > 0 ? Math.round((count / students.length) * 100) : 0;

            return (
              <Link
                key={groupKey}
                href={`/kelompok?group=${encodeURIComponent(groupKey)}`}
                className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cfg.bgLight} ${cfg.bgDark} ${cfg.borderColor} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl leading-none">{cfg.emoji}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {percent}%
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                    {count}
                  </div>
                  <div className={`text-xs font-bold ${cfg.textColor} mt-0.5 line-clamp-1`}>
                    {cfg.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Operational Sub-Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookMarked className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                  {todayJournals.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Catatan Hari Ini</div>
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md font-semibold">
              Aktif
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                  {overdueFollowUps.length + todayFollowUps.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Tindak Lanjut Jatuh Tempo</div>
              </div>
            </div>
            <Link
              href="/tindak-lanjut"
              className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Lihat &rarr;
            </Link>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                  {unrecordedStudents.length}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Belum Dicatat &gt;14 Hari</div>
              </div>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md font-semibold">
              Perlu Dicek
            </span>
          </div>
        </div>
      </div>

      {/* 3. Section "Perlu Perhatian Hari Ini" */}
      {attentionStudents.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200/80 dark:border-rose-900/50 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center animate-pulse">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    Perlu Perhatian Hari Ini
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    {attentionStudents.length} Siswa
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Siswa berisiko (Intervensi/Bimbingan), tindak lanjut jatuh tempo, atau belum diobservasi &gt; 14 hari.
                </p>
              </div>
            </div>
            <Link
              href="/tindak-lanjut"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 self-start sm:self-center"
            >
              <span>Semua Jadwal Tindak Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
            {attentionStudents.slice(0, 4).map((student) => {
              const statusCfg = getStatusBadgeConfig(student.kelompok_terkini || student.status_terkini);
              const studentJournals = journals.filter((j) => j.student_id === student.id);
              const latestJournal = studentJournals.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];
              const scoreFace = latestJournal ? getScoreFace(latestJournal.skor_kondisi || 3) : null;
              const needsVisit = checkStudentNeedsVisit(student, latestJournal?.tanggal);

              return (
                <div
                  key={student.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/siswa/${student.id}`}
                          className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          {student.nama}
                        </Link>
                        <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {student.kelas}
                        </span>
                        {needsVisit && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300">
                            Perlu Dikunjungi
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        NIS: {student.nis} • Ortu: {student.kontak_ortu}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} shrink-0`}
                    >
                      {statusCfg.emoji} {statusCfg.label}
                    </span>
                  </div>

                  {/* Catatan Terakhir / Masalah */}
                  {latestJournal ? (
                    <div className="text-xs bg-white dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {latestJournal.jenis_kegiatan} • {formatDateShortIndo(latestJournal.tanggal)}
                        </span>
                        {scoreFace && (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>{scoreFace.emoji}</span>
                            <span>Skor {latestJournal.skor_kondisi}/5</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {latestJournal.uraian}
                      </p>
                      {latestJournal.tindak_lanjut && (
                        <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
                          <span>📌 Rencana:</span>
                          <span className="line-clamp-1">{latestJournal.tindak_lanjut}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      Belum ada catatan observasi untuk siswa ini.
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => {
                        setWaModalStudent(student);
                        setWaModalJournal(latestJournal);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                      title="Kirim Laporan Perkembangan ke WhatsApp Orang Tua"
                    >
                      <MessageCircle className="w-3 h-3 fill-current" />
                      <span>Lapor WA Ortu</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setAiModalStudent(student)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Minta Saran AI Tindak Lanjut"
                      >
                        <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span>Saran AI</span>
                      </button>
                      <button
                        onClick={() => openJournalFor(student.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        + Catat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Three Visual Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 5 Kelompok Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  Distribusi 5 Kelompok Siswa
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pemetaan otomatis berdasarkan tren skor BK
                </p>
              </div>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                {students.length} Siswa
              </span>
            </div>

            <CategoryDonutChart counts={groupCounts} totalStudents={students.length} />
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Standar Klasifikasi BK Harian</span>
            <Link href="/kelompok" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Kelola Papan &rarr;
            </Link>
          </div>
        </div>

        {/* Right: Aspek BK & Tren Bulanan (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top of Right: Bar Chart Catatan per Aspek */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  Distribusi Catatan per Aspek
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Akademik, Sosial, Emosional, Perilaku, Karier, dan Kehadiran
                </p>
              </div>
              <span className="text-xs bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-full">
                6 Bidang Layanan
              </span>
            </div>

            <AspectsBarChart journals={journals} />
          </div>

          {/* Bottom of Right: Line Chart Tren Bulanan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  Tren Bulanan: Rata-Rata Skor & Volume
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Garis ungu: rata-rata skor kondisi (1-5) • Garis hijau putus-putus: volume sesi
                </p>
              </div>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                Semester 1
              </span>
            </div>

            <MonthlyTrendChart journals={journals} />
          </div>

        </div>

      </div>

      {/* 5. Catatan Jurnal Terbaru Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Catatan Jurnal Observasi Terbaru
            </h2>
          </div>
          <Link
            href="/jurnal"
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Lihat Semua Jurnal ({journals.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {recentJournals.map((journal) => {
            const student = students.find((s) => s.id === journal.student_id);
            const statusCfg = getStatusBadgeConfig(journal.kelompok || journal.kategori);
            const scoreFace = getScoreFace(journal.skor_kondisi || 3);

            return (
              <div key={journal.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 font-medium">
                      {formatDateShortIndo(journal.tanggal)}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getActivityBadgeClass(
                        journal.jenis_kegiatan
                      )}`}
                    >
                      {journal.jenis_kegiatan}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      <span>{scoreFace.emoji}</span>
                      <span>Skor {journal.skor_kondisi || 3}/5</span>
                    </span>
                    {journal.is_rahasia && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5" /> Rahasia
                      </span>
                    )}
                    {journal.saran_ai_terpakai && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-2.5 h-2.5 text-purple-600" /> Saran AI
                      </span>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/siswa/${student?.id}`}
                      className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 transition-colors"
                    >
                      {student?.nama || 'Siswa'} ({student?.kelas})
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                      {journal.uraian}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {journal.aspek.map((asp) => (
                      <span
                        key={asp}
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getAspectBadgeClass(asp)}`}
                      >
                        {asp}
                      </span>
                    ))}
                    {journal.tindak_lanjut && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        • Tindak lanjut: {journal.tindak_lanjut}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                  >
                    {statusCfg.emoji} {statusCfg.label}
                  </span>
                  <div className="text-[11px] text-slate-400">
                    Oleh: {journal.guru_nama || 'Guru BK'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Journal Modal */}
      <QuickJournalModal
        isOpen={isQuickJournalOpen}
        onClose={() => setIsQuickJournalOpen(false)}
        preselectedStudentId={selectedStudentForJournal}
      />

      {/* AI Suggestion Modal */}
      {aiModalStudent && (
        <AISuggestionModal
          isOpen={!!aiModalStudent}
          onClose={() => setAiModalStudent(null)}
          student={aiModalStudent}
        />
      )}

      {/* WhatsApp Share Modal */}
      {waModalStudent && (
        <WhatsAppShareModal
          isOpen={!!waModalStudent}
          onClose={() => {
            setWaModalStudent(null);
            setWaModalJournal(undefined);
          }}
          student={waModalStudent}
          journal={waModalJournal}
        />
      )}

    </div>
  );
}
