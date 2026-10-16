'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { MascotBiko } from '@/components/MascotBiko';
import { SEED_USERS } from '@/lib/seed-data';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();

  const [email, setEmail] = useState('santari@sekolah.sch.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Mohon masukkan alamat email Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Mohon masukkan kata sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = login(email);
      if (success) {
        router.push('/');
      } else {
        setErrorMsg('Email atau kata sandi tidak ditemukan dalam data guru sekolah.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoLogin = (userEmail: string, role?: 'guru_bk' | 'admin') => {
    setEmail(userEmail);
    setPassword('password123');
    setIsLoading(true);
    setTimeout(() => {
      login(userEmail, role);
      router.push('/');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 overflow-hidden">
        
        {/* Left Column: Mascot & Encouraging Message */}
        <div className="md:col-span-5 p-8 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-200 hover:text-white text-xs font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Depan</span>
            </Link>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-bold mb-3 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ruang Kerja Guru BK</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                BK Harian
              </h1>
              <p className="text-indigo-100 text-xs mt-1.5 leading-relaxed">
                Mendampingi setiap langkah generasi masa depan dengan empati, kesabaran, dan data yang terpercaya.
              </p>
            </div>
          </div>

          {/* Center Mascot Illustration */}
          <div className="relative z-10 py-6 flex flex-col items-center text-center">
            <MascotBiko expression="welcoming" size={140} />
            <div className="mt-3 p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-[11px] text-white font-medium max-w-xs shadow-sm">
              "Selamat datang kembali, Guru Hebat! Si Biko siap mendampingi pencatatan hari ini."
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-indigo-500/40 text-[11px] text-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Data Terisolasi & Rahasia</span>
            </div>
            <span>v2.0 • MAN 1 Majene</span>
          </div>
        </div>

        {/* Right Column: Form Login */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          
          <div>
            <div className="space-y-1 mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Silakan masukkan email dan kata sandi Guru Bimbingan dan Konseling.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email Sekolah
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="nama@sekolah.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Ingat saya di perangkat ini
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memproses masuk...</span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Akun Demo Pengujian Cepat:</span>
              <span className="text-[10px] text-indigo-600 font-normal">Klik untuk masuk instan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('santari@sekolah.sch.id', 'guru_bk')}
                className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-indigo-600">
                  SANTARI HASAN, S.Pd
                </div>
                <div className="text-[10px] text-slate-400">
                  Guru BK Utama (Kelas X & XI)
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('hendra@sekolah.sch.id', 'guru_bk')}
                className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs group-hover:text-indigo-600">
                  Hendra Gunawan, S.Psi.
                </div>
                <div className="text-[10px] text-slate-400">
                  Guru BK (Kelas XII)
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <MascotBiko expression="thinking" size={80} />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Lupa Kata Sandi Akun BK?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Untuk menjaga kerahasiaan data siswa, reset kata sandi dilakukan secara terverifikasi melalui Tim Administrator TI Sekolah / Kepala Ruang BK MAN 1 Majene.
            </p>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-[11px] text-indigo-800 dark:text-indigo-300 font-medium">
              Hubungi: admin.bk@sekolah.sch.id atau gunakan akun demo untuk pengujian langsung.
            </div>
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Mengerti & Kembali
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
