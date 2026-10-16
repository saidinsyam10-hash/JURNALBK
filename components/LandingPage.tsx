'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  BookMarked, 
  Layers, 
  BrainCircuit, 
  TrendingUp, 
  FileSpreadsheet, 
  Clock, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  HeartHandshake, 
  Users, 
  GraduationCap, 
  ChevronRight,
  Smile,
  Shield,
  Star
} from 'lucide-react';
import { MascotBiko } from './MascotBiko';

export function LandingPage() {
  const features = [
    {
      title: 'Pencatatan Cepat & Mudah',
      desc: 'Form observasi cepat selesai dalam waktu kurang dari 1 menit dengan slider skor wajah dan dukungan input suara.',
      icon: BookMarked,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Cepat & Ergonomis',
    },
    {
      title: 'Pengelompokan Otomatis',
      desc: 'Klasifikasi dinamis 5 kelompok siswa berdasarkan riwayat skor dan tren perkembangan untuk pemantauan yang adil.',
      icon: Layers,
      color: 'from-amber-500 to-orange-600',
      badge: '5 Kelompok Kondisi',
    },
    {
      title: 'Saran Tindak Lanjut AI',
      desc: 'Si Biko AI merumuskan hipotesis pemicu, langkah konkret mingguan, teknik konseling, dan panduan mitigasi risiko.',
      icon: BrainCircuit,
      color: 'from-purple-500 to-pink-600',
      badge: 'Didukung AI Cerdas',
    },
    {
      title: 'Grafik Tren & Visualisasi',
      desc: 'Diagram garis tren skor perkembangan dan diagram donat distribusi kelompok untuk membaca arah kemajuan siswa.',
      icon: TrendingUp,
      color: 'from-teal-500 to-emerald-600',
      badge: 'Visual & Terukur',
    },
    {
      title: 'Laporan PDF & Excel Resmi',
      desc: 'Ekspor rekapitulasi per rombel, buku catatan kasus, serta cetak kartu konseling berstandar Kop Surat sekolah.',
      icon: FileSpreadsheet,
      color: 'from-emerald-500 to-teal-700',
      badge: 'Siap Cetak / Arsip',
    },
    {
      title: 'Pengingat Tindak Lanjut',
      desc: 'Notifikasi otomatis untuk agenda konseling yang jatuh tempo hari ini atau terlambat agar tidak ada siswa terabaikan.',
      icon: Clock,
      color: 'from-rose-500 to-red-600',
      badge: 'Siaga & Tepat Waktu',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Catat Sesi & Observasi',
      desc: 'Guru BK mengamati atau melakukan sesi konseling, lalu mengisi formulir ringkas mencakup aspek, skor kondisi 1-5, dan catatan perilaku.',
      icon: BookMarked,
      accent: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      step: '02',
      title: 'Sistem Mengelompokkan',
      desc: 'Aturan cerdas otomatis menganalisis skor dan tren 3-5 catatan terakhir untuk menempatkan siswa pada kelompok yang tepat di papan kanban.',
      icon: Layers,
      accent: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      step: '03',
      title: 'Tindak Lanjut dengan Saran AI',
      desc: 'Manfaatkan rekomendasi Si Biko AI untuk merumuskan teknik bimbingan, jadwal temu orang tua, serta evaluasi kemajuan berkala.',
      icon: Sparkles,
      accent: 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-indigo-100/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <MascotBiko expression="welcoming" size={42} animate={false} />
            <div>
              <div className="font-extrabold text-indigo-950 dark:text-indigo-100 text-lg leading-tight flex items-center gap-1.5">
                <span>BK Harian</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-indigo-950">
                  AI Ready
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Sistem Jurnal & Pendampingan Siswa
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#fitur" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Fitur Unggulan
            </a>
            <a href="#cara-kerja" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Cara Kerja
            </a>
            <a href="#privasi" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privasi & Keamanan
            </a>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Masuk Guru BK</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        
        {/* Soft Background Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-300/30 to-purple-300/30 dark:from-indigo-900/20 dark:to-purple-900/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-200/30 dark:bg-amber-900/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copywriting */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sahabat Digital Guru BK Berdaya AI</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15]">
                Setiap Siswa Punya Cerita.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Catat, Pahami, Dampingi.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Bantu setiap anak bertumbuh secara optimal. Pantau perkembangan afektif dan akademik siswa dari hari ke hari dengan sistem pencatatan cepat, pengelompokan otomatis, dan saran tindak lanjut berbasis empati dari AI.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-indigo-600/30 hover:scale-102 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Masuk Sekarang (Demo Siap Pakai)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#fitur"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold transition-all text-center shadow-xs"
                >
                  Pelajari Fitur
                </a>
              </div>

              {/* Highlights Micro-stats */}
              <div className="pt-6 border-t border-slate-200/70 dark:border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400">&lt; 1 Menit</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pencatatan Cepat</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400">5 Kelompok</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Klasifikasi Dinamis</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-400">100% Aman</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Privasi Siswa Terjaga</div>
                </div>
              </div>

            </div>

            {/* Right Mascot Hero Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                
                {/* Mascot Card Backdrop */}
                <div className="w-72 sm:w-84 md:w-96 rounded-3xl bg-gradient-to-b from-indigo-500/10 via-purple-500/10 to-amber-500/10 p-6 sm:p-8 border border-white dark:border-slate-700/80 backdrop-blur-md shadow-2xl relative">
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 px-3 py-1 bg-amber-400 text-indigo-950 rounded-full font-black text-[11px] shadow-md flex items-center gap-1 animate-bounce">
                    <Star className="w-3.5 h-3.5 fill-indigo-950" />
                    <span>Hai, Saya Si Biko!</span>
                  </div>

                  <div className="flex justify-center py-4">
                    <MascotBiko expression="welcoming" size={170} />
                  </div>

                  {/* Speech Bubble */}
                  <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-indigo-100 dark:border-slate-700 text-center space-y-1">
                    <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      "Tak ada siswa nakal, yang ada siswa yang butuh didengar."
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Si Biko • Maskot Sahabat Guru BK
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Section Fitur */}
      <section id="fitur" className="py-20 bg-slate-50/70 dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Solusi Lengkap Guru BK
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Dirancang untuk Kemudahan & Ketenangan Bekerja
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Setiap fitur disusun agar Guru BK dapat fokus pada hal paling penting: memberikan bimbingan dengan hati.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {f.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Section Cara Kerja */}
      <section id="cara-kerja" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Alur Sederhana & Terstruktur
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              3 Langkah Praktis Pendampingan Siswa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Dari observasi awal di kelas hingga tindak lanjut kolaboratif bersama orang tua.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-xs relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl border-2 ${st.accent} flex items-center justify-center font-bold`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-slate-300 dark:text-slate-700">
                        {st.step}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {st.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Section Pernyataan Privasi */}
      <section id="privasi" className="py-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="flex items-start gap-4 max-w-2xl">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold tracking-tight">
                  Komitmen Penuh atas Privasi & Kerahasiaan Siswa
                </h3>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  Data konseling bersifat rahasia (*Row Level Security* aktif). Catatan sensitif hanya dapat diakses oleh guru pembuatnya. Saat menggunakan fitur AI, nama dan nomor induk siswa disamarkan secara otomatis demi melindungi hak privasi anak.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="px-6 py-3 bg-white text-indigo-950 hover:bg-indigo-50 rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg transition-all shrink-0 cursor-pointer"
            >
              Coba Masuk Guru BK
            </Link>

          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <MascotBiko expression="welcoming" size={24} animate={false} />
            <span>BK Harian • Aplikasi Bimbingan dan Konseling Sekolah</span>
          </div>
          <div>
            Dikembangkan dengan empati untuk Guru BK Indonesia.
          </div>
        </div>
      </footer>

    </div>
  );
}
