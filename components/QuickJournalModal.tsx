'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { 
  X, 
  Search, 
  Check, 
  Lock, 
  Paperclip, 
  Calendar, 
  Sparkles, 
  Mic, 
  MicOff, 
  AlertCircle, 
  ArrowRight, 
  BrainCircuit, 
  HelpCircle,
  TrendingUp,
  Minus,
  TrendingDown,
  Clock
} from 'lucide-react';
import { 
  ActivityType, 
  AspectType, 
  TrendType, 
  StudentGroup, 
  Attachment, 
  JournalEntry,
  AISuggestion 
} from '@/lib/types';
import { MascotBiko } from './MascotBiko';
import { AISuggestionModal } from './AISuggestionModal';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { calculateStudentGroup } from '@/lib/grouping-rules';
import { getStatusBadgeConfig, getScoreFace } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

interface QuickJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: string;
  editJournal?: JournalEntry | null;
  initialData?: JournalEntry | null;
}

const ACTIVITIES: ActivityType[] = [
  'Konseling Individu',
  'Konseling Kelompok',
  'Observasi Kelas',
  'Kunjungan Rumah',
  'Panggilan Orang Tua',
  'Lainnya',
];

const ASPECTS: AspectType[] = [
  'Akademik',
  'Sosial',
  'Emosional',
  'Perilaku',
  'Karier',
  'Kehadiran',
];

const TRENDS: TrendType[] = [
  'Meningkat',
  'Stabil',
  'Belum Ada Kemajuan',
  'Menurun',
];

const GROUPS: StudentGroup[] = [
  'Berkembang Baik',
  'Stabil',
  'Belum Ada Kemajuan',
  'Perlu Bimbingan',
  'Perlu Intervensi Segera',
];

