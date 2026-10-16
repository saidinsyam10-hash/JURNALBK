import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `Anda adalah "Si Biko AI", rekan diskusi profesional dan suportif bagi Guru Bimbingan dan Konseling (BK).
Tugas Anda: Menjawab pertanyaan lanjutan dari Guru BK seputar penanganan kasus siswa, tips berkomunikasi dengan orang tua/wali kelas, teknik konseling di sekolah, dan strategi intervensi.
Prinsip utama:
1. Tidak meminta atau menyebutkan identitas pribadi siswa.
2. Gunakan pendekatan solutif, empatik, berbasis bukti, dan praktis.
3. Berikan contoh percakapan atau template kalimat bila guru bertanya tentang cara berbicara ke siswa atau orang tua.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, studentContext = {}, chatHistory = [] } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Pertanyaan tidak boleh kosong.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const historyText = chatHistory.map((m: any) => `${m.role === 'user' ? 'Guru' : 'Si Biko'}: ${m.content}`).join('\n');
        
        const fullPrompt = `${SYSTEM_INSTRUCTION}

Konteks Ringkas Siswa:
- Kelompok: ${studentContext.kelompok || 'Stabil'}
- Aspek Utama: ${studentContext.aspek?.join(', ') || 'Umum'}
- Skor Terkini: ${studentContext.skor || 3}/5
- Uraian Catatan Terakhir: "${studentContext.uraian || '-'}"

Riwayat Percakapan:
${historyText}

Pertanyaan Guru BK:
"${prompt}"

Jawaban Si Biko AI:`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.6 }
          })
        });

        if (response.ok) {
          const geminiData = await response.json();
          const answer = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) {
            return NextResponse.json({ success: true, answer });
          }
        }
      } catch (e) {
        console.warn('Gemini chat error, fallback used:', e);
      }
    }

    // Fallback heuristic chat responses
    const lower = prompt.toLowerCase();
    let reply = '';

    if (lower.includes('orang tua') || lower.includes('ortu') || lower.includes('wali')) {
      reply = `Berikut tips dan contoh kalimat yang bisa Bapak/Ibu Guru BK gunakan saat berkomunikasi dengan orang tua:

1. **Awali dengan Apresiasi**: Jangan langsung ke masalah. Mulai dengan hal positif, misalnya:
   *"Selamat pagi Bapak/Ibu, terima kasih atas waktunya. Kami di sekolah sangat mengapresiasi kehadiran dan semangat belajar ananda."*
2. **Gunakan Bahasa Deskriptif, Bukan Menuduh**:
   *Contoh:* *"Kami melihat dalam 2 minggu terakhir ananda tampak lebih pendiam dan sesekali mengantuk di kelas. Kami ingin bersama-sama memahami apakah ada hal yang bisa kita dukung bersama."*
3. **Posisikan Sebagai Mitra**: Tanyakan pandangan mereka di rumah:
   *"Bagaimana kebiasaan istirahat atau cerita ananda saat di rumah belakangan ini, Bu?"*
4. **Rumuskan Solusi Bersama**: Akhiri dengan kesepakatan langkah kecil yang konkret.`;
    } else if (lower.includes('teman') || lower.includes('sosial') || lower.includes('bully') || lower.includes('perundungan')) {
      reply = `Untuk dinamika relasi pertemanan dan sosial:

1. **Lakukan Wawancara Terpisah**: Jangan mempertemukan siswa secara langsung bila ada potensi ketimpangan kekuatan atau rasa tertekan.
2. **Eksplorasi Perasaan**: Gunakan pertanyaan terbuka: *"Bagaimana perasaanmu saat berada di kelas saat jam istirahat?"*
3. **Pemberdayaan Teman Sebaya (Peer Support)**: Pertimbangkan melibatkan 1-2 teman sebaya yang suportif dan inklusif untuk menjadi teman kelompok belajar/kegiatan.
4. **Tegaskan Sikap Sekolah**: Berikan rasa aman bahwa ruang BK adalah tempat yang aman dan rahasia.`;
    } else if (lower.includes('malas') || lower.includes('tugas') || lower.includes('akademik') || lower.includes('nilai')) {
      reply = `Terkait motivasi akademik dan tugas sekolah:

1. **Urai Masalah Menjadi Bagian Kecil**: Seringkali rasa "malas" adalah bentuk pelarian dari rasa kewalahan (*overwhelmed*). Bantu siswa membuat daftar tugas dari yang paling mudah.
2. **Cari Akar Masalah**: Apakah siswa kesulitan memahami materi, ada distraksi gawai berlebih, atau kurang tidur?
3. **Teknik Pomodoro 15 Menit**: Sarankan siswa belajar 15 menit fokus lalu istirahat 5 menit untuk membangun momentum.
4. **Apresiasi Usaha (*Growth Mindset*)**: Fokus pada proses belajar dan ketekunan, bukan sekadar angka nilai akhir.`;
    } else {
      reply = `Terima kasih pertanyaannya, Bapak/Ibu Guru BK. 

Menangani situasi ini, langkah terpenting adalah:
1. **Membangun Hubungan Kepercayaan (Rapport)**: Pastikan siswa merasa didengar secara tulus tanpa terburu-buru diberikan nasihat panjang.
2. **Teknik Reframing**: Bantu siswa melihat tantangan yang dihadapi sebagai kesempatan untuk melatih ketangguhan diri.
3. **Target Jangka Pendek Realistis**: Tetapkan satu komitmen kecil yang bisa dicapai siswa dalam 3 hari ke depan untuk menumbuhkan rasa percaya diri.

Apakah ada aspek spesifik yang ingin kita diskusikan lebih dalam?`;
    }

    return NextResponse.json({ success: true, answer: reply });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
