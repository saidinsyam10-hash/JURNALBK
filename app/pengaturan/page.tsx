'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Database, 
  RotateCcw, 
  CheckCircle2, 
  Sun, 
  Moon, 
  GraduationCap, 
  Key, 
  ExternalLink, 
  FileCode, 
  Download, 
  Upload, 
  AlertTriangle 
} from 'lucide-react';
import { SEED_USERS } from '@/lib/seed-data';

export default function PengaturanPage() {
  const { 
    currentUser, 
    setCurrentUser, 
    resetToDefaultSeed, 
    isDarkMode, 
    toggleDarkMode, 
    students, 
    journals, 
    auditLogs 
  } = useAppStore();

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSwitchUser = (userId: string) => {
    const targetUser = SEED_USERS.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('jurnal_bk_active_user_v1', JSON.stringify(targetUser));
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data siswa dan jurnal ke kondisi contoh bawaan sekolah (seed data)? Semua data baru yang Anda tambahkan akan terhapus.')) {
      resetToDefaultSeed();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  const handleDownloadBackupJSON = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      students,
      journals,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_jurnal_bk_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* 1. Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-1.5">
          <Settings className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Konfigurasi & Pengaturan Sistem</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Pengaturan Akun & Basis Data
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola profil pengguna Guru BK, beralih peran simulasi, atur tampilan, serta cadangkan dan reset data.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Basis data berhasil direset ke data contoh sekolah (10 siswa & catatan jurnal lengkap).</span>
        </div>
      )}

      {/* 2. Switch User Simulation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Profil & Simulasi Multi-Akun Guru BK
              </h2>
              <p className="text-xs text-slate-400">
                Uji coba hak akses, pembatasan kelas bimbingan, dan privasi catatan rahasia dengan beralih akun dalam 1-klik.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {SEED_USERS.map((u) => {
            const isActive = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isActive
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-xs ring-1 ring-teal-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{u.nama}</span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                        Aktif Sekarang
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                    <span>Kelas Bimbingan: <strong>{u.kelas_bimbingan.join(', ')}</strong></span>
                  </div>
                </div>

                {!isActive && (
                  <button
                    onClick={() => handleSwitchUser(u.id)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                  >
                    Ganti ke Akun Ini
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Tampilan & Preferensi Mode Gelap */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {isDarkMode ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Tema & Tampilan Aplikasi
              </h2>
              <p className="text-xs text-slate-400">
                Pilih tampilan yang nyaman untuk mata saat mencatat di ruangan atau saat berkeliling kelas.
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            <span>{isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}</span>
          </button>
        </div>
      </div>

      {/* 4. Manajemen Data & Pencadangan */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Cadangan Data & Reset Ulang
            </h2>
            <p className="text-xs text-slate-400">
              Unduh cadangan data lengkap atau reset basis data ke kondisi 10 siswa contoh.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Cadangkan Seluruh Basis Data
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Unduh file arsip JSON berisi seluruh data siswa ({students.length}), catatan jurnal ({journals.length}), dan log audit ({auditLogs.length}).
              </p>
            </div>
            <button
              onClick={handleDownloadBackupJSON}
              className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>Unduh Arsip JSON (.json)</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Reset ke Data Awal Demo</span>
              </div>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
                Kembalikan seluruh data ke 10 siswa awal MAN 1 Majene dengan riwayat catatan jurnal, pengingat tindak lanjut, dan log terstruktur.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Database ke Bawaan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Konfigurasi AI Si Biko (Gemini / Claude) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200/80 dark:border-purple-900/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Konfigurasi Kecerdasan Buatan (AI Si Biko)
              </h2>
              <p className="text-xs text-slate-400">
                Mendukung Google Gemini API (Disarankan) dan Claude API via Environment Variable aman di sisi server.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            Server-Side Secured
          </span>
        </div>

        <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            Sistem secara otomatis mengamankan privasi siswa: <strong>Nama dan NIS tidak pernah dikirim ke AI</strong> (disamarkan menjadi inisial). Jika API Key belum diisi, sistem otomatis mengaktifkan <strong>Mesin Analisis Pedagogis Bawaan</strong> sehingga fitur saran AI tetap berfungsi penuh 100%.
          </p>

          <div className="font-semibold text-slate-800 dark:text-slate-200">
            Cara Menghubungkan Google Gemini API Key Anda:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
            <li>Dapatkan API key gratis dari <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">Google AI Studio</a>.</li>
            <li>Buka file <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-indigo-700 dark:text-indigo-300 font-mono">.env.local</code> di direktori root aplikasi:
              <pre className="mt-1.5 p-2 bg-slate-900 text-slate-200 rounded-lg font-mono text-[10px] overflow-x-auto">
GEMINI_API_KEY=AIzaSy...your-gemini-key-here
              </pre>
            </li>
            <li>Simpan file dan restart dev server jika perlu. Si Biko akan langsung menggunakan model Gemini terbaru!</li>
          </ol>
        </div>
      </div>

      {/* 6. Supabase Integration Reference */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Integrasi Cloud Supabase & PostgreSQL
              </h2>
              <p className="text-xs text-slate-400">
                Skema SQL lengkap, fungsi RLS, dan triggers sinkronisasi otomatis siap dipasang di Supabase.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Skema SQL Siap
          </span>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            Langkah Menghubungkan ke Proyek Cloud Supabase Anda:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
            <li>Buka dashboard Supabase Anda di <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-indigo-700 dark:text-indigo-400">supabase.com</code></li>
            <li>Salin file <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-indigo-700 dark:text-indigo-400">supabase/schema.sql</code> ke SQL Editor di dashboard Supabase lalu jalankan (Run).</li>
            <li>Jalankan file <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-indigo-700 dark:text-indigo-400">supabase/seed.sql</code> untuk mengisi data siswa dan konseling awal.</li>
            <li>Tambahkan variabel lingkungan ke file <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-indigo-700 dark:text-indigo-400">.env.local</code>:
              <pre className="mt-1.5 p-2 bg-slate-900 text-slate-200 rounded-lg font-mono text-[10px] overflow-x-auto">
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co&#10;NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
              </pre>
            </li>
          </ol>
        </div>
      </div>

    </div>
  );
}