export function QuickJournalModal({ isOpen, onClose, preselectedStudentId, editJournal, initialData }: QuickJournalModalProps) {
  const activeJournal = editJournal || initialData;
  const { students, addJournal, updateJournal, currentUser, journals } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jenisKegiatan, setJenisKegiatan] = useState<ActivityType>('Konseling Individu');
  const [selectedAspek, setSelectedAspek] = useState<AspectType[]>(['Emosional']);
  const [uraian, setUraian] = useState('');
  const [skorKondisi, setSkorKondisi] = useState<number>(3);
  const [tren, setTren] = useState<TrendType>('Stabil');
  const [kelompok, setKelompok] = useState<StudentGroup>('Stabil');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [tanggalTindakLanjut, setTanggalTindakLanjut] = useState('');
  const [isRahasia, setIsRahasia] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Voice Input (Web Speech API)
  const [isListening, setIsListening] = useState(false);

  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [lastAISuggestion, setLastAISuggestion] = useState<AISuggestion | null>(null);

  // Success Toast Animation
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [savedJournalForWA, setSavedJournalForWA] = useState<JournalEntry | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync edit or preselected data
  useEffect(() => {
    if (activeJournal) {
      setSelectedStudentId(activeJournal.student_id);
      const std = students.find((s) => s.id === activeJournal.student_id);
      if (std) {
        setSearchQuery(`${std.nama} (${std.kelas})`);
      }
      setTanggal(activeJournal.tanggal);
      setJenisKegiatan(activeJournal.jenis_kegiatan);
      setSelectedAspek(activeJournal.aspek);
      setUraian(activeJournal.uraian);
      setSkorKondisi(activeJournal.skor_kondisi || 3);
      setTren(activeJournal.tren);
      setKelompok(activeJournal.kelompok || 'Stabil');
      setTindakLanjut(activeJournal.tindak_lanjut || '');
      setTanggalTindakLanjut(activeJournal.tanggal_tindak_lanjut || '');
      setIsRahasia(activeJournal.is_rahasia);
      setAttachments(activeJournal.lampiran || []);
      setLastAISuggestion(activeJournal.ai_suggestion_content || null);
    } else if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
      const std = students.find((s) => s.id === preselectedStudentId);
      if (std) {
        setSearchQuery(`${std.nama} (${std.kelas})`);
        setKelompok(std.kelompok_terkini || 'Stabil');
        setSkorKondisi(std.skor_terkini || 3);
      }
      setTanggal(new Date().toISOString().split('T')[0]);
      setJenisKegiatan('Konseling Individu');
      setSelectedAspek(['Emosional']);
      setUraian('');
      setTren('Stabil');
      setTindakLanjut('');
      setTanggalTindakLanjut('');
      setIsRahasia(false);
      setAttachments([]);
      setLastAISuggestion(null);
    } else {
      setSelectedStudentId('');
      setSearchQuery('');
      setTanggal(new Date().toISOString().split('T')[0]);
      setJenisKegiatan('Konseling Individu');
      setSelectedAspek(['Emosional']);
      setUraian('');
      setSkorKondisi(3);
      setTren('Stabil');
      setKelompok('Stabil');
      setTindakLanjut('');
      setTanggalTindakLanjut('');
      setIsRahasia(false);
      setAttachments([]);
      setLastAISuggestion(null);
    }
    setErrors({});
  }, [editJournal, preselectedStudentId, students, isOpen]);

  // Click outside listener for student dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStudentDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update auto-group suggestion when score, trend, or student changes
  useEffect(() => {
    if (!editJournal && selectedStudentId) {
      const studentHistory = journals.filter((j) => j.student_id === selectedStudentId);
      const evalResult = calculateStudentGroup({
        skor_kondisi: skorKondisi,
        tren,
        uraian,
      }, studentHistory);

      setKelompok(evalResult.suggestedGroup);
    }
  }, [skorKondisi, tren, selectedStudentId, editJournal]);

  if (!isOpen) return null;

  // Filter students based on search query
  const filteredStudents = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.kelas.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students.slice(0, 5);

  const handleSelectStudent = (student: typeof students[0]) => {
    setSelectedStudentId(student.id);
    setSearchQuery(`${student.nama} (${student.kelas})`);
    setKelompok(student.kelompok_terkini || 'Stabil');
    setShowStudentDropdown(false);
    if (errors.student) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.student;
        return next;
      });
    }
  };

  const toggleAspek = (aspek: AspectType) => {
    if (selectedAspek.includes(aspek)) {
      if (selectedAspek.length === 1) return;
      setSelectedAspek(selectedAspek.filter((a) => a !== aspek));
    } else {
      setSelectedAspek([...selectedAspek, aspek]);
    }
  };

  // Web Speech API Voice Recognition
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Fitur input suara belum didukung di browser ini. Silakan gunakan Google Chrome atau Microsoft Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUraian((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsListening(false);
    }
  };

  const handleFileDummyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const newAtt: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type || 'application/octet-stream',
        size: file.size,
      };
      setAttachments([...attachments, newAtt]);
    }
  };

  const handleApplyAISuggestion = (tindakLanjutText: string, recommendedGroup?: StudentGroup, fullSug?: AISuggestion) => {
    setTindakLanjut(tindakLanjutText);
    if (recommendedGroup) {
      setKelompok(recommendedGroup);
    }
    if (fullSug) {
      setLastAISuggestion(fullSug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!selectedStudentId) {
      newErrors.student = 'Pilih salah satu siswa dari daftar pencarian!';
    }
    if (!uraian.trim()) {
      newErrors.uraian = 'Uraian kondisi hari ini wajib diisi!';
    }
    if (selectedAspek.length === 0) {
      newErrors.aspek = 'Pilih minimal satu aspek!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let resultJournal: JournalEntry;
    if (activeJournal) {
      updateJournal(activeJournal.id, {
        student_id: selectedStudentId,
        tanggal,
        jenis_kegiatan: jenisKegiatan,
        aspek: selectedAspek,
        uraian: uraian.trim(),
        skor_kondisi: skorKondisi,
        tren,
        kelompok,
        tindak_lanjut: tindakLanjut.trim() || 'Pemantauan berkala',
        tanggal_tindak_lanjut: tanggalTindakLanjut || undefined,
        is_rahasia: isRahasia,
        ai_suggestion_used: !!lastAISuggestion,
        ai_suggestion_content: lastAISuggestion || undefined,
        lampiran: attachments,
      });
      resultJournal = {
        ...activeJournal,
        student_id: selectedStudentId,
        tanggal,
        jenis_kegiatan: jenisKegiatan,
        aspek: selectedAspek,
        uraian: uraian.trim(),
        skor_kondisi: skorKondisi,
        tren,
        kelompok,
        tindak_lanjut: tindakLanjut.trim() || 'Pemantauan berkala',
        tanggal_tindak_lanjut: tanggalTindakLanjut || undefined,
        is_rahasia: isRahasia,
        ai_suggestion_used: !!lastAISuggestion,
      };
    } else {
      resultJournal = addJournal({
        student_id: selectedStudentId,
        user_id: currentUser?.id || 'guru-1',
        guru_nama: currentUser?.nama || 'SANTARI HASAN, S.Pd',
        tanggal,
        jenis_kegiatan: jenisKegiatan,
        aspek: selectedAspek,
        uraian: uraian.trim(),
        skor_kondisi: skorKondisi,
        tren,
        kelompok,
        tindak_lanjut: tindakLanjut.trim() || 'Pemantauan berkala',
        tanggal_tindak_lanjut: tanggalTindakLanjut || undefined,
        status_tindak_lanjut: 'Menunggu',
        is_rahasia: isRahasia,
        ai_suggestion_used: !!lastAISuggestion,
        ai_suggestion_content: lastAISuggestion || undefined,
        lampiran: attachments,
      });
    }

    setSavedJournalForWA(resultJournal);
    setShowSuccessToast(true);
  };

  const currentScoreFace = getScoreFace(skorKondisi);
  const currentGroupCfg = getStatusBadgeConfig(kelompok);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-950/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Success Overlay with Option to Send WhatsApp Report */}
          {showSuccessToast && (
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
              <MascotBiko expression="celebrating" size={110} />
              <h3 className="text-xl font-extrabold text-indigo-950 dark:text-indigo-100 mt-2">
                {activeJournal ? 'Catatan Berhasil Diperbarui!' : 'Catatan Jurnal Berhasil Disimpan!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Data kelompok dan riwayat observasi siswa telah diperbarui. Ingin langsung membagikan kabar ke orang tua?
              </p>

              <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessToast(false);
                    setIsWhatsAppModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Kirim Laporan ke WA Orang Tua</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessToast(false);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          )}

          {/* Modal Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MascotBiko expression="welcoming" size={40} animate={false} />
              <div>
                <h2 className="text-base font-extrabold tracking-tight">
                  {editJournal ? 'Perbarui Catatan Jurnal Siswa' : 'Catat Jurnal Cepat BK (< 1 Menit)'}
                </h2>
                <p className="text-xs text-indigo-100">
                  {editJournal ? 'Sesuaikan observasi dan tindak lanjut siswa' : 'Pencatatan perkembangan harian ringkas & berdaya AI'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            
            {/* 1. Tanggal & Siswa (Autocomplete) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Observasi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-8 relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Siswa / NIS <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ketik nama atau NIS siswa..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowStudentDropdown(true);
                    }}
                    onFocus={() => setShowStudentDropdown(true)}
                    className={`w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.student ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>

                {errors.student && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.student}</p>
                )}

                {/* Autocomplete Dropdown */}
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredStudents.map((std) => (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => handleSelectStudent(std)}
                        className="w-full px-4 py-2.5 text-left text-xs hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{std.nama}</div>
                          <div className="text-[11px] text-slate-400">
                            Kelas {std.kelas} • NIS: {std.nis}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeConfig(std.kelompok_terkini).badge}`}>
                          {std.kelompok_terkini}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* 2. Jenis Kegiatan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Jenis Layanan / Kegiatan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITIES.map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setJenisKegiatan(act)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      jenisKegiatan === act
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Aspek yang Dipantau (Multi-select) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Aspek yang Dipantau (Bisa pilih lebih dari satu) <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ASPECTS.map((asp) => {
                  const isSelected = selectedAspek.includes(asp);
                  return (
                    <button
                      key={asp}
                      type="button"
                      onClick={() => toggleAspek(asp)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      <span>{asp}</span>
                    </button>
                  );
                })}
              </div>
              {errors.aspek && <p className="text-[11px] text-rose-500 mt-1">{errors.aspek}</p>}
            </div>

            {/* 4. Skor Kondisi Siswa 1 - 5 (Interactive Slider + Facial Emojis) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>Skor Kondisi Siswa Hari Ini (1 - 5):</span>
                </label>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${currentScoreFace.bg} ${currentScoreFace.text}`}>
                  <span className="text-base leading-none">{currentScoreFace.emoji}</span>
                  <span>{currentScoreFace.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSkorKondisi(val)}
                    className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                      skorKondisi === val
                        ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-slate-100/70 dark:bg-slate-800/60 border-transparent hover:bg-slate-200/60'
                    }`}
                  >
                    <span className="text-lg leading-none">{getScoreFace(val).emoji}</span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{val}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Uraian Kondisi Hari Ini (dengan Speech-to-Text Button) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Uraian Kondisi & Observasi Hari Ini <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100'
                  }`}
                  title="Klik untuk mendikte catatan dengan suara"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Mendengarkan...' : 'Dikte Suara'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Ceritakan observasi perilaku, afeksi siswa, atau respon terhadap intervensi..."
                value={uraian}
                onChange={(e) => setUraian(e.target.value)}
                className={`w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.uraian ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.uraian && <p className="text-[11px] text-rose-500 mt-1">{errors.uraian}</p>}
            </div>

            {/* 6. Perkembangan & Kelompok Siswa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Perkembangan Dibanding Sebelumnya
                </label>
                <select
                  value={tren}
                  onChange={(e) => setTren(e.target.value as TrendType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  {TRENDS.map((t) => (
                    <option key={t} value={t}>
                      Tren: {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kelompok Siswa (Saran Sistem)
                </label>
                <select
                  value={kelompok}
                  onChange={(e) => setKelompok(e.target.value as StudentGroup)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {getStatusBadgeConfig(g).emoji} {g}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* 7. Fitur AI: Tombol Minta Saran AI */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Butuh Rekomendasi Tindak Lanjut?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Si Biko AI siap merumuskan hipotesis pemicu & langkah konkret.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAIModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>✨ Minta Saran AI</span>
              </button>
            </div>

            {/* 8. Rencana Tindak Lanjut & Tanggal Target */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rencana Tindak Lanjut
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Konseling individu teknik reframing, koordinasi ortu..."
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Tanggal
                </label>
                <input
                  type="date"
                  value={tanggalTindakLanjut}
                  onChange={(e) => setTanggalTindakLanjut(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            </div>

            {/* 9. Penanda Rahasia & Lampiran */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRahasia}
                  onChange={(e) => setIsRahasia(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                    isRahasia ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isRahasia ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Lock className={`w-3.5 h-3.5 ${isRahasia ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>Tandai sebagai Catatan Rahasia (Sensitif)</span>
                </div>
              </label>

              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer transition-colors">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                <span>{attachments.length > 0 ? `${attachments.length} Lampiran Terpasang` : 'Unggah Lampiran/Foto'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileDummyUpload}
                />
              </label>

            </div>

            {/* Modal Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editJournal ? 'Simpan Perubahan Catatan' : 'Simpan Catatan Jurnal'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        uraian={uraian}
        aspek={selectedAspek}
        skor_kondisi={skorKondisi}
        tren={tren}
        currentGroup={kelompok}
        onApplySuggestion={handleApplyAISuggestion}
      />

      {/* WhatsApp Parent Share Modal */}
      {isWhatsAppModalOpen && savedJournalForWA && (
        <WhatsAppShareModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            onClose();
          }}
          student={students.find((s) => s.id === savedJournalForWA.student_id)!}
          journal={savedJournalForWA}
        />
      )}
    </>
  );
}
