# 📘 Aplikasi Web Jurnal Harian Guru BK (Bimbingan dan Konseling)

Aplikasi web modern, responsif, dan komprehensif yang dirancang khusus untuk Guru Bimbingan dan Konseling (BK) di lingkungan sekolah/madrasah. Memungkinkan pencatatan perkembangan siswa dari hari ke hari dengan cepat (< 1 menit per catatan), visualisasi tren perkembangan, pengingat jadwal tindak lanjut, serta rekapitulasi laporan resmi siap cetak ke format PDF dan Excel.

---

## 🌟 Fitur Utama

1. **Dashboard Analitik Terpadu**
   - Ringkasan metrik harian: Total siswa, status Baik (hijau), Perlu Perhatian (kuning), dan Perlu Intervensi (merah).
   - Diagram Donat (*Recharts*) distribusi kategori kesehatan mental & perilaku siswa.
   - Kartu peringatan darurat: Siswa yang perlu segera ditindaklanjuti dan siswa yang belum dicatat observasinya dalam 14 hari terakhir.
   - Tombol cepat *Catat Jurnal Baru* yang dapat diakses kapan saja.

2. **Pencatatan Jurnal Cepat (< 1 Menit)**
   - Modal pencatatan instan dengan pencarian autocomplete nama/NIS siswa.
   - **Jenis Kegiatan**: Konseling Individu, Konseling Kelompok, Observasi Kelas, Kunjungan Rumah, Panggilan Orang Tua, Lainnya.
   - **Aspek Terpantau (Multi-Pilih)**: Akademik, Sosial, Emosional, Perilaku/Kedisiplinan, Karier, Kehadiran.
   - Evaluasi tren: Meningkat, Stabil, Menurun.
   - Kategori status siswa: Baik (Hijau), Perlu Perhatian (Kuning), Perlu Intervensi (Merah).
   - Rencana & target tanggal tindak lanjut.
   - Penanda **"Rahasia"** untuk catatan yang bersifat sensitif/konfidensial.
   - Unggah lampiran foto/dokumen pendukung.

3. **Manajemen Data Siswa**
   - Tambah, ubah, dan hapus data siswa.
   - Tampilan ganda: Kartu Grid (*Card View*) atau Tabel (*Table View*).
   - Filter cepat berdasarkan kelas, status kategori, dan jenis kelamin.
   - **Impor Massal**: Upload file CSV/Excel dengan template yang sudah disediakan.
   - **Ekspor Data Siswa**: Unduh seluruh daftar siswa terfilter ke file Excel (.xlsx).

4. **Profil Siswa & Riwayat Perkembangan Komprehensif**
   - Biodata lengkap, kontak orang tua/wali, dan catatan khusus.
   - **Grafik Tren Garis (*Line Chart Recharts*)**: Visualisasi riwayat perkembangan skor siswa dari waktu ke waktu.
   - **Garis Waktu (*Timeline*) Sesi Konseling**: Urutan riwayat konseling dari yang terbaru ke terlama, filterable berdasarkan aspek dan jenis kegiatan.

5. **Pengingat Tindak Lanjut & Agenda Konseling**
   - Tab navigasi otomatis:
     - 🚨 **Jatuh Tempo (Terlambat)**: Notifikasi merah dengan hitungan hari keterlambatan.
     - ⏰ **Hari Ini**: Agenda konseling yang jatuh tempo hari ini.
     - 📅 **Mendatang**: Jadwal tindak lanjut terjadwal dalam 7 hari ke depan.
     - ✅ **Selesai**: Kasus yang telah tuntas ditindaklanjuti.
   - Aksi 1-klik: Tandai selesai, ubah jadwal (*reschedule*), atau hubungi orang tua melalui WhatsApp.

6. **Laporan & Rekapitulasi Resmi**
   - **Tab 1: Rekapitulasi Per Kelas**: Tabel statistik seluruh rombel (jumlah siswa, perbandingan status, sesi konseling, dan masalah dominan).
   - **Tab 2: Laporan Per Siswa**: Pembuatan Kartu Konseling Individual untuk arsip siswa atau lampiran rapat dewan guru.
   - **Tab 3: Rekap Detail Jurnal Kasus**: Filter komprehensif rentang tanggal, aspek, kelas, dan kategori.
   - **Ekspor Excel (.xlsx)** dan **Cetak PDF Resmi** lengkap dengan Kop Surat Sekolah dan kolom tanda tangan Guru BK.

7. **Privasi, Keamanan & Log Audit**
   - Isolasi data catatan bertanda "Rahasia" khusus bagi guru pembuatnya.
   - Tabel **Log Audit**: Merekam stempel waktu, nama pengguna, aksi (LOGIN, CREATE, UPDATE, DELETE, VIEW_SECRET, EXPORT), dan rincian aktivitas.
   - Disediakan skema SQL *Row Level Security* (RLS) untuk database PostgreSQL Supabase.

8. **Pengaturan & Simulasi Multi-Akun**
   - Penggantian akun demo 1-klik (Guru BK Kelas X & XI, Guru BK Kelas XII, Administrator BK) untuk menguji batasan hak akses.
   - Fitur *Backup Basis Data ke JSON* dan *Reset ke Data Awal Contoh*.
   - Panduan integrasi cloud Supabase.
   - Pengaturan mode gelap (*Dark Mode*) untuk kenyamanan mata.

---

