'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  Users, 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Filter, 
  Phone, 
  BookMarked, 
  Edit3, 
  Trash2, 
  LayoutGrid, 
  Table as TableIcon, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Layers,
  MessageCircle
} from 'lucide-react';
import { getStatusBadgeConfig, formatDateShortIndo } from '@/lib/utils';
import { Student, StudentGroup } from '@/lib/types';
import { STUDENT_GROUPS_CONFIG, ALL_STUDENT_GROUPS } from '@/lib/grouping-rules';
import { StudentFormModal } from '@/components/StudentFormModal';
import { ImportStudentModal } from '@/components/ImportStudentModal';
import { QuickJournalModal } from '@/components/QuickJournalModal';
import { AISuggestionModal } from '@/components/AISuggestionModal';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import * as XLSX from 'xlsx';

export default function SiswaPage() {
  const { students, deleteStudent, journals } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterGroup, setFilterGroup] = useState<StudentGroup | 'Semua'>('Semua');
  const [filterGender, setFilterGender] = useState<'Semua' | 'L' | 'P'>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);
  const [targetStudentForJournal, setTargetStudentForJournal] = useState<string | undefined>(undefined);
  const [aiModalStudent, setAiModalStudent] = useState<Student | null>(null);
  const [waModalStudent, setWaModalStudent] = useState<Student | null>(null);
  const [waModalJournal, setWaModalJournal] = useState<any>(undefined);

  // Available classes in system
  const allClasses = Array.from(new Set(students.map((s) => s.kelas))).sort();

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.catatan_khusus && s.catatan_khusus.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchKelas = filterKelas === 'Semua' || s.kelas === filterKelas;
    const currentGroup = s.kelompok_terkini || (s.status_terkini as StudentGroup);
    const matchGroup = filterGroup === 'Semua' || currentGroup === filterGroup;
    const matchGender = filterGender === 'Semua' || s.jenis_kelamin === filterGender;

    return matchQuery && matchKelas && matchGroup && matchGender;
  });

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleDelete = (student: Student) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa "${student.nama}"? Seluruh riwayat jurnal terkait siswa ini juga akan dihapus.`)) {
      deleteStudent(student.id);
    }
  };

  const handleOpenJournal = (studentId: string) => {
    setTargetStudentForJournal(studentId);
    setIsQuickJournalOpen(true);
  };

  const handleExportExcel = () => {
    const exportRows = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      NISN: s.nisn || '-',
      Nama: s.nama,
      Kelas: s.kelas,
      'Jenis Kelamin': s.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan',
      'Kontak Orang Tua': s.kontak_ortu,
      'Nama Orang Tua': s.nama_ortu || '-',
      Alamat: s.alamat || '-',
      'Kelompok Terkini': s.kelompok_terkini || s.status_terkini,
      'Catatan Khusus': s.catatan_khusus || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa');
    XLSX.writeFile(workbook, `Data_Siswa_BK_${filterKelas}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Manajemen Data Siswa
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar seluruh siswa bimbingan konseling dan klasifikasi 5 kelompok kondisi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/kelompok"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Papan Kanban</span>
          </Link>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Impor CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={() => {
              setEditingStudent(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NIS, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Filter Kelas */}
          <div className="sm:col-span-3">
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semua">Semua Kelas</option>
              {allClasses.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 5 Kelompok */}
          <div className="sm:col-span-3">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Semua">Semua 5 Kelompok</option>
              {ALL_STUDENT_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {STUDENT_GROUPS_CONFIG[g].emoji} {g}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="sm:col-span-1 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold border border-indigo-200 dark:border-indigo-800'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-xl text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold border border-indigo-200 dark:border-indigo-800'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Tampilan Tabel Lengkap"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Menampilkan <strong className="text-slate-700 dark:text-slate-200">{filteredStudents.length}</strong> dari{' '}
            {students.length} siswa
          </span>
          {(searchQuery || filterKelas !== 'Semua' || filterGroup !== 'Semua') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterKelas('Semua');
                setFilterGroup('Semua');
                setFilterGender('Semua');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* 3. Students Content (Grid / Table) */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Tidak ada data siswa yang cocok dengan filter
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Coba ubah kata kunci pencarian atau reset filter kelas dan kelompok kondisi.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const currentGroup = student.kelompok_terkini || (student.status_terkini as StudentGroup) || 'Stabil';
            const statusCfg = getStatusBadgeConfig(currentGroup);
            const journalCount = journals.filter((j) => j.student_id === student.id).length;

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-500/40 transition-all group"
              >
                <div>
                  {/* Top: Header Card */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {student.nama.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/siswa/${student.id}`}
                          className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors"
                        >
                          {student.nama}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          NIS: {student.nis} • Kelas {student.kelas} ({student.jenis_kelamin})
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} shrink-0`}
                    >
                      {statusCfg.emoji} {statusCfg.label}
                    </span>
                  </div>

                  {/* Catatan Khusus */}
                  {student.catatan_khusus ? (
                    <div className="text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      <strong className="text-slate-700 dark:text-slate-300">Catatan:</strong> {student.catatan_khusus}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic mb-3">
                      Belum ada catatan khusus untuk siswa ini.
                    </div>
                  )}

                  {/* Kontak Ortu */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    <span className="truncate">Wali: {student.nama_ortu || 'Orang Tua'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const studentJournals = journals.filter((j) => j.student_id === student.id);
                        const latest = studentJournals.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];
                        setWaModalStudent(student);
                        setWaModalJournal(latest);
                      }}
                      className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline shrink-0 cursor-pointer"
                      title="Kirim Laporan Perkembangan ke WhatsApp Orang Tua"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Lapor WA</span>
                    </button>
                  </div>
                </div>

                {/* Footer Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  <div className="text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{journalCount}</span> Observasi
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAiModalStudent(student)}
                      className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors"
                      title="Minta Saran AI Tindak Lanjut"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenJournal(student.id)}
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      + Catat
                    </button>
                    <Link
                      href={`/siswa/${student.id}`}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Lihat Profil & Timeline"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Ubah Data"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(student)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Kelompok Kondisi</th>
                  <th className="py-3 px-4">Kontak Wali</th>
                  <th className="py-3 px-4">Catatan Khusus</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student) => {
                  const currentGroup = student.kelompok_terkini || (student.status_terkini as StudentGroup) || 'Stabil';
                  const statusCfg = getStatusBadgeConfig(currentGroup);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/siswa/${student.id}`}
                          className="font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          {student.nama}
                        </Link>
                        <div className="text-[10px] text-slate-400">{student.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {student.kelas}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {student.nis}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          {statusCfg.emoji} {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            const studentJournals = journals.filter((j) => j.student_id === student.id);
                            const latest = studentJournals.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];
                            setWaModalStudent(student);
                            setWaModalJournal(latest);
                          }}
                          className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline cursor-pointer"
                          title="Kirim Laporan Perkembangan ke WhatsApp Orang Tua"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          <span>{student.kontak_ortu}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {student.catatan_khusus || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setAiModalStudent(student)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Saran AI"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenJournal(student.id)}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                          >
                            + Catat
                          </button>
                          <Link
                            href={`/siswa/${student.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingStudent}
      />

      {/* Import Modal */}
      <ImportStudentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Quick Journal Modal */}
      <QuickJournalModal
        isOpen={isQuickJournalOpen}
        onClose={() => setIsQuickJournalOpen(false)}
        preselectedStudentId={targetStudentForJournal}
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
