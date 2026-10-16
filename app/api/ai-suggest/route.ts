import { NextRequest, NextResponse } from 'next/server';
import { AISuggestion, StudentGroup } from '@/lib/types';

// Instruksi Sistem Resmi untuk AI Asisten Guru BK
const SYSTEM_INSTRUCTION = `Anda adalah "Si Biko AI", Asisten Konseling Virtual untuk Guru Bimbingan dan Konseling (BK) di sekolah/madrasah di Indonesia.
Tugas Anda: Membantu Guru BK menganalisis data observasi siswa dan merumuskan langkah tindak lanjut yang konstruktif, penuh empati, dan sesuai kaidah bimbingan konseling.

Pedoman Wajib:
1. Privasi: Jangan meminta atau menggunakan nama asli / identitas pribadi.
2. Non-Diagnosis: DILARANG membuat diagnosis medis atau psikiatrik (misal: "Siswa menderita depresi mayor"). Gunakan bahasa observasional yang hati-hati (misal: "Siswa menunjukkan tanda kelelahan emosional dan penurunan motivasi").
3. Pendekatan BK: Rekomendasikan teknik layanan BK resmi (Konseling Individual, Restrukturisasi Kognitif, Bimbingan Kelompok, Penguatan Positif/Token Economy, Kolaborasi Wali Kelas/Orang Tua).
4. Tanda Bahaya & Rujukan: Bila ada indikasi menyakiti diri sendiri, kekerasan, perundungan berat, atau keputusasaan mendalam, SELALU sarankan segera berkoordinasi dengan Kepala Sekolah dan rujukan ke Psikolog/Psikiater.
5. Bahasa: Bahasa Indonesia yang hangat, bersahabat, terstruktur, dan aplikatif bagi guru.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      uraian, 
      aspek = [], 
      skor_kondisi = 3, 
      tren = 'Stabil', 
      kelompok = 'Stabil', 
      history = [],
      tone = 'seimbang' 
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // Jika ada API Key Gemini, gunakan Google Gemini REST API
    if (apiKey) {
      try {
        const prompt = `Analisis data observasi siswa berikut:
Konteks:
- Kondisi Terkini: "${uraian}"
- Aspek yang Dipantau: ${aspek.join(', ')}
- Skor Kondisi: ${skor_kondisi}/5
- Tren Perkembangan: ${tren}
- Kelompok Awal: ${kelompok}
- Riwayat Catatan Sebelumnya: ${history.map((h: any, i: number) => `Catatan ${i+1}: ${h.uraian || '-'} (Skor: ${h.skor || '-'})`).join(' | ')}
- Penekanan / Nada Khusus: ${tone}