## 🛠️ Arsitektur & Teknologi

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan palet warna Teal & Emerald yang menenangkan
- **Grafik & Visualisasi**: [Recharts](https://recharts.org/) (Pie/Donut Chart & Line Chart)
- **Ikonografi**: [Lucide React](https://lucide.dev/)
- **Ekspor Spreadsheet**: [SheetJS (xlsx)](https://docs.sheetjs.com/)
- **Database & Backend Ready**: [Supabase](https://supabase.com/) (PostgreSQL dengan RLS, Triggers, & Indexes)

---

## 📁 Struktur Direktori

```
jurnal-guru-bk/
├── app/
│   ├── (auth)/
│   │   └── login/             # Halaman Login Pengguna & Quick Demo Accounts
│   ├── audit-log/             # Halaman Riwayat Audit & Keamanan
│   ├── jurnal/                # Halaman Jurnal Harian & Filter Catatan
│   ├── laporan/               # Halaman Rekapitulasi Per Kelas, Siswa, & Ekspor
│   ├── pengaturan/            # Halaman Pengaturan Akun, Switcher, & Backup
│   ├── siswa/
│   │   ├── [id]/              # Halaman Profil Siswa, Grafik Tren & Timeline
│   │   └── page.tsx           # Halaman Master Data Siswa & Impor/Ekspor
│   ├── globals.css            # Desain Sistem & Gaya Cetak (Print CSS)
│   ├── layout.tsx             # Root Layout dengan AppProvider & AppShell
│   └── page.tsx               # Dashboard Utama & Widget Pemantauan
├── components/
│   ├── charts/
│   │   ├── CategoryDonutChart.tsx  # Diagram Distribusi Status Kategori
│   │   └── StudentTrendChart.tsx   # Diagram Garis Tren Perkembangan Siswa
│   ├── AppShell.tsx           # Layout Shell (Navbar, Sidebar, Floating CTA)
│   ├── ExportReportModal.tsx  # Modal Pratinjau Cetak PDF Resmi & Kop Surat
│   ├── ImportStudentModal.tsx # Modal Impor Data Siswa dari File CSV/Excel
│   ├── MobileNav.tsx          # Navigasi Bawah Khusus Smartphone
│   ├── Navbar.tsx             # Header Navigasi, Notifikasi & Mode Gelap
│   ├── QuickJournalModal.tsx  # Form Pencatatan Jurnal Cepat (< 1 Menit)
│   ├── Sidebar.tsx            # Menu Navigasi Desktop & Info Rombel
│   └── StudentFormModal.tsx   # Modal Tambah & Ubah Data Siswa
├── lib/
│   ├── seed-data.ts           # Data Awal Demo (10 Siswa, Jurnal, Akun Guru)
│   ├── store.tsx              # State Management Global (Context + LocalStorage)
│   ├── supabase.ts            # Client Konfigurasi Supabase
│   ├── types.ts               # Definisi Tipe TypeScript
│   └── utils.ts               # Fungsi Helper Tanggal & Konfigurasi Badge
└── supabase/
    ├── schema.sql             # Skema Basis Data PostgreSQL, RLS & Trigger
    └── seed.sql               # Script Seed Data SQL
```

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Prasyarat
Pastikan komputer Anda sudah terpasang:
- **Node.js** (versi 18.17 atau lebih baru)
- **npm** atau **bun** / **yarn**

### 2. Pemasangan & Menjalankan Server
Buka terminal pada direktori `jurnal-guru-bk`:

```bash
# 1. Masuk ke folder proyek
cd "c:\Users\USER\Documents\TTC MAN 1 MAJENE\BiovillaTerbaru\remix-biovillage-simulator\jurnal-guru-bk"

# 2. Pasang dependensi (jika belum terpasang)
npm install

# 3. Jalankan development server
npm run dev
```

Buka peramban (*browser*) Anda di alamat:
👉 **[http://localhost:3000](http://localhost:3000)**

### 3. Akun Demo untuk Pengujian Langsung
Aplikasi sudah dilengkapi dengan simulasi autentikasi dan data awal (10 siswa & berbagai catatan jurnal) sehingga dapat langsung dicoba tanpa konfigurasi database tambahan:

| Peran | Nama | Email | Kata Sandi | Akses Kelas |
|---|---|---|---|---|
| **Guru BK Utama** | SANTARI HASAN, S.Pd | `santari@sekolah.sch.id` | `password123` | Kelas X-A, X-B, XI-MIPA 1 |
| **Guru BK Kelas XII** | Hendra Gunawan, S.Psi. | `hendra@sekolah.sch.id` | `password123` | Kelas XII-MIPA 1, XII-IPS 1 |
| **Admin BK** | Administrator Sistem BK | `admin.bk@sekolah.sch.id` | `password123` | Seluruh Kelas |

*(Anda juga dapat beralih akun secara instan melalui menu **Pengaturan** atau tombol demo pada halaman Login)*.

---

## 🗄️ Menghubungkan ke Cloud Supabase (Opsional)

Jika ingin menghubungkan langsung ke layanan cloud Supabase:
1. Buat proyek baru di [Supabase Console](https://supabase.com).
2. Buka menu **SQL Editor**, salin dan jalankan seluruh isi file [supabase/schema.sql](file:///c:/Users/USER/Documents/TTC%20MAN%201%20MAJENE/BiovillaTerbaru/remix-biovillage-simulator/jurnal-guru-bk/supabase/schema.sql).
3. Jalankan [supabase/seed.sql](file:///c:/Users/USER/Documents/TTC%20MAN%201%20MAJENE/BiovillaTerbaru/remix-biovillage-simulator/jurnal-guru-bk/supabase/seed.sql) untuk mengisi data awal.
4. Buat file `.env.local` pada folder `jurnal-guru-bk`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://nama-proyek-anda.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=kunci-anon-anda
   ```
5. Restart server pengembangan (`npm run dev`).
