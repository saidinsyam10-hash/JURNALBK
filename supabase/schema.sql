-- ==============================================================================
-- SKEMA BASIS DATA: JURNAL HARIAN GURU BIMBINGAN DAN KONSELING (BK)
-- Database: PostgreSQL (Supabase) dengan Row Level Security (RLS) & Triggers
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABEL PROFIL GURU & ADMIN (users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  nama text not null,
  email text unique not null,
  role text check (role in ('guru_bk', 'admin')) default 'guru_bk' not null,
  nip text,
  kelas_bimbingan text[] default array[]::text[],
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.users is 'Data pengguna Guru BK dan Administrator sekolah';

-- 3. TABEL DATA SISWA (students)
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  nis text unique not null,
  nisn text,
  nama text not null,
  kelas text not null,
  jenis_kelamin text check (jenis_kelamin in ('L', 'P')) not null,
  tanggal_lahir date,
  kontak_ortu text not null,
  nama_ortu text,
  alamat text,
  catatan_khusus text,
  status_terkini text check (status_terkini in ('Baik', 'Perlu Perhatian', 'Perlu Intervensi')) default 'Baik' not null,
  foto text,
  guru_pembimbing_id uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.students is 'Master data siswa dan status perkembangannya';

-- 4. TABEL JURNAL HARIAN / CATATAN KONSELING (journal_entries)
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  tanggal date default current_date not null,
  jenis_kegiatan text check (jenis_kegiatan in (
    'Konseling Individu', 'Konseling Kelompok', 'Observasi Kelas', 
    'Kunjungan Rumah', 'Panggilan Orang Tua', 'Lainnya'
  )) not null,
  aspek text[] not null, -- ('Akademik', 'Sosial', 'Emosional', 'Perilaku/Kedisiplinan', 'Karier', 'Kehadiran')
  uraian text not null,
  tren text check (tren in ('Meningkat', 'Stabil', 'Menurun')) not null,
  kategori text check (kategori in ('Baik', 'Perlu Perhatian', 'Perlu Intervensi')) not null,
  tindak_lanjut text,
  tanggal_tindak_lanjut date,
  status_tindak_lanjut text check (status_tindak_lanjut in ('Menunggu', 'Selesai', 'Jatuh Tempo')) default 'Menunggu' not null,
  is_rahasia boolean default false not null,
  lampiran jsonb default '[]'::jsonb, -- array of { id, name, url, type, size }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.journal_entries is 'Jurnal harian, catatan konseling, dan observasi perkembangan';

-- 5. TABEL AUDIT LOG (audit_logs)
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  user_nama text,
  aksi text not null, -- 'LOGIN', 'VIEW_DETAIL', 'VIEW_SECRET', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'
  entitas text not null, -- 'student', 'journal', 'auth', 'system'
  entitas_id text,
  detail text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.audit_logs is 'Log riwayat aktivitas pengguna untuk privasi dan akuntabilitas';

-- 6. INDEXES UNTUK PERFORMA
create index if not exists idx_students_kelas on public.students(kelas);
create index if not exists idx_students_status on public.students(status_terkini);
create index if not exists idx_journals_student on public.journal_entries(student_id);
create index if not exists idx_journals_user on public.journal_entries(user_id);
create index if not exists idx_journals_tanggal on public.journal_entries(tanggal desc);
create index if not exists idx_journals_kategori on public.journal_entries(kategori);

-- 7. TRIGGER UPDATE STATUS SISWA OTOMATIS BERDASARKAN JURNAL TERBARU
create or replace function public.fn_sync_student_status()
returns trigger as $$
begin
  update public.students
  set status_terkini = new.kategori,
      updated_at = now()
  where id = new.student_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_student_status on public.journal_entries;
create trigger trg_sync_student_status
after insert or update of kategori on public.journal_entries
for each row
execute function public.fn_sync_student_status();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.journal_entries enable row level security;
alter table public.audit_logs enable row level security;

-- Policy Users: Pengguna dapat membaca data profil guru lain
create policy "Users can view profile"
on public.users for select
using (auth.role() = 'authenticated');

-- Policy Students: Guru dapat melihat siswa
create policy "Teachers can view assigned students"
on public.students for select
using (auth.role() = 'authenticated');

create policy "Teachers can insert students"
on public.students for insert
with check (auth.role() = 'authenticated');

create policy "Teachers can update students"
on public.students for update
using (auth.role() = 'authenticated');

-- Policy Journal Entries: Catatan rahasia hanya bisa dibaca oleh pembuatnya!
create policy "Teachers can view non-secret journals or their own secret journals"
on public.journal_entries for select
using (
  auth.role() = 'authenticated' and
  (is_rahasia = false or user_id = auth.uid())
);

create policy "Teachers can insert journal entries"
on public.journal_entries for insert
with check (
  auth.role() = 'authenticated' and
  user_id = auth.uid()
);

create policy "Teachers can update their own journal entries"
on public.journal_entries for update
using (
  auth.role() = 'authenticated' and
  user_id = auth.uid()
);

-- Policy Audit Logs: Semua authenticated bisa insert audit log
create policy "Authenticated users can insert audit logs"
on public.audit_logs for insert
with check (auth.role() = 'authenticated');

create policy "Admin or users can view audit logs"
on public.audit_logs for select
using (auth.role() = 'authenticated');
