-- ==============================================================================
-- SEED DATA CONTOH: 10 SISWA DAN JURNAL AWAL
-- Jalankan di SQL Editor Supabase setelah schema.sql
-- ==============================================================================

-- 1. SEED DATA SISWA (students)
INSERT INTO public.students (id, nis, nisn, nama, kelas, jenis_kelamin, tanggal_lahir, kontak_ortu, nama_ortu, alamat, catatan_khusus, status_terkini)
VALUES
  ('a1111111-1111-1111-1111-111111111101', '23241001', '0071234561', 'Muhammad Fadhil Pratama', 'X-A', 'L', '2008-04-12', '081234567890 (H. Pratama)', 'H. Pratama', 'Jl. Pemuda No. 14, Majene', 'Ketua kelas, aktif organisasi OSIS, potensi akademik tinggi', 'Baik'),
  ('a1111111-1111-1111-1111-111111111102', '23241002', '0071234562', 'Siti Nurhaliza Azzahra', 'X-A', 'P', '2008-08-20', '081398765432 (Ibu Maryam)', 'Maryam', 'Lingkungan Lutang, Majene', 'Sering murung di kelas 2 minggu terakhir, nilai ulangan harian menurun drastis', 'Perlu Perhatian'),
  ('a1111111-1111-1111-1111-111111111103', '23241003', '0071234563', 'Andi Ahmad Rizky', 'X-B', 'L', '2008-01-15', '082155667788 (Drs. Syahrir)', 'Syahrir', 'Jl. Jendral Sudirman No. 45', 'Sudah 4 hari tidak masuk tanpa surat keterangan sakit. Diduga terlibat konflik pertemanan di luar sekolah.', 'Perlu Intervensi'),
  ('a1111111-1111-1111-1111-111111111104', '23241004', '0071234564', 'Putri Aulia Rahmadani', 'X-B', 'P', '2008-11-03', '085244332211 (Ibu Salma)', 'Salma', 'Kompleks Guru No. 8', 'Minat tinggi di bidang seni rupa dan desain grafis, perlu arahan penjurusan', 'Baik'),
  ('a1111111-1111-1111-1111-111111111105', '22231015', '0069876543', 'Kevin Wijaya Saputra', 'XI-MIPA 1', 'L', '2007-06-18', '081199887766 (Bpk. Hendra)', 'Hendra Saputra', 'Jl. Poros Majene-Mamuju Km 4', 'Sering terlambat masuk sekolah (>3x seminggu), mengantuk pada jam pelajaran pertama', 'Perlu Perhatian'),
  ('a1111111-1111-1111-1111-111111111106', '22231016', '0069876544', 'Annisa Fitriani', 'XI-MIPA 1', 'P', '2007-09-09', '081277665544 (Bpk. Lukman)', 'Lukman Hakim', 'Lembang, Banggae Timur', 'Peserta Olimpiade Sains Biologi, motivasi belajar konsisten', 'Baik'),
  ('a1111111-1111-1111-1111-111111111107', '22231020', '0069876545', 'Dimas Arya Yudhistira', 'XI-IPS 2', 'L', '2007-03-25', '085311223344 (Ibu Kartini)', 'Kartini', 'Pasilambung, Majene', 'Terdapat laporan perundungan verbal dari teman sekelas, menarik diri dari pergaulan', 'Perlu Intervensi'),
  ('a1111111-1111-1111-1111-111111111108', '22231021', '0069876546', 'Dewi Sartika Wulandari', 'XI-IPS 2', 'P', '2007-12-14', '081344556677 (Bpk. Mansyur)', 'Mansyur', 'Jl. AP Pettarani No. 22', 'Menunjukkan peningkatan signifikan setelah bimbingan kelompok belajar', 'Baik'),
  ('a1111111-1111-1111-1111-111111111109', '21221005', '0058765432', 'Farhan Maulana', 'XII-MIPA 1', 'L', '2006-05-30', '082266778899 (Ibu Rahmi)', 'Rahmi', 'Totoli, Banggae', 'Cemas menghadapi UTBK SNBT dan bingung memilih antara kedokteran atau teknik', 'Perlu Perhatian'),
  ('a1111111-1111-1111-1111-111111111110', '21221008', '0058765433', 'Nabila Syakira', 'XII-MIPA 1', 'P', '2006-02-17', '081299001122 (Bpk. Irwan)', 'Irwan', 'Kp. Baru Majene', 'Siap mendaftar beasiswa perguruan tinggi negeri, berkas portofolio sudah lengkap', 'Baik')
ON CONFLICT (nis) DO NOTHING;
