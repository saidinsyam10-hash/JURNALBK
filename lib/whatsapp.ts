import { Student, JournalEntry } from './types';
import { formatDateIndo, getScoreFace } from './utils';

export type WATemplateType = 'positif' | 'koordinasi' | 'evaluasi';

/**
 * Normalizes an Indonesian phone number to international 62... format for WhatsApp.
 * e.g. "0812-3456-7890" -> "6281234567890"
 */
export function formatPhoneNumberForWA(phone: string): string {
  if (!phone) return '';
  // Remove non-digit characters
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Generates an empathetic, respectful, and pedagogically sound WhatsApp message
 * from Counselor SANTARI HASAN, S.Pd to the student's parent/guardian.
 */
export function generateParentWAMessage({
  student,
  journal,
  counselorName = 'SANTARI HASAN, S.Pd',
  templateType = 'koordinasi',
  customNote = '',
}: {
  student: Student;
  journal?: JournalEntry;
  counselorName?: string;
  templateType?: WATemplateType;
  customNote?: string;
}): string {
  const parentName = student.nama_ortu || 'Bapak/Ibu Orang Tua/Wali';
  const studentName = student.nama;
  const studentClass = student.kelas;
  const todayDateStr = formatDateIndo(journal?.tanggal || new Date().toISOString().split('T')[0]);

  const score = journal?.skor_kondisi || student.skor_terkini || 3;
  const scoreFace = getScoreFace(score);

  // Template 1: Apresiasi & Perkembangan Positif (Skor 4-5 / Berkembang Baik)
  if (templateType === 'positif' || score >= 4) {
    return `*LAPORAN PERKEMBANGAN SISWA - MAN 1 MAJENE*
Unit Layanan Bimbingan & Konseling (BK)

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Yth. *${parentName}*,
Wali dari ananda *${studentName}* (Kelas ${studentClass})

Semoga Bapak/Ibu dan keluarga senantiasa berada dalam lindungan Allah SWT, diberikan kesehatan dan keberkahan.

Saya *${counselorName}*, Guru Bimbingan dan Konseling di MAN 1 Majene, ingin menyampaikan kabar gembira terkait perkembangan ananda di madrasah hari ini:

📅 *Tanggal*: ${todayDateStr}
🎯 *Fokus Kegiatan*: ${journal?.jenis_kegiatan || 'Pemantauan & Bimbingan Harian'}
🌟 *Suasana & Semangat Ananda*: ${scoreFace.emoji} ${scoreFace.label} (Skor ${score}/5)

📝 *Catatan Perkembangan Baik*:
"${journal?.uraian || 'Ananda menunjukkan keaktifan, sikap positif, serta semangat belajar yang sangat baik di sekolah.'}"

${journal?.tindak_lanjut ? `📌 *Rencana Penguatan di Madrasah*:\n${journal.tindak_lanjut}\n` : ''}
💡 *Pesan untuk Bapak/Ibu di Rumah*:
Mohon berikan apresiasi dan pelukan hangat kepada ananda saat tiba di rumah agar semangat dan rasa percaya dirinya terus bertumbuh.

${customNote ? `\n💬 *Catatan Tambahan*:\n${customNote}\n` : ''}
Terima kasih banyak atas sinergi dan perhatian Bapak/Ibu dalam mendampingi ananda.

Salam hangat dan hormat kami,
*${counselorName}*
Guru Bimbingan dan Konseling
*MAN 1 Majene*`;
  }

  // Template 2: Evaluasi & Pendampingan Bersama (Skor 1-2 / Butuh Perhatian)
  if (templateType === 'evaluasi' || score <= 2) {
    // If journal is confidential, use polite general guidance without alarming the parent
    const safeContent = journal?.is_rahasia
      ? 'Ananda sedang menghadapi masa yang cukup melelahkan dan membutuhkan ruang bercerita serta perhatian ekstra di lingkungan madrasah.'
      : (journal?.uraian || 'Ananda membutuhkan pendampingan khusus dan perhatian bersama terkait aktivitas serta kenyamanan belajarnya.');

    return `*INFORMASI PENDAMPINGAN SISWA - MAN 1 MAJENE*
Unit Layanan Bimbingan & Konseling (BK)

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Yth. *${parentName}*,
Wali dari ananda *${studentName}* (Kelas ${studentClass})

Semoga Bapak/Ibu senantiasa dalam keadaan sehat dan dimudahkan dalam segala urusan.

Saya *${counselorName}*, Guru Bimbingan dan Konseling di MAN 1 Majene. Melalui pesan ini, kami ingin mengajak Bapak/Ibu bersama-sama mendampingi ananda agar merasa lebih nyaman dan termotivasi di sekolah.

📅 *Tanggal*: ${todayDateStr}
🎯 *Layanan*: ${journal?.jenis_kegiatan || 'Konseling & Pendampingan Siswa'}
📊 *Kondisi Ananda Hari Ini*: ${scoreFace.emoji} Perlu Pendampingan Bersama

📝 *Kabar dari Sekolah*:
"${safeContent}"

${journal?.tindak_lanjut ? `📌 *Langkah Pendampingan di Madrasah*:\n${journal.tindak_lanjut}\n` : ''}
🤝 *Harapan Kolaborasi di Rumah*:
Mohon luangkan waktu 10-15 menit untuk mengobrol santai dari hati ke hati bersama ananda malam ini, serta berikan rasa aman dan dukungan tanpa penghakiman.

${customNote ? `\n💬 *Catatan Tambahan*:\n${customNote}\n` : ''}
Apabila Bapak/Ibu berkenan berdiskusi lebih lanjut, kami di ruang BK MAN 1 Majene dengan senang hati siap bersilaturahmi.

Hormat kami,
*${counselorName}*
Guru Bimbingan dan Konseling
*MAN 1 Majene*`;
  }

  // Template 3: Koordinasi Rutin & Perkembangan Normal (Skor 3 / Stabil)
  return `*UPDATE HARIAN SISWA - MAN 1 MAJENE*
Unit Layanan Bimbingan & Konseling (BK)

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Yth. *${parentName}*,
Wali dari ananda *${studentName}* (Kelas ${studentClass})

Semoga Bapak/Ibu senantiasa sehat wal'afiat.

Saya *${counselorName}*, Guru Bimbingan dan Konseling di MAN 1 Majene, menyampaikan catatan pemantauan ananda hari ini:

📅 *Tanggal*: ${todayDateStr}
🎯 *Aktivitas*: ${journal?.jenis_kegiatan || 'Observasi & Bimbingan Belajar'}
📊 *Kondisi Ananda*: ${scoreFace.emoji} ${scoreFace.label} (Cukup Baik & Terpantau)

📝 *Catatan Perkembangan*:
"${journal?.uraian || 'Aktivitas belajar ananda berjalan lancar dan terpantau tertib di lingkungan sekolah.'}"

${journal?.tindak_lanjut ? `📌 *Tindak Lanjut*:\n${journal.tindak_lanjut}\n` : ''}
💡 *Dukungan Orang Tua*:
Tetap ingatkan ananda untuk istirahat cukup, menjaga ibadah, dan mengulang pelajaran dengan gembira di rumah.

${customNote ? `\n💬 *Catatan Tambahan*:\n${customNote}\n` : ''}
Terima kasih atas kerja sama Bapak/Ibu yang senantiasa mendukung pendidikan ananda di MAN 1 Majene.

Wassalamu'alaikum Warahmatullahi Wabarakatuh,
*${counselorName}*
Guru Bimbingan dan Konseling
*MAN 1 Majene*`;
}

/**
 * Creates direct WhatsApp Web / WhatsApp Mobile URL
 */
export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanedPhone = formatPhoneNumberForWA(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodedText}`;
}
