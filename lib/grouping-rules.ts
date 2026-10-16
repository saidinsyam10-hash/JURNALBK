import { StudentGroup, TrendType, JournalEntry, Student } from './types';

export interface GroupConfig {
  id: StudentGroup;
  label: string;
  emoji: string;
  badge: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  description: string;
  level: number; // 1 (paling baik) s/d 5 (paling kritis)
}

export const STUDENT_GROUPS_CONFIG: Record<StudentGroup, GroupConfig> = {
  'Berkembang Baik': {
    id: 'Berkembang Baik',
    label: 'Berkembang Baik',
    emoji: '🌟',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    bgLight: 'bg-emerald-50/70',
    bgDark: 'dark:bg-emerald-950/20',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    accentColor: '#10b981',
    description: 'Kondisi psikososial & akademik sangat baik, adaptif, serta menunjukkan tren positif.',
    level: 1,
  },
  'Stabil': {
    id: 'Stabil',
    label: 'Stabil',
    emoji: '🙂',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    bgLight: 'bg-sky-50/70',
    bgDark: 'dark:bg-sky-950/20',
    borderColor: 'border-sky-300 dark:border-sky-800',
    textColor: 'text-sky-700 dark:text-sky-300',
    accentColor: '#0ea5e9',
    description: 'Tidak ada kendala berarti, suasana hati dan kedisiplinan relatif konsisten.',
    level: 2,
  },
  'Belum Ada Kemajuan': {
    id: 'Belum Ada Kemajuan',
    label: 'Belum Ada Kemajuan',
    emoji: '⏳',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    bgLight: 'bg-amber-50/70',
    bgDark: 'dark:bg-amber-950/20',
    borderColor: 'border-amber-300 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    accentColor: '#f59e0b',
    description: 'Sudah dilakukan beberapa sesi pendampingan namun 3 catatan berturut-turut belum menunjukkan respons positif.',
    level: 3,
  },
  'Perlu Bimbingan': {
    id: 'Perlu Bimbingan',
    label: 'Perlu Bimbingan',
    emoji: '🧭',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    bgLight: 'bg-orange-50/70',
    bgDark: 'dark:bg-orange-950/20',
    borderColor: 'border-orange-300 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
    accentColor: '#f97316',
    description: 'Menghadapi tantangan sosial, emosional, atau motivasi yang membutuhkan konseling terjadwal.',
    level: 4,
  },
  'Perlu Intervensi Segera': {
    id: 'Perlu Intervensi Segera',
    label: 'Perlu Intervensi Segera',
    emoji: '🚨',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    bgLight: 'bg-rose-50/70',
    bgDark: 'dark:bg-rose-950/20',
    borderColor: 'border-rose-300 dark:border-rose-800',
    textColor: 'text-rose-700 dark:text-rose-300',
    accentColor: '#ef4444',
    description: 'Kondisi memburuk, berisiko tinggi (krisis emosional, ancaman keselamatan), memerlukan rujukan atau panggilan orang tua segera.',
    level: 5,
  },
};

export const ALL_STUDENT_GROUPS: StudentGroup[] = [
  'Berkembang Baik',
  'Stabil',
  'Belum Ada Kemajuan',
  'Perlu Bimbingan',
  'Perlu Intervensi Segera',
];

/**
 * Aturan Otomatis Penentuan Kelompok Siswa:
 * 1. Skor 5 & tren Meningkat -> Berkembang Baik
 * 2. Skor 4 -> Stabil atau Berkembang Baik jika tren Meningkat
 * 3. Skor 3 -> Stabil jika konsisten, atau Perlu Bimbingan jika ada catatan khusus
 * 4. Skor <= 2 -> Perlu Bimbingan atau Perlu Intervensi Segera
 * 5. Jika tren menurun 2 kali berturut-turut -> Naik 1 tingkat keparahan
 * 6. Jika 3 catatan berturut-turut tren "Belum Ada Kemajuan" atau "Stabil" pada skor rendah -> Belum Ada Kemajuan
 */
