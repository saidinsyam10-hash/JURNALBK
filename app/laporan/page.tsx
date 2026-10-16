'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  FileText, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Calendar, 
  Users, 
  BookMarked, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Building2, 
  TrendingUp, 
  UserCheck, 
  Eye, 
  Layers 
} from 'lucide-react';
import { 
  formatDateIndo, 
  formatDateShortIndo, 
  getStatusBadgeConfig, 
  getActivityBadgeClass, 
  getAspectBadgeClass 
} from '@/lib/utils';
import { StudentStatus, AspectType, ActivityType, Student } from '@/lib/types';
import { ExportReportModal } from '@/components/ExportReportModal';
import * as XLSX from 'xlsx';

export default function LaporanPage() {
  const { students, journals, currentUser } = useAppStore();

  const [activeTab, setActiveTab] = useState<'rekap_kelas' | 'rekap_siswa' | 'detail_jurnal'>('rekap_kelas');

  // Filter States
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState<StudentStatus | 'Semua'>('Semua');
  const [filterAspek, setFilterAspek] = useState<AspectType | 'Semua'>('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected student for Tab 'rekap_siswa'
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  // Export PDF Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Available classes
  const allClasses = Array.from(new Set(students.map((s) => s.kelas))).sort();
  const studentMap = new Map(students.map((s) => [s.id, s]));

  // Filtered journals based on user criteria
  const filteredJournals = journals.filter((j) => {
    const student = studentMap.get(j.student_id);
    const matchKelas = filterKelas === 'Semua' || student?.kelas === filterKelas;
    const jGroup = j.kelompok || j.kategori;
    const matchKategori = filterKategori === 'Semua' || jGroup === filterKategori;
    const matchAspek = filterAspek === 'Semua' || j.aspek.includes(filterAspek);

    let matchDate = true;
    if (startDate && j.tanggal < startDate) matchDate = false;
    if (endDate && j.tanggal > endDate) matchDate = false;

    return matchKelas && matchKategori && matchAspek && matchDate;
  });

  // Calculate Rekap per Kelas
  const classSummaryList = allClasses.map((kelasName) => {
    const classStudents = students.filter((s) => s.kelas === kelasName);
    const classStudentIds = new Set(classStudents.map((s) => s.id));
    const classJournals = journals.filter((j) => classStudentIds.has(j.student_id));

    const totalStudents = classStudents.length;
    const berkembangCount = classStudents.filter((s) => (s.kelompok_terkini || s.status_terkini) === 'Berkembang Baik').length;
    const stabilCount = classStudents.filter((s) => (s.kelompok_terkini || s.status_terkini) === 'Stabil').length;
    const belumAdaKemajuanCount = classStudents.filter((s) => (s.kelompok_terkini || s.status_terkini) === 'Belum Ada Kemajuan').length;
    const bimbinganCount = classStudents.filter((s) => (s.kelompok_terkini || s.status_terkini) === 'Perlu Bimbingan').length;
    const intervensiCount = classStudents.filter((s) => (s.kelompok_terkini || s.status_terkini) === 'Perlu Intervensi Segera').length;

    // Count most common aspect in this class
    const aspectCounts: { [key: string]: number } = {};
    classJournals.forEach((j) => {
      j.aspek.forEach((a) => {
        aspectCounts[a] = (aspectCounts[a] || 0) + 1;
      });
    });

    let topAspect = '-';
    let topAspectVal = 0;
    Object.entries(aspectCounts).forEach(([aspect, count]) => {
      if (count > topAspectVal) {
        topAspectVal = count;
        topAspect = aspect;
      }
    });

    const percentGood = totalStudents > 0 ? Math.round(((berkembangCount + stabilCount) / totalStudents) * 100) : 0;

    return {
      kelas: kelasName,
      totalStudents,
      berkembangCount,
      stabilCount,
      belumAdaKemajuanCount,
      bimbinganCount,
      intervensiCount,
      totalJournals: classJournals.length,
      topAspect,
      percentGood,
    };
  });

  // Export Rekap Kelas to Excel
  const handleExportRekapKelasExcel = () => {
    const exportData = classSummaryList.map((c, idx) => ({
      No: idx + 1,
      Kelas: c.kelas,
      'Total Siswa': c.totalStudents,
      '🌟 Berkembang Baik': c.berkembangCount,
      '🙂 Stabil': c.stabilCount,
      '⏳ Belum Ada Kemajuan': c.belumAdaKemajuanCount,
      '🧭 Perlu Bimbingan': c.bimbinganCount,
      '🚨 Perlu Intervensi Segera': c.intervensiCount,
      'Total Sesi Konseling': c.totalJournals,
      'Fokus Masalah Dominan': c.topAspect,
      '% Siswa Kondisi Positif': `${c.percentGood}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_Per_Kelas');
    XLSX.writeFile(workbook, `Rekapitulasi_Kelas_BK_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export Individual Student Report to Excel
  const handleExportIndividualStudentExcel = (student: Student, studentLogs: typeof journals) => {
    const headerInfo = [
      { A: 'LAPORAN INDIVIDUAL BIMBINGAN DAN KONSELING' },
      { A: `Nama Siswa: ${student.nama}` },
      { A: `NIS / NISN: ${student.nis} / ${student.nisn || '-'}` },
      { A: `Kelas: ${student.kelas}` },
      { A: `Status Terkini: ${student.status_terkini}` },
      { A: `Kontak Orang Tua: ${student.kontak_ortu}` },
      { A: '' },
    ];

    const logsData = studentLogs.map((j, idx) => ({
      No: idx + 1,
      Tanggal: j.tanggal,
      'Jenis Kegiatan': j.jenis_kegiatan,
      'Aspek Dipantau': j.aspek.join(', '),
      'Uraian Kondisi': j.uraian,
      Tren: j.tren,
      'Kategori Status': j.kategori,
      'Tindak Lanjut': j.tindak_lanjut,
      'Target Tanggal': j.tanggal_tindak_lanjut || '-',
      'Status Tindak Lanjut': j.status_tindak_lanjut,
      Konselor: j.guru_nama || 'Guru BK',
    }));

    const worksheet = XLSX.utils.json_to_sheet(logsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat_Siswa');
    XLSX.writeFile(workbook, `Laporan_BK_${student.nama.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedStudentJournals = journals
    .filter((j) => j.student_id === selectedStudentId)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return (
    <div className="space-y-6">
      
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Pusat Pelaporan Resmi & Ekspor</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Laporan & Rekapitulasi Bimbingan Konseling
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Susun laporan rekapitulasi berkala per kelas, kartu konseling per siswa, serta unduh format PDF dan Excel resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF / Pratinjau Resmi</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-3.5 h-3.5 text-teal-600" />
          <span>Filter Laporan Terpadu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Filter Kelas
            </label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
            >
              <option value="Semua">Semua Kelas</option>
              {allClasses.map((k) => (
                <option key={k} value={k}>Kelas {k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Kategori Status
            </label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
            >
              <option value="Semua">Semua 5 Kelompok</option>
              <option value="Berkembang Baik">🌟 Berkembang Baik</option>
              <option value="Stabil">🙂 Stabil</option>
              <option value="Belum Ada Kemajuan">⏳ Belum Ada Kemajuan</option>
              <option value="Perlu Bimbingan">🧭 Perlu Bimbingan</option>
              <option value="Perlu Intervensi Segera">🚨 Perlu Intervensi Segera</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Aspek Dipantau
            </label>
            <select
              value={filterAspek}
              onChange={(e) => setFilterAspek(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
            >
              <option value="Semua">Semua Aspek</option>
              <option value="Akademik">Akademik</option>
              <option value="Sosial">Sosial</option>
              <option value="Emosional">Emosional</option>
              <option value="Perilaku/Kedisiplinan">Perilaku/Kedisiplinan</option>
              <option value="Karier">Karier</option>
              <option value="Kehadiran">Kehadiran</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Rentang Tanggal
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('rekap_kelas')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rekap_kelas'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Rekapitulasi Per Kelas</span>
        </button>

        <button
          onClick={() => setActiveTab('rekap_siswa')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rekap_siswa'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Laporan Per Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('detail_jurnal')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'detail_jurnal'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>3. Rekap Detail Jurnal Kasus ({filteredJournals.length})</span>
        </button>
      </div>

      {/* TAB 1: Rekapitulasi Per Kelas */}
      {activeTab === 'rekap_kelas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Distribusi Kondisi & Kasus Bimbingan Konseling Setiap Rombel
            </h2>
            <button
              onClick={handleExportRekapKelasExcel}
              className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh Rekap Kelas (Excel)</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Kelas</th>
                    <th className="py-3 px-4 font-semibold text-center">Total</th>
                    <th className="py-3 px-4 font-semibold text-center">🌟 Berkembang</th>
                    <th className="py-3 px-4 font-semibold text-center">🙂 Stabil</th>
                    <th className="py-3 px-4 font-semibold text-center">⏳ Belum Maju</th>
                    <th className="py-3 px-4 font-semibold text-center">🧭 Bimbingan</th>
                    <th className="py-3 px-4 font-semibold text-center">🚨 Intervensi</th>
                    <th className="py-3 px-4 font-semibold text-center">Observasi</th>
                    <th className="py-3 px-4 font-semibold">Aspek Dominan</th>
                    <th className="py-3 px-4 font-semibold text-right">% Kondisi Positif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classSummaryList.map((c) => (
                    <tr key={c.kelas} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                        Kelas {c.kelas}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {c.totalStudents}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {c.berkembangCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                          {c.stabilCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          {c.belumAdaKemajuanCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                          {c.bimbinganCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          {c.intervensiCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-teal-600 dark:text-teal-400">
                        {c.totalJournals} kali
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {c.topAspect}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{c.percentGood}%</span>
                          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${c.percentGood}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Laporan Per Siswa */}
      {activeTab === 'rekap_siswa' && (
        <div className="space-y-5">
          {/* Student Picker Selector */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Siswa untuk Dibuatkan Laporan:
              </label>
            </div>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 max-w-sm w-full"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.kelas} - NIS: {s.nis})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              
              {/* Header Cardlet */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      {selectedStudent.nama}
                    </h2>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeConfig(selectedStudent.kelompok_terkini || selectedStudent.status_terkini).badge}`}>
                      {getStatusBadgeConfig(selectedStudent.kelompok_terkini || selectedStudent.status_terkini).emoji} {selectedStudent.kelompok_terkini || selectedStudent.status_terkini || 'Stabil'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>NIS: <strong>{selectedStudent.nis}</strong></span>
                    <span>Kelas: <strong>{selectedStudent.kelas}</strong></span>
                    <span>Jenis Kelamin: <strong>{selectedStudent.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</strong></span>
                    <span>Kontak Ortu: <strong>{selectedStudent.kontak_ortu}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportIndividualStudentExcel(selectedStudent, selectedStudentJournals)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Ekspor Excel Siswa</span>
                  </button>
                  <Link
                    href={`/siswa/${selectedStudent.id}`}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Buka Profil Lengkap</span>
                  </Link>
                </div>
              </div>

              {/* Student Counseling History Logs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Riwayat Sesi Konseling & Catatan Perkembangan ({selectedStudentJournals.length} Catatan)
                </h3>

                {selectedStudentJournals.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Siswa ini belum memiliki riwayat catatan jurnal bimbingan konseling.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedStudentJournals.map((j) => (
                      <div
                        key={j.id}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {formatDateIndo(j.tanggal)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getActivityBadgeClass(j.jenis_kegiatan)}`}>
                              {j.jenis_kegiatan}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeConfig(j.kategori).badge}`}>
                            {j.kategori}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {j.uraian}
                        </p>

                        {j.tindak_lanjut && (
                          <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-100 dark:border-teal-900/40">
                            <strong>Tindak Lanjut: </strong> {j.tindak_lanjut}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 3: Rekap Detail Jurnal Kasus */}
      {activeTab === 'detail_jurnal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Data Lengkap Catatan Konseling Terfilter ({filteredJournals.length} Data)
            </h2>
            <button
              onClick={() => {
                const dataToExport = filteredJournals.map((j, idx) => {
                  const s = studentMap.get(j.student_id);
                  return {
                    No: idx + 1,
                    Tanggal: j.tanggal,
                    NIS: s?.nis || '-',
                    Nama: s?.nama || '-',
                    Kelas: s?.kelas || '-',
                    Kegiatan: j.jenis_kegiatan,
                    Aspek: j.aspek.join(', '),
                    Uraian: j.uraian,
                    Tren: j.tren,
                    Kategori: j.kategori,
                    'Tindak Lanjut': j.tindak_lanjut,
                    'Target Tanggal': j.tanggal_tindak_lanjut || '-',
                    Konselor: j.guru_nama || 'Guru BK',
                  };
                });
                const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Detail_Jurnal');
                XLSX.writeFile(workbook, `Rekap_Jurnal_Kasus_${new Date().toISOString().split('T')[0]}.xlsx`);
              }}
              className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh Detail Excel</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5 font-semibold">Tanggal</th>
                    <th className="py-3 px-3.5 font-semibold">Siswa & Kelas</th>
                    <th className="py-3 px-3.5 font-semibold">Kegiatan</th>
                    <th className="py-3 px-3.5 font-semibold">Aspek</th>
                    <th className="py-3 px-3.5 font-semibold">Kategori</th>
                    <th className="py-3 px-3.5 font-semibold">Uraian Ringkas</th>
                    <th className="py-3 px-3.5 font-semibold">Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredJournals.map((j) => {
                    const student = studentMap.get(j.student_id);
                    const statusCfg = getStatusBadgeConfig(j.kategori);

                    return (
                      <tr key={j.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                          {formatDateShortIndo(j.tanggal)}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <Link href={`/siswa/${j.student_id}`} className="font-bold text-teal-600 hover:underline">
                            {student?.nama}
                          </Link>
                          <div className="text-[11px] text-slate-400">Kelas {student?.kelas}</div>
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getActivityBadgeClass(j.jenis_kegiatan)}`}>
                            {j.jenis_kegiatan}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {j.aspek.map((a) => (
                              <span key={a} className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                {a}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.badge}`}>
                            {j.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 max-w-xs truncate text-slate-600 dark:text-slate-300">
                          {j.uraian}
                        </td>
                        <td className="py-3 px-3.5 max-w-xs truncate text-slate-500">
                          {j.tindak_lanjut || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Export to PDF Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredJournals={filteredJournals}
        selectedKelas={filterKelas}
        startDate={startDate}
        endDate={endDate}
      />

    </div>
  );
}
