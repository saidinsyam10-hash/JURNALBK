'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  Layers, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  ArrowRightLeft, 
  History, 
  AlertTriangle, 
  Clock, 
  User, 
  Eye, 
  CheckCircle2, 
  MoveRight,
  BookOpen,
  X
} from 'lucide-react';
import { StudentGroup, Student } from '@/lib/types';
import { STUDENT_GROUPS_CONFIG, ALL_STUDENT_GROUPS, checkStudentNeedsVisit } from '@/lib/grouping-rules';
import { getStatusBadgeConfig, getScoreFace, formatDateShortIndo } from '@/lib/utils';
import { MascotBiko } from '@/components/MascotBiko';

export default function KelompokSiswaPage() {
  const { 
    students, 
    changeStudentGroup, 
    journals, 
    groupHistory, 
    getGroupHistoryByStudentId 
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');

  // Drag state
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);

  // History modal state
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);

  // Available classes
  const allClasses = Array.from(new Set(students.map((s) => s.kelas))).sort();

  // Helper map for student journals
  const studentLatestJournalMap = new Map<string, string>();
  journals.forEach((j) => {
    const existing = studentLatestJournalMap.get(j.student_id);
    if (!existing || new Date(j.tanggal) > new Date(existing)) {
      studentLatestJournalMap.set(j.student_id, j.tanggal);
    }
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      searchQuery.trim() === '' ||
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchKelas = filterKelas === 'Semua' || s.kelas === filterKelas;
    return matchSearch && matchKelas;
  });

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, studentId: string) => {
    setDraggedStudentId(studentId);
    e.dataTransfer.setData('text/plain', studentId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetGroup: StudentGroup) => {
    e.preventDefault();
    const studentId = draggedStudentId || e.dataTransfer.getData('text/plain');
    if (!studentId) return;

    const student = students.find((s) => s.id === studentId);
    if (!student || student.kelompok_terkini === targetGroup) return;

    const reason = prompt(
      `Pindahkan "${student.nama}" dari kelompok "${student.kelompok_terkini}" ke "${targetGroup}"?\n\nMasukkan alasan / catatan evaluasi:`,
      `Evaluasi berkala Guru BK: penyesuaian kondisi ke ${targetGroup}`
    );

    if (reason !== null) {
      changeStudentGroup(studentId, targetGroup, reason, true);
    }
    setDraggedStudentId(null);
  };

  const handleQuickMove = (student: Student, targetGroup: StudentGroup) => {
    const reason = prompt(
      `Pindahkan "${student.nama}" ke kelompok "${targetGroup}"?\n\nMasukkan alasan evaluasi:`,
      `Penyesuaian kelompok oleh Guru BK ke ${targetGroup}`
    );
    if (reason !== null) {
      changeStudentGroup(student.id, targetGroup, reason, true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-xs font-semibold mb-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Manajemen & Papan Dinamis Kelompok Siswa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Pengelompokan Siswa Bimbingan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau sebaran siswa dalam 5 kelompok kondisi, geser kartu (*drag & drop*), dan telusuri riwayat perpindahan kelompok.
          </p>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Papan Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau NIS siswa di semua kelompok..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Rombel:</span>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Semua">Semua Kelas</option>
            {allClasses.map((k) => (
              <option key={k} value={k}>Kelas {k}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. KANBAN BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {ALL_STUDENT_GROUPS.map((groupKey) => {
            const config = STUDENT_GROUPS_CONFIG[groupKey];
            const groupStudents = filteredStudents.filter((s) => s.kelompok_terkini === groupKey);

            return (
              <div
                key={groupKey}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, groupKey)}
                className={`rounded-3xl border ${config.borderColor} ${config.bgLight} ${config.bgDark} p-3.5 flex flex-col min-h-[520px] transition-all shadow-xs`}
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-slate-200/60 dark:border-slate-800/80 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{config.emoji}</span>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                        {config.label}
                      </h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Level {config.level}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs">
                    {groupStudents.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {groupStudents.length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-3 text-center">
                      <span className="text-xl mb-1 opacity-40">{config.emoji}</span>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Tarik (*drag*) kartu siswa ke sini untuk memindahkan kelompok
                      </p>
                    </div>
                  ) : (
                    groupStudents.map((std) => {
                      const lastDate = studentLatestJournalMap.get(std.id);
                      const needsVisit = checkStudentNeedsVisit(std, lastDate);
                      const scoreFace = getScoreFace(std.skor_terkini || 3);

                      return (
                        <div
                          key={std.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, std.id)}
                          className="p-3 bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <Link
                                href={`/siswa/${std.id}`}
                                className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors block leading-snug"
                              >
                                {std.nama}
                              </Link>
                              <div className="text-[10px] text-slate-400">
                                Kelas {std.kelas} • NIS {std.nis}
                              </div>
                            </div>
                            
                            {/* Score Tag */}
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5 shrink-0 ${scoreFace.bg} ${scoreFace.text}`}
                              title={`Skor Kondisi Terkini: ${std.skor_terkini || 3}/5`}
                            >
                              <span>{scoreFace.emoji}</span>
                              <span>{std.skor_terkini || 3}</span>
                            </span>
                          </div>

                          {/* Warning Tag if unrecorded > 14 days */}
                          {needsVisit && (
                            <div className="px-2 py-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-[10px] font-extrabold text-rose-700 dark:text-rose-300 flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>Perlu Dikunjungi / Dicek Ulang!</span>
                            </div>
                          )}

                          {/* Card Footer Actions */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForHistory(std)}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                              title="Lihat Riwayat Perpindahan Kelompok"
                            >
                              <History className="w-3 h-3" />
                              <span>Riwayat</span>
                            </button>

                            {/* Quick Move Dropdown */}
                            <select
                              value={std.kelompok_terkini}
                              onChange={(e) => handleQuickMove(std, e.target.value as StudentGroup)}
                              className="text-[10px] bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-1.5 py-0.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                              title="Pindahkan ke kelompok lain"
                            >
                              <option disabled value={std.kelompok_terkini}>Pindah...</option>
                              {ALL_STUDENT_GROUPS.filter(g => g !== std.kelompok_terkini).map(g => (
                                <option key={g} value={g}>{STUDENT_GROUPS_CONFIG[g].emoji} {g}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Siswa & NIS</th>
                  <th className="py-3 px-4 font-semibold">Kelas</th>
                  <th className="py-3 px-4 font-semibold text-center">Skor Terkini</th>
                  <th className="py-3 px-4 font-semibold">Kelompok Saat Ini</th>
                  <th className="py-3 px-4 font-semibold">Status Observasi</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((std) => {
                  const lastDate = studentLatestJournalMap.get(std.id);
                  const needsVisit = checkStudentNeedsVisit(std, lastDate);
                  const scoreFace = getScoreFace(std.skor_terkini || 3);
                  const groupCfg = getStatusBadgeConfig(std.kelompok_terkini);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                        <Link href={`/siswa/${std.id}`} className="hover:text-indigo-600 transition-colors">
                          {std.nama}
                        </Link>
                        <div className="text-[11px] text-slate-400 font-normal">NIS: {std.nis}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                        Kelas {std.kelas}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${scoreFace.bg} ${scoreFace.text}`}>
                          <span>{scoreFace.emoji}</span>
                          <span>{std.skor_terkini || 3}/5</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${groupCfg.badge}`}>
                          <span>{groupCfg.emoji}</span>
                          <span>{std.kelompok_terkini}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {needsVisit ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1 w-fit animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Perlu Dikunjungi (&gt; 14 Hari)</span>
                          </span>
                        ) : lastDate ? (
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                            Dicatat {formatDateShortIndo(lastDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Belum pernah dicatat</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedStudentForHistory(std)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <History className="w-3 h-3" />
                            <span>Riwayat</span>
                          </button>
                          <select
                            value={std.kelompok_terkini}
                            onChange={(e) => handleQuickMove(std, e.target.value as StudentGroup)}
                            className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2 py-1 font-bold cursor-pointer"
                          >
                            <option disabled value={std.kelompok_terkini}>Ubah Kelompok...</option>
                            {ALL_STUDENT_GROUPS.filter(g => g !== std.kelompok_terkini).map(g => (
                              <option key={g} value={g}>{STUDENT_GROUPS_CONFIG[g].emoji} {g}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL RIWAYAT PERPINDAHAN KELOMPOK */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Riwayat Perpindahan Kelompok
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedStudentForHistory.nama} ({selectedStudentForHistory.kelas})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1 text-xs">
              {getGroupHistoryByStudentId(selectedStudentForHistory.id).length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  Belum ada riwayat perpindahan kelompok untuk siswa ini.
                </div>
              ) : (
                getGroupHistoryByStudentId(selectedStudentForHistory.id).map((gh) => (
                  <div
                    key={gh.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-slate-600 dark:text-slate-300">{gh.dari_kelompok}</span>
                        <MoveRight className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-indigo-600 dark:text-indigo-400">{gh.ke_kelompok}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(gh.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">
                      "{gh.alasan}"
                    </p>

                    <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <span>Metode:</span>
                      <span className="capitalize text-slate-600 dark:text-slate-300 font-bold">{gh.otomatis_atau_manual}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
