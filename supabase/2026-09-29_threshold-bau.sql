-- ============================================================
-- 2026-09-29 — Threshold bau (tabel smartbin_settings)
-- Jalankan di: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Konfigurasi dashboard disimpan sebagai satu baris tunggal
-- (id selalu 1, dijaga constraint check). Nilai default 2000
-- mengikuti BAU_THRESHOLD di firmware ESP32 dan batas kategori
-- "AMONIA / BAU SAMPAH" pada GAS_RANGES di API.
create table if not exists public.smartbin_settings (
  id smallint primary key default 1 check (id = 1),
  gas_threshold double precision not null default 2000
    check (gas_threshold between 0 and 4095), -- rentang raw ADC MQ-135 (12-bit)
  updated_at timestamptz not null default now()
);

-- Baris id=1 langsung di-seed agar endpoint API tinggal UPDATE,
-- tidak perlu logic upsert. updated_at tidak pakai trigger;
-- endpoint UPDATE yang men-set updated_at = now().
insert into public.smartbin_settings (id) values (1)
  on conflict (id) do nothing;

-- Sama seperti smartbin_readings: RLS aktif karena API memakai anon key.
-- anon boleh baca (dashboard menampilkan threshold) dan mengubah
-- (tombol Simpan). Tidak ada policy INSERT/DELETE — baris tunggal
-- sudah di-seed di atas dan tidak boleh ditambah/dihapus.
alter table public.smartbin_settings enable row level security;

drop policy if exists "anon boleh baca settings" on public.smartbin_settings;
create policy "anon boleh baca settings"
  on public.smartbin_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "anon boleh ubah settings" on public.smartbin_settings;
create policy "anon boleh ubah settings"
  on public.smartbin_settings
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Rollback (kalau perlu):
-- drop table if exists public.smartbin_settings;
