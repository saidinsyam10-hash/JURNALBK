'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Activity, 
  Eye, 
  PlusCircle, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AuditLog } from '@/lib/types';
import * as XLSX from 'xlsx';

export default function AuditLogPage() {
  const { auditLogs, currentUser } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAksi, setFilterAksi] = useState<string>('Semua');
  const [filterEntitas, setFilterEntitas] = useState<string>('Semua');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      searchQuery.trim() === '' ||
      log.user_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchAksi = filterAksi === 'Semua' || log.aksi === filterAksi;
    const matchEntitas = filterEntitas === 'Semua' || log.entitas === filterEntitas;

    return matchSearch && matchAksi && matchEntitas;
  });

  const getAksiBadge = (aksi: AuditLog['aksi']) => {
    switch (aksi) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800';
      case 'VIEW_SECRET':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      case 'EXPORT':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const handleExportLogs = () => {
    const dataForExport = filteredLogs.map((l, idx) => ({
      No: idx + 1,
      'Waktu Akses': new Date(l.created_at).toLocaleString('id-ID'),
      'Pengguna / Konselor': l.user_nama,
      Aksi: l.aksi,
      Entitas: l.entitas,
      'ID Entitas': l.entitas_id || '-',
      'Detail Log Aktivitas': l.detail,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit_Log_Keamanan');
    XLSX.writeFile(workbook, `Audit_Log_BK_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Keamanan, Privasi & Akuntabilitas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Log Audit & Keamanan Data Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Rekam jejak akses, pencatatan rahasia, perubahan data, dan riwayat aktivitas setiap akun pengguna.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Ekspor Log (Excel)</span>
        </button>
      </div>

      {/* 2. Security Feature Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Row Level Security (RLS)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Setiap guru hanya dapat mengakses data siswa bimbingan sesuai wewenang.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Enkripsi Catatan Rahasia</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Terkunci
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Catatan bertanda "Rahasia" hanya dapat dibuka oleh konselor pembuatnya.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Audit Trail Terpadu</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Otomatis
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Seluruh operasi CRUD dan login tercatat dengan stempel waktu dan identitas akun.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama pengguna atau detail log aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterAksi}
              onChange={(e) => setFilterAksi(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Semua">Semua Aksi</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE">CREATE (Tambah Data)</option>
              <option value="UPDATE">UPDATE (Perbarui Data)</option>
              <option value="DELETE">DELETE (Hapus Data)</option>
              <option value="VIEW_SECRET">VIEW_SECRET (Akses Rahasia)</option>
              <option value="EXPORT">EXPORT (Unduh Laporan)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterEntitas}
              onChange={(e) => setFilterEntitas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Semua">Semua Entitas</option>
              <option value="student">student (Data Siswa)</option>
              <option value="journal">journal (Jurnal Konseling)</option>
              <option value="auth">auth (Otentikasi)</option>
              <option value="system">system (Sistem)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 4. Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Waktu</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Pengguna</th>
                <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">Aksi</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Entitas</th>
                <th className="py-3 px-4 font-semibold">Detail Log Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Tidak ada riwayat log audit yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                      {log.user_nama}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getAksiBadge(log.aksi)}`}>
                        {log.aksi}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {log.entitas}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {log.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