Berikan respons dalam format JSON murni dengan struktur berikut:
{
  "ringkasan_kondisi": "2-3 kalimat ringkas menjelaskan kondisi psikososial siswa",
  "faktor_penyebab": ["poin 1 kemungkinan pemicu", "poin 2 kemungkinan pemicu"],
  "tindak_lanjut_pendek": ["langkah konkret minggu ke-1 s/d 2", "langkah konkret berikutnya"],
  "tindak_lanjut_menengah": ["tindak lanjut untuk 1 s/d 2 bulan ke depan"],
  "teknik_pendekatan_bk": ["nama teknik layanan BK (misal: Konseling Individual dengan Teknik Reframing)", "teknik lainnya"],
  "tanda_bahaya_rujukan": "tanda-tanda bahaya yang mewajibkan rujukan profesional psikolog",
  "rekomendasi_kelompok": "Berkembang Baik | Stabil | Belum Ada Kemajuan | Perlu Bimbingan | Perlu Intervensi Segera",
  "alasan_kelompok": "alasan singkat penentuan kelompok"
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${prompt}` }] }
            ],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: 'application/json',
            }
          }),
        });

        if (response.ok) {
          const geminiData = await response.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              success: true,
              source: 'gemini_api',
              data: parsed,
            });
          }
        }
      } catch (err) {
        console.warn('Gagal memanggil Gemini API, beralih ke Fallback Heuristic Engine:', err);
      }
    }

    // Built-in Expert Pedagogical Counselor Engine (Fallback Cerdas Berkualitas Tinggi)
    const fallbackSuggestion = generateExpertCounselorAdvice({
      uraian,
      aspek,
      skor_kondisi,
      tren,
      kelompok,
      tone,
    });

    return NextResponse.json({
      success: true,
      source: apiKey ? 'fallback_after_error' : 'built_in_expert_engine',
      data: fallbackSuggestion,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan sistem AI' },
      { status: 500 }
    );
  }
}

// Mesin Heuristik BK Berbasis Kaidah Psikologi Pendidikan & Panduan Kurikulum Merdeka BK
function generateExpertCounselorAdvice({
  uraian,
  aspek,
  skor_kondisi,
  tren,
  kelompok,
  tone,
}: any): AISuggestion {
  const aspekList = (aspek && aspek.length > 0) ? aspek : ['Emosional'];
  const primaryAspect = aspekList[0];

  let recommendedGroup: StudentGroup = 'Stabil';
  let groupReason = '';

  if (skor_kondisi <= 1) {
    recommendedGroup = 'Perlu Intervensi Segera';
    groupReason = 'Skor berada pada tingkat sangat rendah (1/5) yang mengindikasikan hambatan emosional/perilaku berat yang mendesak.';
  } else if (skor_kondisi === 2) {
    recommendedGroup = tren === 'Meningkat' ? 'Perlu Bimbingan' : 'Perlu Intervensi Segera';
    groupReason = 'Kondisi memerlukan pendampingan intensif untuk mencegah penurunan lebih lanjut.';
  } else if (skor_kondisi === 3) {
    if (tren === 'Menurun') {
      recommendedGroup = 'Perlu Bimbingan';
      groupReason = 'Tren menurun memerlukan tindak lanjut agar masalah tidak berlarut.';
    } else if (tren === 'Belum Ada Kemajuan') {
      recommendedGroup = 'Belum Ada Kemajuan';
      groupReason = 'Siswa berada dalam observasi stagnan sehingga perlu evaluasi pendekatan bimbingan.';
    } else {
      recommendedGroup = 'Stabil';
      groupReason = 'Kondisi berada dalam batas adaptif normal.';
    }
  } else if (skor_kondisi >= 4) {
    recommendedGroup = (skor_kondisi === 5 || tren === 'Meningkat') ? 'Berkembang Baik' : 'Stabil';
    groupReason = 'Siswa menunjukkan daya lenting (resiliensi) dan penyesuaian diri yang sangat sehat.';
  }

  // Ringkasan
  const ringkasan_kondisi = `Siswa saat ini terpantau berada pada skor ${skor_kondisi}/5 dengan kecenderungan tren ${tren.toLowerCase()} pada ranah ${aspekList.join(', ')}. Dari narasi observasi, siswa ${
    skor_kondisi <= 2
      ? 'memerlukan ruang aman untuk meregulasi beban afektif dan mengatasi hambatan penyesuaian diri.'
      : skor_kondisi === 3
      ? 'berada pada fase konsolidasi di mana dukungan motivasi berkala dapat mendorong stabilitas positif.'
      : 'menunjukkan potensi adaptasi dan aktualisasi diri yang sangat prospektif untuk dipertahankan.'
  }`;

  // Faktor Penyebab
  const faktor_penyebab: string[] = [];
  if (aspekList.includes('Akademik')) {
    faktor_penyebab.push('Beban tugas belajar atau kecemasan menghadapi ujian / ekspektasi nilai akademik.');
  }
  if (aspekList.includes('Emosional')) {
    faktor_penyebab.push('Kesulitan dalam mengidentifikasi dan mengomunikasikan emosi negatif (stres, cemas, atau rasa tidak aman).');
  }
  if (aspekList.includes('Sosial')) {
    faktor_penyebab.push('Dinamika penerimaan kelompok teman sebaya (peer group) atau isolasi sosial di kelas.');
  }
  if (aspekList.includes('Perilaku') || aspekList.includes('Perilaku/Kedisiplinan')) {
    faktor_penyebab.push('Bentuk ekspresi kompensasi atas rasa frustrasi atau kurangnya pemahaman konsekuensi aturan.');
  }
  if (aspekList.includes('Kehadiran')) {
    faktor_penyebab.push('Faktor kenyamanan iklim belajar di sekolah atau dinamika keluarga di rumah.');
  }
  if (faktor_penyebab.length === 0) {
    faktor_penyebab.push('Perubahan fase transisi usia remaja dan penyesuaian rutinitas harian.');
  }

  // Langkah Tindak Lanjut Pendek (1-2 minggu)
  const tindak_lanjut_pendek: string[] = [
    'Lakukan sesi konseling individual santai selama 20-30 menit dengan prinsip active listening tanpa penghakiman.',
    'Bantu siswa memetakan "Lingkaran Kendali" (hal yang bisa ia kontrol vs hal di luar kendalinya).',
  ];

  if (tone === 'orang_tua' || skor_kondisi <= 2) {
    tindak_lanjut_pendek.push('Jadwalkan komunikasi empatik dengan orang tua/wali untuk menyelaraskan pola pendampingan di rumah.');
  } else {
    tindak_lanjut_pendek.push('Ajak siswa membuat target harian sederhana yang realistis (Micro-habits) untuk membangun rasa berdaya.');
  }

  // Langkah Tindak Lanjut Menengah (1-2 bulan)
  const tindak_lanjut_menengah: string[] = [
    'Evaluasi perkembangan skor dan tren mingguan pada buku catatan jurnal bimbingan konseling.',
    'Libatkan siswa dalam kegiatan minat bakat atau proyek kolaborasi kelompok untuk memperkuat jejaring sosial.',
    'Koordinasi berkala 2 minggu sekali dengan wali kelas untuk memantau perubahan afektif di ruang kelas.',
  ];

  // Teknik Layanan BK
  const teknik_pendekatan_bk: string[] = [
    'Konseling Individual dengan Teknik SFBC (Solution-Focused Brief Counseling) untuk mencari pengecualian masalah.',
    'Teknik Restrukturisasi Kognitif (Cognitive Reframing) guna membantu siswa meninjau pikiran negatif otomatis.',
    'Penguatan Positif (Positive Reinforcement) atas setiap usaha kecil yang berhasil ditunjukkan siswa.',
  ];

  if (aspekList.includes('Sosial')) {
    teknik_pendekatan_bk.push('Layanan Bimbingan Kelompok bertema Keterampilan Komunikasi Asertif dan Empati.');
  }

  // Tanda Bahaya & Rujukan
  const tanda_bahaya_rujukan = 
    'Segera lakukan rujukan (referral) ke Psikolog Klinis atau fasilitas kesehatan jika siswa: (1) Mengungkapkan ide atau tindakan melukai diri/bunuh diri, (2) Mengalami perubahan drastis dalam pola makan/tidur berkepanjangan, (3) Menunjukkan indikasi trauma psikis mendalam, atau (4) Terdapat tanda-tanda kekerasan fisik atau perundungan siber berat.';

  return {
    id: `ai-sug-${Date.now()}`,
    student_id: 'anonymized-student',
    ringkasan_kondisi,
    faktor_penyebab,
    tindak_lanjut_pendek,
    tindak_lanjut_menengah,
    teknik_pendekatan_bk,
    tanda_bahaya_rujukan,
    rekomendasi_kelompok: recommendedGroup,
    alasan_kelompok: groupReason,
    dipakai: false,
    created_at: new Date().toISOString(),
  };
}
