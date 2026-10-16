'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Send, 
  MessageCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  BrainCircuit, 
  HelpCircle, 
  Lightbulb, 
  Target, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { AISuggestion, StudentGroup, AspectType, TrendType, Student } from '@/lib/types';
import { MascotBiko } from './MascotBiko';
import { getStatusBadgeConfig } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  uraian?: string;
  aspek?: AspectType[];
  skor_kondisi?: number;
  tren?: TrendType;
  currentGroup?: StudentGroup;
  recentHistory?: Array<{ uraian: string; skor?: number; tanggal?: string }>;
  onApplySuggestion?: (tindakLanjutText: string, recommendedGroup?: StudentGroup, fullSuggestion?: AISuggestion) => void;
}

export function AISuggestionModal({
  isOpen,
  onClose,
  student,
  uraian,
  aspek,
  skor_kondisi,
  tren,
  currentGroup = 'Stabil',
  recentHistory = [],
  onApplySuggestion,
}: AISuggestionModalProps) {
  const { journals, saveAISuggestion } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [appliedNotification, setAppliedNotification] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'seimbang' | 'emosional' | 'orang_tua' | 'akademik'>('seimbang');

  // Follow-up Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Halo Bapak/Ibu Guru BK! Saya Si Biko AI. Ada yang ingin didiskusikan lebih lanjut tentang situasi siswa ini? (Misal: cara berbicara dengan orang tua, teknik relaksasi, atau alternatif kegiatan di kelas).',
    },
  ]);

  // Request AI suggestion on open or tone change
  const fetchSuggestion = async (tone = selectedTone) => {
    setLoading(true);
    setErrorMsg('');

    try {
      // Determine effective context from student or direct props
      const studentJournals = student
        ? journals.filter((j) => j.student_id === student.id).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
        : [];
      const latestJ = studentJournals[0];

      const effectiveUraian = uraian || latestJ?.uraian || `Pemantauan berkala kondisi psikososial siswa kelas ${student?.kelas || ''}.`;
      const effectiveAspek = aspek && aspek.length > 0 ? aspek : (latestJ?.aspek || ['Emosional', 'Perilaku']);
      const effectiveSkor = skor_kondisi || latestJ?.skor_kondisi || student?.skor_terkini || 3;
      const effectiveTren = tren || latestJ?.tren || 'Stabil';
      const effectiveGroup = currentGroup || student?.kelompok_terkini || student?.status_terkini || 'Stabil';
      const effectiveHistory = recentHistory && recentHistory.length > 0
        ? recentHistory
        : studentJournals.slice(0, 5).map((j) => ({ uraian: j.uraian, skor: j.skor_kondisi, tanggal: j.tanggal }));

      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uraian: effectiveUraian,
          aspek: effectiveAspek,
          skor_kondisi: effectiveSkor,
          tren: effectiveTren,
          kelompok: effectiveGroup,
          history: effectiveHistory,
          tone,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSuggestion(data.data);
      } else {
        setErrorMsg(data.error || 'Gagal memuat saran AI.');
      }
    } catch (e: any) {
      setErrorMsg('Koneksi terputus saat menghubungi asisten AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuggestion(selectedTone);
      setShowChat(false);
      setChatMessages([
        {
          role: 'assistant',
          content: 'Halo Bapak/Ibu Guru BK! Saya Si Biko AI. Ada hal spesifik yang ingin ditanyakan terkait siswa ini?',
        },
      ]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!suggestion) return;

    // Gabungkan langkah tindak lanjut pendek menjadi teks rapi
    const formattedText = [
      suggestion.tindak_lanjut_pendek.join('. '),
      `Teknik: ${suggestion.teknik_pendekatan_bk[0] || 'Konseling Individual'}.`,
    ].join(' ');

    if (onApplySuggestion) {
      onApplySuggestion(formattedText, suggestion.rekomendasi_kelompok, suggestion);
    } else if (student) {
      saveAISuggestion({
        ...suggestion,
        student_id: student.id,
        dipakai: true,
      });
    }
    onClose();
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userQ = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userQ }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userQ,
          studentContext: {
            kelompok: suggestion?.rekomendasi_kelompok || currentGroup,
            aspek,
            skor: skor_kondisi,
            uraian,
          },
          chatHistory: chatMessages,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Maaf, terjadi kendala saat merumuskan respon. Silakan coba ulangi pertanyaan Bapak/Ibu.' },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Terjadi gangguan jaringan saat memproses percakapan.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-200 dark:border-indigo-950/80 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <MascotBiko expression={loading ? 'thinking' : 'welcoming'} size={44} animate={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Saran Tindak Lanjut Si Biko AI</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-indigo-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Cerdas & Berempati</span>
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                Analisis pedagogis dan strategi layanan bimbingan konseling komprehensif
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selector & Anonymity Bar */}
        <div className="px-6 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium">Privasi Terjaga: Identitas siswa telah disamarkan saat proses AI.</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">Penekanan Saran:</span>
            <select
              value={selectedTone}
              onChange={(e) => {
                const newTone = e.target.value as any;
                setSelectedTone(newTone);
                fetchSuggestion(newTone);
              }}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold text-indigo-800 dark:text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="seimbang">🎯 Seimbang (Standar BK)</option>
              <option value="emosional">💖 Pendekatan Afektif & Empati</option>
              <option value="orang_tua">👨‍👩‍👧 Kolaborasi Orang Tua</option>
              <option value="akademik">📚 Pemulihan Motivasi Belajar</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <MascotBiko expression="thinking" size={96} />
              <div>
                <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200 animate-pulse">
                  Si Biko sedang mempelajari catatan bimbingan...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Menyusun hipotesis pemicu, langkah konkret mingguan, teknik layanan konseling, serta mitigasi risiko.
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{errorMsg}</p>
              <button
                onClick={() => fetchSuggestion()}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : suggestion ? (
            <div className="space-y-4">
              
              {/* 1. Ringkasan & Rekomendasi Kelompok Banner */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Evaluasi Perkembangan Siswa
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {suggestion.ringkasan_kondisi}
                  </p>
                </div>

                <div className="shrink-0 p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-indigo-100 dark:border-slate-700 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">Rekomendasi Kelompok</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${getStatusBadgeConfig(suggestion.rekomendasi_kelompok).badge}`}>
                    <span>{getStatusBadgeConfig(suggestion.rekomendasi_kelompok).emoji}</span>
                    <span>{suggestion.rekomendasi_kelompok}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 max-w-[170px] leading-tight">
                    {suggestion.alasan_kelompok}
                  </span>
                </div>
              </div>

              {/* 2. Faktor Penyebab & Teknik BK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Faktor Pemicu */}
                <div className="p-4 bg-sky-50/70 dark:bg-sky-950/20 rounded-2xl border border-sky-200/70 dark:border-sky-900/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-300">
                    <Lightbulb className="w-4 h-4 text-sky-600" />
                    <span>Kemungkinan Faktor Pemicu:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {suggestion.faktor_penyebab.map((fp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-500 font-bold">•</span>
                        <span>{fp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pendekatan Layanan BK */}
                <div className="p-4 bg-purple-50/70 dark:bg-purple-950/20 rounded-2xl border border-purple-200/70 dark:border-purple-900/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Teknik & Pendekatan Layanan BK:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {suggestion.teknik_pendekatan_bk.map((tek, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span>{tek}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 3. Tindak Lanjut Jangka Pendek & Menengah */}
              <div className="p-4.5 bg-teal-50/60 dark:bg-teal-950/20 rounded-2xl border border-teal-200/70 dark:border-teal-900/40 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-300">
                  <Target className="w-4 h-4 text-teal-600" />
                  <span>Rencana Aksi Tindak Lanjut Konkret:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-teal-100 dark:border-teal-900/50 space-y-1.5">
                    <span className="font-bold text-teal-800 dark:text-teal-300 text-[11px] uppercase tracking-wider block">
                      ⚡ Jangka Pendek (1 - 2 Minggu)
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {suggestion.tindak_lanjut_pendek.map((tl, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>{tl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-teal-100 dark:border-teal-900/50 space-y-1.5">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300 text-[11px] uppercase tracking-wider block">
                      🌱 Jangka Menengah (1 - 2 Bulan)
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {suggestion.tindak_lanjut_menengah.map((tl, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{tl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 4. Tanda Bahaya & Kriteria Rujukan */}
              <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Perhatian & Tanda Bahaya Rujukan: </strong>
                  <span className="text-slate-700 dark:text-slate-300">{suggestion.tanda_bahaya_rujukan}</span>
                </div>
              </div>

              {/* 5. Chat Lanjutan dengan Si Biko AI (Expandable) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => setShowChat(!showChat)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-indigo-600" />
                    <span>Tanya & Diskusi Lebih Lanjut dengan Si Biko AI</span>
                  </div>
                  {showChat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showChat && (
                  <div className="p-4 space-y-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 text-xs">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2.5 ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <MascotBiko expression="welcoming" size={28} animate={false} />
                          )}
                          <div
                            className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                          <MascotBiko expression="thinking" size={24} />
                          <span className="animate-pulse font-medium">Si Biko sedang mengetik jawaban...</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Contoh: Bagaimana cara bicara ke orang tuanya tanpa menyinggung?"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
                        title="Kirim Pertanyaan"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer Actions & Legal Disclaimer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Disclaimer */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic max-w-sm leading-tight">
              ⚠️ <strong>Disclaimer:</strong> Saran AI hanya berfungsi sebagai pendukung pengayaan. Keputusan dan penilaian akhir bimbingan konseling sepenuhnya di tangan Guru BK profesional.
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fetchSuggestion()}
                disabled={loading}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Buat Ulang</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={loading || !suggestion}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Sebagai Tindak Lanjut</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
