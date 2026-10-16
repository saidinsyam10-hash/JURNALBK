'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  Phone, 
  ShieldAlert, 
  Sparkles, 
  HeartHandshake, 
  User, 
  ExternalLink,
  Edit3
} from 'lucide-react';
import { Student, JournalEntry } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { 
  generateParentWAMessage, 
  buildWhatsAppLink, 
  formatPhoneNumberForWA,
  WATemplateType 
} from '@/lib/whatsapp';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  journal?: JournalEntry;
}

export function WhatsAppShareModal({
  isOpen,
  onClose,
  student,
  journal,
}: WhatsAppShareModalProps) {
  const { currentUser, updateStudent } = useAppStore();

  const counselorName = currentUser?.nama || 'SANTARI HASAN, S.Pd';

  // Determine initial template type based on score or group
  const defaultScore = journal?.skor_kondisi || student.skor_terkini || 3;
  const initialType: WATemplateType = 
    defaultScore >= 4 ? 'positif' : 
    defaultScore <= 2 ? 'evaluasi' : 'koordinasi';

  const [templateType, setTemplateType] = useState<WATemplateType>(initialType);
  const [parentPhone, setParentPhone] = useState(student.kontak_ortu || '');
  const [parentName, setParentName] = useState(student.nama_ortu || 'Bapak/Ibu');
  const [customNote, setCustomNote] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Generate message whenever template type, phone, or custom note changes
  useEffect(() => {
    const generated = generateParentWAMessage({
      student: {
        ...student,
        nama_ortu: parentName,
      },
      journal,
      counselorName,
      templateType,
      customNote,
    });
    setMessageText(generated);
  }, [student, journal, counselorName, templateType, parentName, customNote]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenWhatsApp = () => {
    // If phone number was changed, save it to student record
    if (parentPhone !== student.kontak_ortu || parentName !== student.nama_ortu) {
      updateStudent(student.id, {
        kontak_ortu: parentPhone,
        nama_ortu: parentName,
      });
    }

    const url = buildWhatsAppLink(parentPhone, messageText);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSavePhone = () => {
    updateStudent(student.id, {
      kontak_ortu: parentPhone,
      nama_ortu: parentName,
    });
    setIsEditingPhone(false);
  };

  const isPhoneValid = parentPhone.replace(/[^0-9]/g, '').length >= 9;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Kirim Laporan ke WhatsApp Orang Tua
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25 text-white">
                  Resmi BK
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Pengirim: <span className="font-semibold">{counselorName}</span> (Guru BK MAN 1 Majene)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Student & Parent Info Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {student.nama}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  {student.kelas}
                </span>
                <span className="text-xs text-slate-400">• NIS: {student.nis}</span>
              </div>
              
              {!isEditingPhone ? (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <span>Wali: <strong className="text-slate-800 dark:text-slate-100">{parentName}</strong></span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    <Phone className="w-3 h-3" />
                    {parentPhone || '(Belum ada nomor WA)'}
                  </span>
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5 ml-1"
                  >
                    <Edit3 className="w-3 h-3" /> Ubah
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Nama Orang Tua"
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Nomor WA (contoh: 081234567890)"
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                  />
                  <button
                    onClick={handleSavePhone}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Simpan
                  </button>
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Format WA: <strong className="text-slate-700 dark:text-slate-200">+{formatPhoneNumberForWA(parentPhone)}</strong>
              </span>
            </div>
          </div>

          {/* Privacy Alert if Journal is Confidential */}
          {journal?.is_rahasia && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Perlindungan Kerahasiaan BK:</strong> Catatan jurnal ini berlabel <em>Rahasia</em>. 
                Pesan untuk orang tua telah disesuaikan agar tetap positif, menjaga martabat ananda, dan hanya berfokus pada ajakan pendampingan tanpa membocorkan privasi sensitif.
              </div>
            </div>
          )}

          {/* 3 Template Style Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Pilih Nada & Gaya Pesan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('positif')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  templateType === 'positif'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apresiasi Positif</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  Kabar baik, pujian prestasi, dan dorongan semangat belajar di rumah.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('koordinasi')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  templateType === 'koordinasi'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 dark:text-indigo-400">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Koordinasi Rutin</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  Update perkembangan harian biasa, kedisiplinan, dan suasana kelas.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('evaluasi')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  templateType === 'evaluasi'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700 dark:text-rose-400">
                  <User className="w-3.5 h-3.5" />
                  <span>Pendampingan Bersama</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  Ajakan santun orang tua untuk meluangkan waktu ngobrol santai dari hati ke hati.
                </p>
              </button>
            </div>
          </div>

          {/* Editable WhatsApp Text Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Isi Pesan WhatsApp</span>
                <span className="text-[10px] font-normal text-slate-400">(Bisa diedit langsung sebelum dikirim)</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>

            {/* WA Chat Styled Bubble */}
            <div className="relative rounded-2xl p-4 bg-[#e5ddd5] dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 shadow-sm border border-slate-200 dark:border-slate-700/80">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={9}
                  className="w-full bg-transparent text-xs sm:text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 font-sans focus:outline-none resize-y"
                  placeholder="Ketik atau edit isi pesan..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Tersalin' : 'Salin Pesan'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              disabled={!isPhoneValid}
              className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Buka WhatsApp & Kirim</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
