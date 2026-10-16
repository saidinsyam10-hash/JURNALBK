'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  UserCheck, 
  Plus, 
  ArrowRight, 
  Filter, 
  RotateCcw,
  Check,
  Edit2,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { 
  formatDateIndo, 
  formatDateShortIndo, 
  getStatusBadgeConfig, 
  getDaysDiffFromToday 
} from '@/lib/utils';
import { JournalEntry, Student } from '@/lib/types';
import { QuickJournalModal } from '@/components/QuickJournalModal';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';

export default function TindakLanjutPage() {
  const { journals, students, updateJournal } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming' | 'completed'>('overdue');
  const [filterKelas, setFilterKelas] = useState('Semua');

  // Quick journal modal state
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);
  const [targetStudentForJournal, setTargetStudentForJournal] = useState<string | undefined>(undefined);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedStudentForWA, setSelectedStudentForWA] = useState<Student | null>(null);
  const [selectedJournalForWA, setSelectedJournalForWA] = useState<JournalEntry | undefined>(undefined);

  // Available classes
  const allClasses = Array.from(new Set(students.map((s) => s.kelas))).sort();

  // Helper map
  const studentMap = new Map(students.map((s) => [s.id, s]));

  // Categorize follow-ups
  const journalsWithFollowUp = journals.filter((j) => !!j.tanggal_tindak_lanjut);

  const overdueList: { journal: JournalEntry; student?: Student; daysDiff: number }[] = [];
  const todayList: { journal: JournalEntry; student?: Student; daysDiff: number }[] = [];
  const upcomingList: { journal: JournalEntry; student?: Student; daysDiff: number }[] = [];
  const completedList: { journal: JournalEntry; student?: Student; daysDiff: number }[] = [];

  journalsWithFollowUp.forEach((j) => {
    const student = studentMap.get(j.student_id);
    const daysDiff = getDaysDiffFromToday(j.tanggal_tindak_lanjut!);

    if (j.status_tindak_lanjut === 'Selesai') {
      completedList.push({ journal: j, student, daysDiff });
    } else {
      if (daysDiff < 0) {
        overdueList.push({ journal: j, student, daysDiff: Math.abs(daysDiff) });
      } else if (daysDiff === 0) {
        todayList.push({ journal: j, student, daysDiff: 0 });
      } else {
        upcomingList.push({ journal: j, student, daysDiff });
      }
    }
  });

  // Sort lists
  overdueList.sort((a, b) => b.daysDiff - a.daysDiff); // furthest overdue first
  todayList.sort((a, b) => new Date(b.journal.tanggal).getTime() - new Date(a.journal.tanggal).getTime());
  upcomingList.sort((a, b) => a.daysDiff - b.daysDiff); // nearest upcoming first
  completedList.sort((a, b) => new Date(b.journal.updated_at).getTime() - new Date(a.journal.updated_at).getTime());

  // Filter current active list by selected class
  const filterListByClass = (list: typeof overdueList) => {
    if (filterKelas === 'Semua') return list;
    return list.filter((item) => item.student?.kelas === filterKelas);
  };

  const currentFilteredList = 
    activeTab === 'overdue' ? filterListByClass(overdueList) :
    activeTab === 'today' ? filterListByClass(todayList) :
    activeTab === 'upcoming' ? filterListByClass(upcomingList) :
    filterListByClass(completedList);

  const handleToggleDone = (journal: JournalEntry) => {
    const newStatus = journal.status_tindak_lanjut === 'Selesai' ? 'Menunggu' : 'Selesai';
    updateJournal(journal.id, { status_tindak_lanjut: newStatus });
  };

  const handleReschedule = (journal: JournalEntry) => {
    const defaultNext = new Date();
    defaultNext.setDate(defaultNext.getDate() + 3);
    const newDateStr = prompt(
      'Masukkan tanggal baru tindak lanjut (Format YYYY-MM-DD):',
      defaultNext.toISOString().split('T')[0]
    );
    if (newDateStr && /^\d{4}-\d{2}-\d{2}$/.test(newDateStr)) {
      updateJournal(journal.id, {
        tanggal_tindak_lanjut: newDateStr,
        status_tindak_lanjut: 'Menunggu',
      });
    }
  };

  const handleOpenNewSession = (studentId: string) => {
    setTargetStudentForJournal(studentId);
    setIsQuickJournalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-semibold mb-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Pengingat & Agenda Bimbingan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Tindak Lanjut & Jadwal Konseling
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau dan kelola jadwal tindak lanjut siswa agar tidak ada kasus bimbingan yang terlewatkan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="Semua">Semua Kelas</option>
            {allClasses.map((k) => (
              <option key={k} value={k}>Kelas {k}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Status Summary Cards / Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Overdue */}
        <button
          onClick={() => setActiveTab('overdue')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'overdue'
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-md ring-2 ring-rose-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Jatuh Tempo (Terlambat)</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
              {overdueList.length}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {overdueList.length} Siswa
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Perlu tindakan segera</p>
        </button>

        {/* Due Today */}
        <button
          onClick={() => setActiveTab('today')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'today'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-md ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Jatuh Tempo Hari Ini</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              {todayList.length}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {todayList.length} Siswa
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Jadwal hari ini</p>
        </button>

        {/* Upcoming */}
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'upcoming'
              ? 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800 shadow-md ring-2 ring-teal-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Mendatang (Terjadwal)</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
              {upcomingList.length}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 mt-2">
            {upcomingList.length} Siswa
          </div>
          <p className="text-[11px] text-teal-600/80 dark:text-teal-400/80 mt-1">Dalam waktu dekat</p>
        </button>

        {/* Completed */}
        <button
          onClick={() => setActiveTab('completed')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'completed'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Selesai Ditindaklanjuti</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              {completedList.length}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {completedList.length} Siswa
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Kasus terselesaikan</p>
        </button>
      </div>

      {/* 3. Items List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {activeTab === 'overdue' && 'Daftar Tindak Lanjut Terlambat / Jatuh Tempo'}
              {activeTab === 'today' && 'Daftar Tindak Lanjut Jatuh Tempo Hari Ini'}
              {activeTab === 'upcoming' && 'Daftar Tindak Lanjut Terjadwal Mendatang'}
              {activeTab === 'completed' && 'Riwayat Tindak Lanjut Selesai'}
            </h2>
            <p className="text-xs text-slate-400">
              Menampilkan {currentFilteredList.length} data {filterKelas !== 'Semua' ? `untuk Kelas ${filterKelas}` : 'seluruh kelas'}
            </p>
          </div>
        </div>

        {currentFilteredList.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Tidak Ada Agenda pada Kategori Ini
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'overdue' && 'Bagus sekali! Semua tindak lanjut telah diselesaikan tepat waktu.'}
              {activeTab === 'today' && 'Tidak ada agenda tindak lanjut yang dijadwalkan untuk hari ini.'}
              {activeTab === 'upcoming' && 'Belum ada agenda tindak lanjut masa depan yang dijadwalkan.'}
              {activeTab === 'completed' && 'Belum ada catatan tindak lanjut yang ditandai selesai.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {currentFilteredList.map(({ journal, student, daysDiff }) => {
              const currentGroup = journal.kelompok || journal.kategori;
              const statusCfg = getStatusBadgeConfig(currentGroup);

              return (
                <div
                  key={journal.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    activeTab === 'overdue'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/10'
                      : activeTab === 'today'
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/10'
                      : activeTab === 'upcoming'
                      ? 'border-teal-200 dark:border-teal-900/60 bg-teal-50/20 dark:bg-teal-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Due Badge */}
                        {activeTab === 'overdue' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-600 text-white flex items-center gap-1 shadow-xs animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Terlambat {daysDiff} Hari</span>
                          </span>
                        )}

                        {activeTab === 'today' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                            <Clock className="w-3 h-3" />
                            <span>Jatuh Tempo Hari Ini</span>
                          </span>
                        )}

                        {activeTab === 'upcoming' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-teal-600" />
                            <span>{daysDiff} Hari Lagi ({formatDateShortIndo(journal.tanggal_tindak_lanjut!)})</span>
                          </span>
                        )}

                        {activeTab === 'completed' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Telah Diselesaikan</span>
                          </span>
                        )}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.badge}`}>
                          {statusCfg.emoji} {statusCfg.label}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          Catatan Konseling: {formatDateShortIndo(journal.tanggal)}
                        </span>
                      </div>

                      {/* Student Name */}
                      <div className="flex items-baseline gap-2">
                        <Link
                          href={`/siswa/${journal.student_id}`}
                          className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-teal-600 transition-colors"
                        >
                          {student?.nama || 'Siswa'}
                        </Link>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Kelas {student?.kelas}
                        </span>
                        <span className="text-xs text-slate-400">NIS: {student?.nis}</span>
                      </div>

                      {/* Action Plan Description */}
                      <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs">
                        <div className="font-bold text-teal-800 dark:text-teal-300 mb-0.5">
                          Rencana / Instruksi Tindak Lanjut:
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">
                          {journal.tindak_lanjut || 'Pemantauan perkembangan berkala'}
                        </p>
                      </div>

                      {/* Parent Contact Info */}
                      {student?.kontak_ortu && (
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-teal-600" />
                            <span>Kontak Ortu: {student.kontak_ortu} ({student.nama_ortu || 'Wali Siswa'})</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col items-stretch justify-end gap-2 shrink-0 pt-3 lg:pt-0 lg:pl-4 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800">
                      
                      {/* Mark Done / Reopen Toggle */}
                      <button
                        onClick={() => handleToggleDone(journal)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          journal.status_tindak_lanjut === 'Selesai'
                            ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{journal.status_tindak_lanjut === 'Selesai' ? 'Buka Kembali' : 'Tandai Selesai'}</span>
                      </button>

                      {/* Reschedule Date */}
                      <button
                        onClick={() => handleReschedule(journal)}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ubah Jadwal</span>
                      </button>

                      {/* WhatsApp to Parent */}
                      {student && (
                        <button
                          onClick={() => {
                            setSelectedStudentForWA(student);
                            setSelectedJournalForWA(journal);
                            setIsWhatsAppModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Kirim Catatan & Rencana Tindak Lanjut ke WhatsApp Orang Tua"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
                          <span>Kirim ke WA Ortu</span>
                        </button>
                      )}

                      {/* Record Next Counseling Session */}
                      <button
                        onClick={() => handleOpenNewSession(journal.student_id)}
                        className="px-3.5 py-1.5 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Catat Evaluasi Baru</span>
                      </button>

                      {/* Link to Student detail */}
                      <Link
                        href={`/siswa/${journal.student_id}`}
                        className="px-3.5 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs text-center font-medium transition-colors"
                      >
                        Lihat Riwayat Lengkap →
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Quick Journal Modal */}
      <QuickJournalModal
        isOpen={isQuickJournalOpen}
        onClose={() => {
          setIsQuickJournalOpen(false);
          setTargetStudentForJournal(undefined);
        }}
        preselectedStudentId={targetStudentForJournal}
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
