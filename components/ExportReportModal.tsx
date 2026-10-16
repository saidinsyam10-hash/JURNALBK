'use client';

import React, { useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Printer, Download, FileSpreadsheet, Building2 } from 'lucide-react';
import { JournalEntry, Student } from '@/lib/types';
import { formatDateIndo, formatDateShortIndo } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredJournals: JournalEntry[];
  selectedKelas?: string;
  startDate?: string;
  endDate?: string;
}

export function ExportReportModal({
  isOpen,
  onClose,
  filteredJournals,
  selectedKelas,
  startDate,
  endDate,
}: ExportReportModalProps) {
  const { students, currentUser } = useAppStore();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const dataForExport = filteredJournals.map((j, idx) => {
      const student = students.find((s) => s.id === j.student_id);
      return {
        No: idx + 1,
        Tanggal: j.tanggal,
        NIS: student?.nis || '-',
        'Nama Siswa': student?.nama || '-',
        Kelas: student?.kelas || '-',
        'Jenis Kegiatan': j.jenis_kegiatan,
        'Aspek yang Dipantau': j.aspek.join(', '),
        'Uraian Kondisi': j.uraian,
        'Tren Perkembangan': j.tren,
        'Kategori Status': j.kategori,
        'Rencana Tindak Lanjut': j.tindak_lanjut,
        'Target Tindak Lanjut': j.tanggal_tindak_lanjut || '-',
        'Status Tindak Lanjut': j.status_tindak_lanjut,
        'Sifat Catatan': j.is_rahasia ? 'Rahasia' : 'Biasa',
        'Guru Konselor': j.guru_nama || currentUser?.nama || 'Guru BK',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jurnal_BK');
    
    // Auto-fit column widths
    const max_width = dataForExport.reduce((w, r) => Math.max(w, (r['Nama Siswa'] || '').length), 10);
    worksheet['!cols'] = [
      { wch: 4 }, // No
      { wch: 12 }, // Tanggal
      { wch: 12 }, // NIS
      { wch: Math.max(max_width, 20) }, // Nama
      { wch: 8 }, // Kelas
      { wch: 18 }, // Kegiatan
      { wch: 22 }, // Aspek
      { wch: 35 }, // Uraian
      { wch: 12 }, // Tren
      { wch: 16 }, // Kategori
      { wch: 30 }, // Tindak Lanjut
      { wch: 12 }, // Target
      { wch: 12 }, // Status
      { wch: 10 }, // Rahasia
      { wch: 24 }, // Konselor
    ];

    const fileName = `Rekap_Jurnal_Guru_BK_${selectedKelas || 'Semua_Kelas'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header Controls (No-Print) */}
        <div className="no-print px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-bold">Laporan & Rekapitulasi Jurnal Bimbingan Konseling</h2>
              <p className="text-xs text-slate-400">Siap dicetak ke format PDF resmi atau diekspor ke Microsoft Excel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="p-6 max-h-[78vh] overflow-y-auto bg-white text-black" ref={printAreaRef}>
          
          {/* Official Letterhead / Kop Surat */}
          <div className="text-center pb-4 border-b-2 border-black mb-6">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-700">
              Kementerian Agama Republik Indonesia
            </h3>
            <h2 className="text-base font-extrabold uppercase tracking-wider text-black">
              Madrasah Aliyah Negeri 1 Majene
            </h2>
            <h4 className="text-xs font-bold uppercase text-teal-800">
              Unit Layanan Bimbingan dan Konseling (BK)
            </h4>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Jl. Jenderal Sudirman No. 25, Labuang, Kec. Banggae Timur, Kab. Majene, Sulawesi Barat 91412
            </p>
            <p className="text-[10px] text-slate-600">
              Email: bk.man1majene@kemenag.go.id • Laman: man1majene.sch.id
            </p>
          </div>

          {/* Title of Document */}
          <div className="text-center mb-5">
            <h1 className="text-sm font-bold uppercase underline tracking-wide">
              Rekapitulasi Jurnal Perkembangan Siswa
            </h1>
            <p className="text-[11px] text-slate-600 mt-1">
              Kelas: <span className="font-semibold text-black">{selectedKelas || 'Semua Kelas'}</span> • Periode:{' '}
              <span className="font-semibold text-black">
                {startDate ? formatDateShortIndo(startDate) : 'Awal Tahun Ajaran'} s/d{' '}
                {endDate ? formatDateShortIndo(endDate) : 'Sekarang'}
              </span>
            </p>
          </div>

          {/* Table of Entries */}
          <table className="w-full text-left text-[10px] border border-black border-collapse">
            <thead>
              <tr className="bg-slate-100 text-black font-bold">
                <th className="border border-black p-1.5 text-center w-8">No</th>
                <th className="border border-black p-1.5 w-20">Tanggal</th>
                <th className="border border-black p-1.5 w-32">Nama Siswa</th>
                <th className="border border-black p-1.5 w-12 text-center">Kelas</th>
                <th className="border border-black p-1.5 w-24">Kegiatan</th>
                <th className="border border-black p-1.5 w-28">Aspek</th>
                <th className="border border-black p-1.5">Uraian & Perkembangan</th>
                <th className="border border-black p-1.5 w-20 text-center">Status</th>
                <th className="border border-black p-1.5 w-28">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody>
              {filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-black p-6 text-center text-slate-500">
                    Tidak ada catatan jurnal bimbingan konseling pada filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredJournals.map((j, idx) => {
                  const student = students.find((s) => s.id === j.student_id);
                  return (
                    <tr key={j.id} className="align-top">
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5 font-mono">{formatDateShortIndo(j.tanggal)}</td>
                      <td className="border border-black p-1.5 font-semibold">
                        {student?.nama || '-'}
                        <div className="text-[9px] text-slate-500 font-normal">NIS: {student?.nis}</div>
                      </td>
                      <td className="border border-black p-1.5 text-center font-medium">{student?.kelas || '-'}</td>
                      <td className="border border-black p-1.5">{j.jenis_kegiatan}</td>
                      <td className="border border-black p-1.5">{j.aspek.join(', ')}</td>
                      <td className="border border-black p-1.5 leading-relaxed">
                        <div className="text-[10px]">{j.uraian}</div>
                        <div className="text-[9px] font-semibold text-slate-600 mt-0.5">
                          Tren: {j.tren} {j.is_rahasia && '• [Catatan Rahasia Disamarkan]'}
                        </div>
                      </td>
                      <td className="border border-black p-1.5 text-center font-bold">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-black border border-slate-300">
                          {j.kelompok || j.kategori}
                        </span>
                      </td>
                      <td className="border border-black p-1.5 text-[9px] leading-tight">
                        {j.tindak_lanjut || '-'}
                        {j.tanggal_tindak_lanjut && (
                          <div className="text-slate-500 mt-0.5">
                            Target: {formatDateShortIndo(j.tanggal_tindak_lanjut)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Official Signatures Section */}
          <div className="mt-8 pt-4 flex items-start justify-between text-xs text-black page-break-inside-avoid">
            <div className="text-center w-56">
              <p>Mengetahui,</p>
              <p className="font-semibold">Kepala MAN 1 Majene</p>
              <div className="h-16" />
              <p className="font-bold underline">H. Muhammad As'ad, S.Ag., M.Pd.</p>
              <p className="text-[10px] text-slate-600">NIP. 19720415 199903 1 002</p>
            </div>

            <div className="text-center w-56">
              <p>Majene, {formatDateIndo(new Date().toISOString().split('T')[0])}</p>
              <p className="font-semibold">Guru Bimbingan dan Konseling</p>
              <div className="h-16" />
              <p className="font-bold underline">{currentUser?.nama || 'SANTARI HASAN, S.Pd'}</p>
              <p className="text-[10px] text-slate-600">NIP. {currentUser?.nip || '19820512 200801 2 015'}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
