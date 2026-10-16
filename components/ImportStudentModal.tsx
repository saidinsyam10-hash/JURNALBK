'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Upload, FileSpreadsheet, Download, Check, AlertCircle } from 'lucide-react';
import { Gender, StudentStatus } from '@/lib/types';

interface ImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportStudentModal({ isOpen, onClose }: ImportStudentModalProps) {
  const { importStudents } = useAppStore();
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const downloadSampleCSV = () => {
    const csvContent =
      'nis,nama,kelas,jenis_kelamin,kontak_ortu,catatan_khusus,status_terkini\n' +
      '24251001,Ahmad Fauzan Pratama,X-A,L,081234567890,Ketua pramuka,Baik\n' +
      '24251002,Nurul Hidayati,X-A,P,081398765432,Minat biologi,Baik\n' +
      '24251003,Budi Santoso,X-B,L,082155667788,Perlu perhatian kehadiran,Perlu Perhatian';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_data_siswa_bk.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSuccessCount(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        if (lines.length < 2) {
          setErrorMsg('File CSV tidak memiliki baris data!');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const nisIdx = headers.indexOf('nis');
        const namaIdx = headers.indexOf('nama');
        const kelasIdx = headers.indexOf('kelas');
        const jkIdx = headers.indexOf('jenis_kelamin');
        const kontakIdx = headers.indexOf('kontak_ortu');
        const catatanIdx = headers.indexOf('catatan_khusus');
        const statusIdx = headers.indexOf('status_terkini');

        if (nisIdx === -1 || namaIdx === -1) {
          setErrorMsg('Format CSV harus minimal memiliki kolom "nis" dan "nama"!');
          return;
        }

        const students: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          if (cols[nisIdx] && cols[namaIdx]) {
            const jk = (cols[jkIdx] || 'L').toUpperCase() as Gender;
            const status = (cols[statusIdx] || 'Baik') as StudentStatus;
            students.push({
              nis: cols[nisIdx],
              nama: cols[namaIdx],
              kelas: cols[kelasIdx] || 'X-A',
              jenis_kelamin: jk === 'P' ? 'P' : 'L',
              kontak_ortu: cols[kontakIdx] || '-',
              catatan_khusus: cols[catatanIdx] || undefined,
              status_terkini: ['Baik', 'Perlu Perhatian', 'Perlu Intervensi'].includes(status)
                ? status
                : 'Baik',
            });
          }
        }

        if (students.length === 0) {
          setErrorMsg('Tidak ada baris data valid yang terbaca.');
        } else {
          setParsedData(students);
        }
      } catch (err: any) {
        setErrorMsg('Gagal membaca file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (parsedData.length === 0) return;
    const count = importStudents(parsedData);
    setSuccessCount(count);
    setTimeout(() => {
      onClose();
      setParsedData([]);
      setSuccessCount(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold">Impor Data Siswa Massal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-teal-800 dark:text-teal-300 text-xs">
                Format Data CSV / Excel
              </div>
              <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">
                Gunakan template standar agar NIS, nama, kelas, dan kontak orang tua terisi otomatis.
              </div>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template</span>
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40 relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-2" />
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Klik untuk memilih file CSV atau seret ke sini
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Format yang didukung: .csv (Comma Separated Values)
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Berhasil mengimpor {successCount} siswa ke dalam basis data!</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5 flex items-center justify-between">
                <span>Pratinjau Data ({parsedData.length} Siswa Terdeteksi):</span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2">NIS</th>
                      <th className="p-2">Nama</th>
                      <th className="p-2">Kelas</th>
                      <th className="p-2">L/P</th>
                      <th className="p-2">Kontak Ortu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-mono font-medium">{row.nis}</td>
                        <td className="p-2 font-semibold">{row.nama}</td>
                        <td className="p-2">{row.kelas}</td>
                        <td className="p-2">{row.jenis_kelamin}</td>
                        <td className="p-2 text-slate-500">{row.kontak_ortu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 10 && (
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  Menampilkan 10 dari {parsedData.length} siswa...
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Tutup
            </button>
            <button
              type="button"
              disabled={parsedData.length === 0}
              onClick={handleExecuteImport}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Impor Sekarang ({parsedData.length} Siswa)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
