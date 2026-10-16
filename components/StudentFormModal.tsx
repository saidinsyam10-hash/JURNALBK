'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Check, UserPlus, AlertCircle } from 'lucide-react';
import { Student, Gender, StudentGroup } from '@/lib/types';
import { ALL_STUDENT_GROUPS, STUDENT_GROUPS_CONFIG } from '@/lib/grouping-rules';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Student | null;
}

const DEFAULT_CLASSES = [
  'X-A',
  'X-B',
  'X-C',
  'XI-MIPA 1',
  'XI-MIPA 2',
  'XI-IPS 1',
  'XI-IPS 2',
  'XII-MIPA 1',
  'XII-MIPA 2',
  'XII-IPS 1',
  'XII-IPS 2',
];

export function StudentFormModal({ isOpen, onClose, initialData }: StudentFormModalProps) {
  const { addStudent, updateStudent } = useAppStore();

  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState(DEFAULT_CLASSES[0]);
  const [jenisKelamin, setJenisKelamin] = useState<Gender>('L');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [kontakOrtu, setKontakOrtu] = useState('');
  const [namaOrtu, setNamaOrtu] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatanKhusus, setCatatanKhusus] = useState('');
  const [statusTerkini, setStatusTerkini] = useState<StudentGroup>('Stabil');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setNis(initialData.nis || '');
      setNisn(initialData.nisn || '');
      setNama(initialData.nama || '');
      setKelas(initialData.kelas || DEFAULT_CLASSES[0]);
      setJenisKelamin(initialData.jenis_kelamin || 'L');
      setTanggalLahir(initialData.tanggal_lahir || '');
      setKontakOrtu(initialData.kontak_ortu || '');
      setNamaOrtu(initialData.nama_ortu || '');
      setAlamat(initialData.alamat || '');
      setCatatanKhusus(initialData.catatan_khusus || '');
      setStatusTerkini(initialData.kelompok_terkini || (initialData.status_terkini as StudentGroup) || 'Stabil');
    } else {
      setNis('');
      setNisn('');
      setNama('');
      setKelas(DEFAULT_CLASSES[0]);
      setJenisKelamin('L');
      setTanggalLahir('');
      setKontakOrtu('');
      setNamaOrtu('');
      setAlamat('');
      setCatatanKhusus('');
      setStatusTerkini('Stabil');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!nis.trim()) newErrors.nis = 'NIS wajib diisi';
    if (!nama.trim()) newErrors.nama = 'Nama lengkap siswa wajib diisi';
    if (!kontakOrtu.trim()) newErrors.kontakOrtu = 'Kontak orang tua / wali wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (initialData) {
      updateStudent(initialData.id, {
        nis: nis.trim(),
        nisn: nisn.trim() || undefined,
        nama: nama.trim(),
        kelas,
        jenis_kelamin: jenisKelamin,
        tanggal_lahir: tanggalLahir || undefined,
        kontak_ortu: kontakOrtu.trim(),
        nama_ortu: namaOrtu.trim() || undefined,
        alamat: alamat.trim() || undefined,
        catatan_khusus: catatanKhusus.trim() || undefined,
        kelompok_terkini: statusTerkini,
        status_terkini: statusTerkini,
      });
    } else {
      addStudent({
        nis: nis.trim(),
        nisn: nisn.trim() || undefined,
        nama: nama.trim(),
        kelas,
        jenis_kelamin: jenisKelamin,
        tanggal_lahir: tanggalLahir || undefined,
        kontak_ortu: kontakOrtu.trim(),
        nama_ortu: namaOrtu.trim() || undefined,
        alamat: alamat.trim() || undefined,
        catatan_khusus: catatanKhusus.trim() || undefined,
        kelompok_terkini: statusTerkini,
        status_terkini: statusTerkini,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold">
              {initialData ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* NIS */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIS (Nomor Induk Siswa) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 23241011"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.nis ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.nis && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.nis}</p>
              )}
            </div>

            {/* NISN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NISN (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 0071239999"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap siswa..."
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.nama ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.nama && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.nama}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Kelas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kelas
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {DEFAULT_CLASSES.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Kelamin
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setJenisKelamin('L')}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                    jenisKelamin === 'L'
                      ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold dark:bg-teal-950 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Laki-Laki (L)
                </button>
                <button
                  type="button"
                  onClick={() => setJenisKelamin('P')}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                    jenisKelamin === 'P'
                      ? 'bg-pink-50 border-pink-500 text-pink-700 font-bold dark:bg-pink-950 dark:text-pink-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Perempuan (P)
                </button>
              </div>
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nama Ortu */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Orang Tua / Wali
              </label>
              <input
                type="text"
                placeholder="Nama ayah / ibu / wali..."
                value={namaOrtu}
                onChange={(e) => setNamaOrtu(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Kontak Ortu */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kontak HP/WhatsApp Orang Tua <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="081234567890"
                value={kontakOrtu}
                onChange={(e) => setKontakOrtu(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.kontakOrtu ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.kontakOrtu && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.kontakOrtu}</p>
              )}
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Tinggal
            </label>
            <input
              type="text"
              placeholder="Alamat rumah atau lingkungan tempat tinggal..."
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Catatan Khusus */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Khusus Bimbingan
            </label>
            <textarea
              rows={2}
              placeholder="Catatan latar belakang, potensi bakat, kondisi keluarga, dll..."
              value={catatanKhusus}
              onChange={(e) => setCatatanKhusus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Awal Siswa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kelompok Kondisi Siswa
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_STUDENT_GROUPS.map((g) => {
                const cfg = STUDENT_GROUPS_CONFIG[g];
                const isSelected = statusTerkini === g;
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setStatusTerkini(g)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm leading-none">{cfg.emoji}</span>
                    <span className="truncate">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
