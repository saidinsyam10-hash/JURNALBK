'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  BookMarked, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  Printer, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  FileSpreadsheet,
  Layers,
  ChevronRight,
  TrendingUp,
  Minus,
  TrendingDown,
  Paperclip,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { 
  formatDateIndo, 
  formatDateShortIndo, 
  getStatusBadgeConfig, 
  getActivityBadgeClass, 
  getAspectBadgeClass, 
  getFollowUpStatusConfig,
  getTrendBadgeConfig,
  getScoreFace
} from '@/lib/utils';
import { JournalEntry, StudentGroup, ActivityType, AspectType } from '@/lib/types';
import { STUDENT_GROUPS_CONFIG, ALL_STUDENT_GROUPS } from '@/lib/grouping-rules';
import { QuickJournalModal } from '@/components/QuickJournalModal';
import { ExportReportModal } from '@/components/ExportReportModal';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import * as XLSX from 'xlsx';

export default function JurnalHarianPage() {
  const { journals, students, deleteJournal, updateJournal, currentUser } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState<StudentGroup | 'Semua'>('Semua');
  const [filterAspek, setFilterAspek] = useState<AspectType | 'Semua'>('Semua');
  const [filterKegiatan, setFilterKegiatan] = useState<ActivityType | 'Semua'>('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedStudentForWA, setSelectedStudentForWA] = useState<typeof students[0] | null>(null);
  const [selectedJournalForWA, setSelectedJournalForWA] = useState<JournalEntry | undefined>(undefined);

  // Available unique classes from students
  const allClasses = Array.from(new Set(students.map((s) => s.kelas))).sort();

  // Helper map student ID to student details
  const studentMap = new Map(students.map((s) => [s.id, s]));

  // Filtering
  const filteredJournals = journals.filter((j) => {
    const student = studentMap.get(j.student_id);
    const studentName = student?.nama || '';
    const studentNis = student?.nis || '';
    const studentKelas = student?.kelas || '';

    // Search query
    const matchSearch =
      searchQuery.trim() === '' ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentNis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.uraian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.tindak_lanjut.toLowerCase().includes(searchQuery.toLowerCase());

    // Class filter
    const matchKelas = filterKelas === 'Semua' || studentKelas === filterKelas;

    // Group / Kategori filter
    const jGroup = j.kelompok || j.kategori;
    const matchKategori = filterKategori === 'Semua' || jGroup === filterKategori;

    // Aspek filter
    const matchAspek = filterAspek === 'Semua' || j.aspek.includes(filterAspek);

    // Kegiatan filter
    const matchKegiatan = filterKegiatan === 'Semua' || j.jenis_kegiatan === filterKegiatan;

    // Date range filter
    let matchDate = true;
    if (startDate && j.tanggal < startDate) matchDate = false;
    if (endDate && j.tanggal > endDate) matchDate = false;

    return matchSearch && matchKelas && matchKategori && matchAspek && matchKegiatan && matchDate;
  });

  // Sort descending by date
  const sortedJournals = [...filteredJournals].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  const handleEdit = (journal: JournalEntry) => {
    setEditingJournal(journal);
    setIsQuickJournalOpen(true);
  };

  const handleDelete = (journal: JournalEntry) => {
    const student = studentMap.get(journal.student_id);
    if (confirm(`Apakah Anda yakin ingin menghapus catatan jurnal siswa "${student?.nama || 'Siswa'}" tanggal ${formatDateShortIndo(journal.tanggal)}?`)) {
      deleteJournal(journal.id);
    }
  };

  const handleToggleFollowUp = (journal: JournalEntry) => {
    const nextStatus = journal.status_tindak_lanjut === 'Selesai' ? 'Menunggu' : 'Selesai';
    updateJournal(journal.id, { status_tindak_lanjut: nextStatus });
  };

  const handleExportExcel = () => {
    const exportRows = sortedJournals.map((j, idx) => {
      const student = studentMap.get(j.student_id);
      return {
        No: idx + 1,
        Tanggal: j.tanggal,
        NIS: student?.nis || '-',
        'Nama Siswa': student?.nama || '-',
        Kelas: student?.kelas || '-',
        'Jenis Kegiatan': j.jenis_kegiatan,
        'Aspek Dipantau': j.aspek.join(', '),
        'Skor Kondisi': j.skor_kondisi || 3,
        'Uraian Kondisi': j.uraian,
        'Tren Perkembangan': j.tren,
        'Kelompok Kondisi': j.kelompok || j.kategori,
        'Rencana Tindak Lanjut': j.tindak_lanjut,
        'Target Tindak Lanjut': j.tanggal_tindak_lanjut || '-',
        'Status Tindak Lanjut': j.status_tindak_lanjut,
        'Saran AI Dipakai': j.saran_ai_terpakai ? 'Ya' : 'Tidak',
        'Sifat Catatan': j.is_rahasia ? 'Rahasia' : 'Biasa',
        'Guru Konselor': j.guru_nama || currentUser?.nama || 'Guru BK',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jurnal_Harian_BK');
    XLSX.writeFile(workbook, `Jurnal_Harian_Guru_BK_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold mb-1.5">
            <BookMarked className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Pencatatan Cepat & Terintegrasi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Jurnal Harian Guru BK
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola seluruh rekaman sesi konseling, observasi kelas, dan catatan tindak lanjut berpendampingan AI Si Biko.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingJournal(null);
              setIsQuickJournalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Jurnal Baru</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            title="Ekspor data terfilter ke Microsoft Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Observasi</span>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {journals.length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Rekaman tersimpan</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Didukung Saran AI</span>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>{journals.filter(j => j.saran_ai_terpakai).length}</span>
          </div>
          <span className="text-[11px] text-purple-500 font-medium">Tindak lanjut teroptimasi</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tindak Lanjut Menunggu</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {journals.filter(j => j.status_tindak_lanjut === 'Menunggu').length}
          </div>
          <span className="text-[11px] text-amber-500 font-medium">Belum ditandai selesai</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Catatan Rahasia</span>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
            <Lock className="w-5 h-5 text-amber-500" />
            <span>{journals.filter(j => j.is_rahasia).length}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Akses khusus konselor</span>
        </div>
      </div>

      {/* 3. Filter and Search Toolset */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
        
        {/* Top search & basic class filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama siswa, NIS, atau kata kunci uraian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Kelas</option>
              {allClasses.map((k) => (
                <option key={k} value={k}>Kelas {k}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua 5 Kelompok</option>
              {ALL_STUDENT_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {STUDENT_GROUPS_CONFIG[g].emoji} {g}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={filterAspek}
              onChange={(e) => setFilterAspek(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Aspek</option>
              <option value="Akademik">Akademik</option>
              <option value="Sosial">Sosial</option>
              <option value="Emosional">Emosional</option>
              <option value="Perilaku">Perilaku</option>
              <option value="Karier">Karier</option>
              <option value="Kehadiran">Kehadiran</option>
            </select>
          </div>
        </div>

        {/* Date range & activity filter */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Rentang:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Kegiatan:</span>
            <select
              value={filterKegiatan}
              onChange={(e) => setFilterKegiatan(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="Semua">Semua Kegiatan</option>
              <option value="Konseling Individu">Konseling Individu</option>
              <option value="Konseling Kelompok">Konseling Kelompok</option>
              <option value="Observasi Kelas">Observasi Kelas</option>
              <option value="Kunjungan Rumah">Kunjungan Rumah</option>
              <option value="Panggilan Orang Tua">Panggilan Orang Tua</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Journal List Items */}
      {sortedJournals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <BookMarked className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Tidak Ada Catatan Jurnal Ditemukan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Tidak ada rekaman konseling yang sesuai dengan parameter filter atau pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterKelas('Semua');
              setFilterKategori('Semua');
              setFilterAspek('Semua');
              setFilterKegiatan('Semua');
              setStartDate('');
              setEndDate('');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Menampilkan <strong>{sortedJournals.length}</strong> catatan jurnal</span>
            <span>Diurutkan berdasarkan tanggal terbaru</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {sortedJournals.map((journal) => {
              const student = studentMap.get(journal.student_id);
              const journalGroup = journal.kelompok || journal.kategori;
              const statusCfg = getStatusBadgeConfig(journalGroup);
              const trendCfg = getTrendBadgeConfig(journal.tren);
              const followUpCfg = getFollowUpStatusConfig(journal.status_tindak_lanjut);
              const scoreFace = getScoreFace(journal.skor_kondisi || 3);

              return (
                <div
                  key={journal.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md ${
                    journal.is_rahasia
                      ? 'border-amber-300/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-500/[0.02] to-transparent'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    {/* Left: Student Identity & Tags */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{formatDateIndo(journal.tanggal)}</span>
                        </span>

                        <span className="text-slate-300 dark:text-slate-600">•</span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getActivityBadgeClass(journal.jenis_kegiatan)}`}>
                          {journal.jenis_kegiatan}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          <span>{scoreFace.emoji}</span>
                          <span>Skor {journal.skor_kondisi || 3}/5</span>
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${statusCfg.badge}`}>
                          <span>{statusCfg.emoji}</span>
                          <span>{statusCfg.label}</span>
                        </span>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${trendCfg.badge}`}>
                          <span>Tren: {journal.tren}</span>
                        </span>

                        {journal.saran_ai_terpakai && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold border border-purple-300">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Saran AI</span>
                          </span>
                        )}

                        {journal.is_rahasia && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>Rahasia</span>
                          </span>
                        )}
                      </div>

                      {/* Student info headline */}
                      <div className="flex items-baseline gap-2">
                        <Link
                          href={`/siswa/${journal.student_id}`}
                          className="text-base font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                        >
                          <span>{student?.nama || 'Siswa Tidak Diketahui'}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Kelas {student?.kelas || '-'}
                          </span>
                        </Link>
                        <span className="text-xs text-slate-400">NIS: {student?.nis || '-'}</span>
                      </div>

                      {/* Aspek Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-slate-400 font-medium">Aspek:</span>
                        {journal.aspek.map((asp) => (
                          <span
                            key={asp}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getAspectBadgeClass(asp)}`}
                          >
                            {asp}
                          </span>
                        ))}
                      </div>

                      {/* Uraian Body */}
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        {journal.uraian}
                      </p>

                      {/* Tindak Lanjut Cardlet */}
                      {journal.tindak_lanjut && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs">
                          <div>
                            <span className="font-bold text-indigo-900 dark:text-indigo-300">Rencana Tindak Lanjut: </span>
                            <span className="text-slate-700 dark:text-slate-300">{journal.tindak_lanjut}</span>
                          </div>
                          {journal.tanggal_tindak_lanjut && (
                            <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Target: {formatDateShortIndo(journal.tanggal_tindak_lanjut)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Attachments & Counselor info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center gap-2">
                          <span>Konselor: <strong className="text-slate-600 dark:text-slate-300">{journal.guru_nama || 'Guru BK'}</strong></span>
                          {journal.lampiran && journal.lampiran.length > 0 && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Paperclip className="w-3 h-3" />
                              <span>{journal.lampiran.length} Lampiran</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Follow-up Check & Action Buttons */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      
                      {/* Follow-up Status Toggle */}
                      {journal.tindak_lanjut && (
                        <button
                          onClick={() => handleToggleFollowUp(journal)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            journal.status_tindak_lanjut === 'Selesai'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}
                          title="Klik untuk mengubah status tindak lanjut"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{journal.status_tindak_lanjut}</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (student) {
                              setSelectedStudentForWA(student);
                              setSelectedJournalForWA(journal);
                              setIsWhatsAppModalOpen(true);
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Kirim Laporan Perkembangan ke WhatsApp Orang Tua"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
                          <span className="hidden sm:inline">WA Ortu</span>
                        </button>

                        <button
                          onClick={() => handleEdit(journal)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Catatan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(journal)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Journal Modal */}
      <QuickJournalModal
        isOpen={isQuickJournalOpen}
        onClose={() => {
          setIsQuickJournalOpen(false);
          setEditingJournal(null);
        }}
        initialData={editingJournal || undefined}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredJournals={sortedJournals}
      />

      {/* WhatsApp Share Modal */}
      {isWhatsAppModalOpen && selectedStudentForWA && (
        <WhatsAppShareModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            setSelectedStudentForWA(null);
            setSelectedJournalForWA(undefined);
          }}
          student={selectedStudentForWA}
          journal={selectedJournalForWA}
        />
      )}

    </div>
  );
}