export function calculateStudentGroup(
  newEntry: {
    skor_kondisi: number;
    tren: TrendType;
    uraian?: string;
  },
  recentEntries: JournalEntry[] = []
): { suggestedGroup: StudentGroup; reason: string } {
  const currentScore = newEntry.skor_kondisi;
  const currentTrend = newEntry.tren;

  // Analisis 3-5 catatan terakhir
  const prev1 = recentEntries[0];
  const prev2 = recentEntries[1];
  const prev3 = recentEntries[2];

  // Aturan Kritis: Skor 1 atau kata kunci darurat
  if (currentScore === 1) {
    return {
      suggestedGroup: 'Perlu Intervensi Segera',
      reason: 'Skor kondisi 1/5 menandakan tekanan psikologis/perilaku berat yang membutuhkan pendampingan darurat.',
    };
  }

  // Aturan 2 Kali Tren Menurun Berturut-turut
  const isDoubleDown = 
    currentTrend === 'Menurun' && 
    prev1 && 
    prev1.tren === 'Menurun';

  if (isDoubleDown) {
    if (currentScore <= 2) {
      return {
        suggestedGroup: 'Perlu Intervensi Segera',
        reason: 'Tren perkembangan menurun 2 sesi berturut-turut dengan skor rendah, otomatis ditingkatkan ke status Intervensi Segera.',
      };
    } else {
      return {
        suggestedGroup: 'Perlu Bimbingan',
        reason: 'Tren perkembangan tercatat menurun 2 kali berturut-turut sehingga membutuhkan pemantauan lebih intensif.',
      };
    }
  }

  // Aturan 3 Kali Tanpa Kemajuan
  const isThreeNoProgress = 
    (currentTrend === 'Belum Ada Kemajuan' || currentTrend === 'Stabil') &&
    prev1 && (prev1.tren === 'Belum Ada Kemajuan' || prev1.tren === 'Stabil') &&
    prev2 && (prev2.tren === 'Belum Ada Kemajuan' || prev2.tren === 'Stabil') &&
    currentScore <= 3;

  if (isThreeNoProgress) {
    return {
      suggestedGroup: 'Belum Ada Kemajuan',
      reason: 'Siswa telah didampingi minimal 3 sesi namun kondisi terpantau stagnan tanpa progres yang terukur.',
    };
  }

  // Evaluasi Normal Berdasarkan Skor & Tren
  if (currentScore === 5) {
    return {
      suggestedGroup: 'Berkembang Baik',
      reason: 'Kondisi siswa sangat prima dengan skor 5/5.',
    };
  }

  if (currentScore === 4) {
    if (currentTrend === 'Meningkat') {
      return {
        suggestedGroup: 'Berkembang Baik',
        reason: 'Skor siswa positif (4/5) dengan tren peningkatan yang berkelanjutan.',
      };
    }
    return {
      suggestedGroup: 'Stabil',
      reason: 'Skor siswa baik dan stabil pada tingkat 4/5.',
    };
  }

  if (currentScore === 3) {
    if (currentTrend === 'Menurun') {
      return {
        suggestedGroup: 'Perlu Bimbingan',
        reason: 'Skor berada di batas tengah (3/5) dan tren mengarah menurun.',
      };
    }
    return {
      suggestedGroup: 'Stabil',
      reason: 'Kondisi berada pada tingkat tengah (3/5) dan relatif stabil.',
    };
  }

  if (currentScore === 2) {
    if (currentTrend === 'Meningkat') {
      return {
        suggestedGroup: 'Perlu Bimbingan',
        reason: 'Mulai menunjukkan pemulihan namun masih berada di rentang yang perlu bimbingan (skor 2/5).',
      };
    }
    return {
      suggestedGroup: 'Perlu Intervensi Segera',
      reason: 'Skor kondisi rendah (2/5) tanpa adanya perbaikan tren.',
    };
  }

  return {
    suggestedGroup: 'Stabil',
    reason: 'Berdasarkan evaluasi umum kondisi siswa.',
  };
}

/**
 * Cek apakah siswa berisiko belum diobservasi dalam 14 hari
 */
export function checkStudentNeedsVisit(student: Student, latestJournalDate?: string): boolean {
  if (
    student.kelompok_terkini !== 'Perlu Bimbingan' &&
    student.kelompok_terkini !== 'Perlu Intervensi Segera' &&
    student.kelompok_terkini !== 'Belum Ada Kemajuan'
  ) {
    return false;
  }

  if (!latestJournalDate) return true;

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  return new Date(latestJournalDate) < fourteenDaysAgo;
}
