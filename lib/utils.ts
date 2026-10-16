import { StudentStatus, TrendType, AspectType, ActivityType, FollowUpStatus } from './types';

// Format tanggal ke Bahasa Indonesia (Contoh: "15 Oktober 2026")
export function formatDateIndo(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Format tanggal pendek (Contoh: "15 Okt 2026")
export function formatDateShortIndo(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Cek selisih hari dari hari ini
export function getDaysDiffFromToday(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Status badge warna konsisten sesuai ketentuan 5 Kelompok BK Harian:
// 🌟 Berkembang Baik (hijau), 🙂 Stabil (biru), ⏳ Belum Ada Kemajuan (kuning), 🧭 Perlu Bimbingan (oranye), 🚨 Perlu Intervensi Segera (merah)
export function getStatusBadgeConfig(status?: StudentStatus | string) {
  const safeStatus = status || 'Stabil';
  switch (safeStatus) {
    case 'Berkembang Baik':
    case 'Baik':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        glow: 'shadow-emerald-500/20',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
        label: 'Berkembang Baik',
        emoji: '🌟',
        score: 5,
      };
    case 'Stabil':
      return {
        bg: 'bg-sky-100 dark:bg-sky-950/40',
        text: 'text-sky-800 dark:text-sky-300',
        border: 'border-sky-300 dark:border-sky-800',
        dot: 'bg-sky-500',
        glow: 'shadow-sky-500/20',
        badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-300 dark:border-sky-800',
        label: 'Stabil',
        emoji: '🙂',
        score: 4,
      };
    case 'Belum Ada Kemajuan':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/40',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        glow: 'shadow-amber-500/20',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
        label: 'Belum Ada Kemajuan',
        emoji: '⏳',
        score: 3,
      };
    case 'Perlu Bimbingan':
    case 'Perlu Perhatian':
      return {
        bg: 'bg-orange-100 dark:bg-orange-950/40',
        text: 'text-orange-800 dark:text-orange-300',
        border: 'border-orange-300 dark:border-orange-800',
        dot: 'bg-orange-500',
        glow: 'shadow-orange-500/20',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-300 dark:border-orange-800',
        label: 'Perlu Bimbingan',
        emoji: '🧭',
        score: 2,
      };
    case 'Perlu Intervensi Segera':
    case 'Perlu Intervensi':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500',
        glow: 'shadow-rose-500/20',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800',
        label: 'Perlu Intervensi Segera',
        emoji: '🚨',
        score: 1,
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400',
        glow: '',
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
        label: status || 'Belum Ditentukan',
        emoji: '📋',
        score: 3,
      };
  }
}

// Konfigurasi Skor Wajah 1 - 5
export function getScoreFace(score: number) {
  switch (score) {
    case 5:
      return { emoji: '🌟', label: 'Sangat Baik (5)', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' };
    case 4:
      return { emoji: '🙂', label: 'Baik (4)', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50' };
    case 3:
      return { emoji: '😐', label: 'Cukup / Rata-rata (3)', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' };
    case 2:
      return { emoji: '😟', label: 'Kurang Baik (2)', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/50' };
    case 1:
    default:
      return { emoji: '😭', label: 'Sangat Buruk / Kritis (1)', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50' };
  }
}

// Sapaan personal berdasarkan waktu
export function getGreetingByHour(nama: string = 'Bapak/Ibu Guru') {
  const hour = new Date().getHours();
  let timeGreeting = 'Selamat Pagi';
  if (hour >= 11 && hour < 15) {
    timeGreeting = 'Selamat Siang';
  } else if (hour >= 15 && hour < 18) {
    timeGreeting = 'Selamat Sore';
  } else if (hour >= 18 || hour < 5) {
    timeGreeting = 'Selamat Malam';
  }
  return `${timeGreeting}, ${nama}!`;
}

// Konfigurasi Tren Perkembangan
export function getTrendBadgeConfig(tren: TrendType) {
  switch (tren) {
    case 'Meningkat':
      return {
        bg: 'bg-teal-50 dark:bg-teal-950/40',
        text: 'text-teal-700 dark:text-teal-300',
        badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
        icon: 'trending-up',
        label: 'Meningkat',
        emoji: '↗️',
      };
    case 'Stabil':
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/40',
        text: 'text-sky-700 dark:text-sky-300',
        badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
        icon: 'minus',
        label: 'Stabil',
        emoji: '➡️',
      };
    case 'Belum Ada Kemajuan':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
        icon: 'clock',
        label: 'Belum Ada Kemajuan',
        emoji: '⏳',
      };
    case 'Menurun':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
        icon: 'trending-down',
        label: 'Menurun',
        emoji: '↘️',
      };
  }
}

// Aspek yang dipantau colors
export function getAspectBadgeClass(aspek: AspectType): string {
  switch (aspek) {
    case 'Akademik':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Sosial':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Emosional':
      return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800';
    case 'Perilaku/Kedisiplinan':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Karier':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Kehadiran':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
  }
}

// Jenis Kegiatan
export function getActivityBadgeClass(activity: ActivityType): string {
  switch (activity) {
    case 'Konseling Individu':
      return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800';
    case 'Konseling Kelompok':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
    case 'Observasi Kelas':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    case 'Kunjungan Rumah':
      return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
    case 'Panggilan Orang Tua':
      return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
  }
}

// Konfigurasi Status Tindak Lanjut
export function getFollowUpStatusConfig(status: FollowUpStatus, targetDate?: string) {
  if (status === 'Selesai') {
    return {
      label: 'Selesai',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      isOverdue: false,
    };
  }

  if (targetDate) {
    const diff = getDaysDiffFromToday(targetDate);
    if (diff < 0) {
      return {
        label: `Terlambat ${Math.abs(diff)} hari`,
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse font-semibold',
        isOverdue: true,
      };
    } else if (diff === 0) {
      return {
        label: 'Jatuh Tempo Hari Ini',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold',
        isOverdue: true,
      };
    } else {
      return {
        label: `${diff} hari lagi`,
        badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
        isOverdue: false,
      };
    }
  }

  return {
    label: 'Menunggu',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    isOverdue: false,
  };
}
