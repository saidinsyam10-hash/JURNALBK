export type UserRole = 'guru_bk' | 'admin';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  nip?: string;
  kelas_bimbingan: string[]; // Contoh: ['X-A', 'X-B', 'XI-MIPA 1']
  avatar?: string;
}

export type Gender = 'L' | 'P';

// 5 Kelompok Utama Siswa Sesuai Petunjuk BK Harian
export type StudentGroup = 
  | 'Berkembang Baik'        // 🌟 Hijau
  | 'Stabil'                 // 🙂 Biru
  | 'Belum Ada Kemajuan'     // ⏳ Kuning
  | 'Perlu Bimbingan'        // 🧭 Oranye
  | 'Perlu Intervensi Segera'; // 🚨 Merah

// Backward compatibility alias for StudentStatus
export type StudentStatus = StudentGroup;

export interface Student {
  id: string;
  nis: string;
  nisn?: string;
  nama: string;
  kelas: string;
  jenis_kelamin: Gender;
  tanggal_lahir?: string;
  kontak_ortu: string;
  nama_ortu?: string;
  alamat?: string;
  catatan_khusus?: string;
  kelompok_terkini: StudentGroup;
  status_terkini?: StudentGroup; // Alias
  skor_terkini?: number; // 1 - 5
  foto?: string;
  guru_pembimbing_id?: string;
  is_needs_visit?: boolean; // True jika > 14 hari tidak dicatat & kelompok rawan
  created_at: string;
  updated_at: string;
}

export type ActivityType =
  | 'Konseling Individu'
  | 'Konseling Kelompok'
  | 'Observasi Kelas'
  | 'Kunjungan Rumah'
  | 'Panggilan Orang Tua'
  | 'Lainnya';

export type AspectType =
  | 'Akademik'
  | 'Sosial'
  | 'Emosional'
  | 'Perilaku'
  | 'Perilaku/Kedisiplinan'
  | 'Karier'
  | 'Kehadiran';

export type TrendType = 'Meningkat' | 'Stabil' | 'Menurun' | 'Belum Ada Kemajuan';

export type FollowUpStatus = 'Menunggu' | 'Selesai' | 'Jatuh Tempo';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface AISuggestion {
  id: string;
  journal_entry_id?: string;
  student_id: string;
  ringkasan_kondisi: string;
  ringkasan?: string;
  saran_json?: any;
  faktor_penyebab: string[];
  tindak_lanjut_pendek: string[];
  tindak_lanjut_menengah: string[];
  teknik_pendekatan_bk: string[];
  tanda_bahaya_rujukan: string;
  rekomendasi_kelompok: StudentGroup;
  alasan_kelompok: string;
  dipakai: boolean;
  created_at: string;
}

export interface GroupHistory {
  id: string;
  student_id: string;
  dari_kelompok: StudentGroup;
  ke_kelompok: StudentGroup;
  alasan: string;
  otomatis_atau_manual: 'otomatis' | 'manual';
  created_at: string;
}

export interface JournalEntry {
  id: string;
  student_id: string;
  user_id: string;
  guru_nama?: string;
  tanggal: string; // YYYY-MM-DD
  jenis_kegiatan: ActivityType;
  aspek: AspectType[];
  uraian: string;
  skor_kondisi: number; // 1 - 5
  tren: TrendType;
  kelompok: StudentGroup;
  kategori?: StudentGroup; // Alias untuk kompatibilitas
  tindak_lanjut: string;
  tanggal_tindak_lanjut?: string; // YYYY-MM-DD
  status_tindak_lanjut: FollowUpStatus;
  is_rahasia: boolean;
  ai_suggestion_used?: boolean;
  saran_ai_terpakai?: boolean;
  ai_suggestion_content?: AISuggestion;
  lampiran?: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_nama: string;
  aksi: 'LOGIN' | 'VIEW_DETAIL' | 'VIEW_SECRET' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'AI_SUGGESTION' | 'GROUP_CHANGE';
  entitas: 'student' | 'journal' | 'auth' | 'system' | 'ai' | 'group';
  entitas_id?: string;
  detail: string;
  created_at: string;
}

export interface FilterOptions {
  searchQuery?: string;
  kelas?: string;
  kelompok?: StudentGroup | 'Semua';
  kategori?: StudentGroup | 'Semua';
  aspek?: AspectType | 'Semua';
  jenis_kegiatan?: ActivityType | 'Semua';
  startDate?: string;
  endDate?: string;
}
