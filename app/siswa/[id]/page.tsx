'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  MapPin, 
  AlertCircle, 
  BookMarked, 
  Plus, 
  TrendingUp, 
  Minus, 
  TrendingDown, 
  Lock, 
  Paperclip, 
  Trash2, 
  Edit3, 
  FileText, 
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  History,
  Bot,
  MessageCircle
} from 'lucide-react';
import { 
  formatDateIndo, 
  formatDateShortIndo, 
  getStatusBadgeConfig, 
  getActivityBadgeClass, 
  getAspectBadgeClass, 
  getFollowUpStatusConfig,
  getScoreFace
} from '@/lib/utils';
import { StudentTrendChart } from '@/components/charts/StudentTrendChart';
import { QuickJournalModal } from '@/components/QuickJournalModal';
import { StudentFormModal } from '@/components/StudentFormModal';
import { AISuggestionModal } from '@/components/AISuggestionModal';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import { STUDENT_GROUPS_CONFIG } from '@/lib/grouping-rules';
import { AspectType, ActivityType, StudentGroup } from '@/lib/types';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { 
    getStudentById, 
    getJournalsByStudentId, 
    deleteJournal, 
    updateJournal,
    getGroupHistoryByStudentId,
    aiSuggestions
  } = useAppStore();

  const student = getStudentById(studentId);
  const studentJournals = getJournalsByStudentId(studentId);
  const groupHistories = getGroupHistoryByStudentId(studentId);
  const studentAISuggestions = aiSuggestions.filter((a) => a.student_id === studentId);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'timeline' | 'history' | 'ai'>('timeline');

  // Filters for timeline
  const [filterAspect, setFilterAspect] = useState<AspectType | 'Semua'>('Semua');
  const [filterActivity, setFilterActivity] = useState<ActivityType | 'Semua'>('Semua');

  // Modals
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isAISuggestionOpen, setIsAISuggestionOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedJournalForWA, setSelectedJournalForWA] = useState<typeof studentJournals[0] | undefined>(undefined);

  if (!student) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Siswa Tidak Ditemukan
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Data siswa dengan ID tersebut mungkin telah dihapus atau dipindahkan.
        </p>
        <Link
          href="/siswa"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
        >
          Kembali ke Daftar Siswa
        </Link>
      </div>
    );
  }

  const currentGroup = student.kelompok_terkini || (student.status_terkini as StudentGroup) || 'Stabil';
  const statusCfg = getStatusBadgeConfig(currentGroup);
  const groupDetail = STUDENT_GROUPS_CONFIG[currentGroup] || STUDENT_GROUPS_CONFIG['Stabil'];

  // Filter journals for timeline
  const filteredJournals = studentJournals.filter((j) => {
    const matchAspect = filterAspect === 'Semua' || j.aspek.includes(filterAspect);
    const matchActivity = filterActivity === 'Semua' || j.jenis_kegiatan === filterActivity;
    return matchAspect && matchActivity;
  });

  const handleDeleteJournal = (journalId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan jurnal ini?')) {
      deleteJournal(journalId);
    }
  };

  const handleToggleFollowUpDone = (journal: typeof studentJournals[0]) => {
    const nextStatus = journal.status_tindak_lanjut === 'Selesai' ? 'Menunggu' : 'Selesai';
    updateJournal(journal.id, {
      status_tindak_lanjut: nextStatus,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Back Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/siswa"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Siswa</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedJournalForWA(studentJournals[0] || undefined);
              setIsWhatsAppModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Kirim Laporan Perkembangan ke WhatsApp Orang Tua"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>📱 Lapor ke WA Ortu</span>
          </button>

          <button
            onClick={() => setIsAISuggestionOpen(true)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>✨ Minta Saran AI</span>
          </button>

          <button
            onClick={() => setIsEditStudentOpen(true)}
            className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Ubah Profil</span>
          </button>

          <button
            onClick={() => setIsQuickJournalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Jurnal</span>
          </button>
        </div>
      </div>

      {/* 1. Student Identity Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              {student.nama.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {student.nama}
                </h1>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md font-bold text-slate-700 dark:text-slate-300">
                  Kelas {student.kelas}
                </span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-600 dark:text-slate-300">
                  {student.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <div>NIS: <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{student.nis}</span> {student.nisn && `(NISN: ${student.nisn})`}</div>
                {student.tanggal_lahir && (
                  <div>Tanggal Lahir: <span className="font-medium text-slate-700 dark:text-slate-200">{formatDateIndo(student.tanggal_lahir)}</span></div>
                )}
                <div>Wali: <span className="font-medium text-slate-700 dark:text-slate-200">{student.nama_ortu || 'Orang Tua'}</span></div>
                <div className="flex items-center gap-1.5">
                  <span>Kontak Ortu:</span>
                  <a
                    href={`https://wa.me/${student.kontak_ortu.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{student.kontak_ortu}</span>
                  </a>
                </div>
              </div>

              {student.alamat && (
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{student.alamat}</span>
                </div>
              )}
            </div>
          </div>

          {/* Big Status Badge (5 Groups) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 min-w-48 text-center">
            <span className="text-[11px] font-semibold text-slate-400 mb-1">
              Kelompok Kondisi Terkini:
            </span>
            <span
              className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full border shadow-xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
            >
              {statusCfg.emoji} {statusCfg.label}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-tight">
              {groupDetail.description}
            </p>
          </div>

        </div>

        {/* Catatan Khusus Banner */}
        {student.catatan_khusus && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs">
            <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-900 dark:text-indigo-300">Catatan Khusus BK: </span>
              <span className="text-slate-700 dark:text-slate-300">{student.catatan_khusus}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Visualisasi Tren Perkembangan Siswa (Recharts Line Chart 1-5 Score) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                Grafik Tren Skor Kondisi Siswa (1 - 5)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Skor kondisi: 😭 (1) Sangat Mengkhawatirkan s/d 🌟 (5) Sangat Baik & Berprestasi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <span>🌟 (5)</span> Berkembang
            </span>
            <span className="inline-flex items-center gap-1 text-sky-600 font-semibold">
              <span>🙂 (4)</span> Stabil
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
              <span>😐 (3)</span> Cukup
            </span>
            <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
              <span>😭 (1-2)</span> Kritis
            </span>
          </div>
        </div>

        <StudentTrendChart journals={studentJournals} />
      </div>

      {/* 3. Navigation Tabs: Timeline / Riwayat Kelompok / Riwayat AI */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'timeline'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BookMarked className="w-4 h-4" />
            <span>Timeline Observasi ({filteredJournals.length})</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4" />
            <span>Riwayat Kelompok ({groupHistories.length})</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-purple-600" />
            <span>Riwayat Saran AI ({studentAISuggestions.length})</span>
          </div>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                Timeline Riwayat Perkembangan
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Urutan kronologis dari observasi terbaru ke observasi terdahulu
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Aspek */}
              <select
                value={filterAspect}
                onChange={(e) => setFilterAspect(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Semua">Semua Aspek</option>
                {(['Akademik', 'Sosial', 'Emosional', 'Perilaku', 'Karier', 'Kehadiran'] as AspectType[]).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              {/* Filter Jenis Kegiatan */}
              <select
                value={filterActivity}
                onChange={(e) => setFilterActivity(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Semua">Semua Kegiatan</option>
                {(['Konseling Individu', 'Konseling Kelompok', 'Observasi Kelas', 'Kunjungan Rumah', 'Panggilan Orang Tua', 'Lainnya'] as ActivityType[]).map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline Content */}
          {filteredJournals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada catatan jurnal pada filter yang dipilih.
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {filteredJournals.map((journal) => {
                const journalGroup = journal.kelompok || journal.kategori;
                const journalStatusCfg = getStatusBadgeConfig(journalGroup);
                const followUpCfg = getFollowUpStatusConfig(journal.status_tindak_lanjut, journal.tanggal_tindak_lanjut);
                const scoreFace = getScoreFace(journal.skor_kondisi || 3);

                return (
                  <div key={journal.id} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${journalStatusCfg.dot}`}
                    />

                    {/* Card Container */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-3">
                      
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{formatDateIndo(journal.tanggal)}</span>
                          </span>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getActivityBadgeClass(
                              journal.jenis_kegiatan
                            )}`}
                          >
                            {journal.jenis_kegiatan}
                          </span>

                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                            <span>{scoreFace.emoji}</span>
                            <span>Skor {journal.skor_kondisi || 3}/5</span>
                          </span>

                          {journal.is_rahasia && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>Rahasia</span>
                            </span>
                          )}

                          {journal.saran_ai_terpakai && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-300">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>Saran AI Terpakai</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Tren */}
                          <span className="text-[10px] font-medium bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            {journal.tren === 'Meningkat' && <TrendingUp className="w-3 h-3 text-teal-600" />}
                            {journal.tren === 'Stabil' && <Minus className="w-3 h-3 text-sky-600" />}
                            {journal.tren === 'Menurun' && <TrendingDown className="w-3 h-3 text-rose-600" />}
                            <span>Tren: {journal.tren}</span>
                          </span>

                          {/* Status */}
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${journalStatusCfg.bg} ${journalStatusCfg.text} ${journalStatusCfg.border}`}
                          >
                            {journalStatusCfg.emoji} {journalStatusCfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Aspek Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {journal.aspek.map((asp) => (
                          <span
                            key={asp}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getAspectBadgeClass(asp)}`}
                          >
                            {asp}
                          </span>
                        ))}
                      </div>

                      {/* Uraian Kondisi */}
                      <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {journal.uraian}
                      </div>

                      {/* Tindak Lanjut Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                        {journal.tindak_lanjut ? (
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => handleToggleFollowUpDone(journal)}
                              className={`p-1 rounded-md transition-colors ${
                                journal.status_tindak_lanjut === 'Selesai'
                                  ? 'text-emerald-600 hover:text-emerald-700'
                                  : 'text-slate-400 hover:text-indigo-600'
                              }`}
                              title="Tandai Selesai"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Tindak Lanjut: </span>
                              <span className="text-slate-600 dark:text-slate-400">{journal.tindak_lanjut}</span>
                              {journal.tanggal_tindak_lanjut && (
                                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${followUpCfg.badgeClass}`}>
                                  Target: {formatDateShortIndo(journal.tanggal_tindak_lanjut)} ({followUpCfg.label})
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400">Tidak ada tindak lanjut khusus</div>
                        )}

                        {/* Right Action Icons */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                          <span>Konselor: {journal.guru_nama || 'Guru BK'}</span>
                          <button
                            onClick={() => {
                              setSelectedJournalForWA(journal);
                              setIsWhatsAppModalOpen(true);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/80 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                            title="Kirim Catatan Ini ke WhatsApp Orang Tua"
                          >
                            <MessageCircle className="w-3 h-3 fill-current" />
                            <span>Kirim ke WA Ortu</span>
                          </button>
                          <button
                            onClick={() => handleDeleteJournal(journal.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                            title="Hapus Jurnal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lampiran */}
                      {journal.lampiran && journal.lampiran.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {journal.lampiran.map((att) => (
                            <div
                              key={att.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 shadow-xs"
                            >
                              <Paperclip className="w-3 h-3 text-indigo-600" />
                              <span>{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 5. Tab: Riwayat Perpindahan Kelompok (Kanban & Otomatis) */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Riwayat Perpindahan Kelompok Siswa
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Setiap perubahan status kelompok tercatat lengkap dengan waktu dan alasan pergeseran.
            </p>
          </div>

          {groupHistories.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada riwayat perpindahan kelompok untuk siswa ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {groupHistories.map((h) => {
                const fromCfg = getStatusBadgeConfig(h.dari_kelompok);
                const toCfg = getStatusBadgeConfig(h.ke_kelompok);

                return (
                  <div key={h.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">
                          {formatDateIndo(h.created_at)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          h.otomatis_atau_manual === 'otomatis'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {h.otomatis_atau_manual === 'otomatis' ? '⚡ Otomatis Sistem' : '👤 Manual Guru BK'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {h.alasan}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fromCfg.bg} ${fromCfg.text} ${fromCfg.border}`}>
                        {fromCfg.emoji} {fromCfg.label}
                      </span>
                      <span className="text-xs text-slate-400">&rarr;</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${toCfg.bg} ${toCfg.text} ${toCfg.border}`}>
                        {toCfg.emoji} {toCfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Tab: Riwayat Saran AI */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                Riwayat Rekomendasi AI Si Biko
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rekomendasi tindak lanjut AI yang pernah dihasilkan dan diterapkan untuk siswa ini.
              </p>
            </div>
            <button
              onClick={() => setIsAISuggestionOpen(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Minta Saran Baru</span>
            </button>
          </div>

          {studentAISuggestions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada riwayat saran AI yang tersimpan. Klik "✨ Minta Saran AI" untuk memulai konsultasi pedagogis bersama Si Biko.
            </div>
          ) : (
            <div className="space-y-4">
              {studentAISuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 font-medium">
                      {formatDateIndo(sug.created_at)}
                    </span>
                    {sug.dipakai && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        ✓ Dipakai Sebagai Tindak Lanjut
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {sug.ringkasan_kondisi || sug.ringkasan}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Journal Modal with this student pre-selected */}
      <QuickJournalModal
        isOpen={isQuickJournalOpen}
        onClose={() => setIsQuickJournalOpen(false)}
        preselectedStudentId={student.id}
      />

      {/* Edit Student Modal */}
      <StudentFormModal
        isOpen={isEditStudentOpen}
        onClose={() => setIsEditStudentOpen(false)}
        initialData={student}
      />

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={isAISuggestionOpen}
        onClose={() => setIsAISuggestionOpen(false)}
        student={student}
      />

      {/* WhatsApp Share Modal */}
      {isWhatsAppModalOpen && (
        <WhatsAppShareModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          student={student}
          journal={selectedJournalForWA}
        />
      )}

    </div>
  );
}
