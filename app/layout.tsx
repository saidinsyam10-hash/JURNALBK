import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Jurnal Harian Guru BK | Sistem Pemantauan Perkembangan Siswa',
  description: 'Aplikasi pencatatan jurnal harian guru BK, pemantauan status perkembangan siswa, dan tindak lanjut konseling sekolah terpadu.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f766e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
