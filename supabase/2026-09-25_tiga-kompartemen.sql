-- ============================================================
-- 2026-09-25 — Tiga kompartemen (organik, anorganik, kertas)
-- Jalankan di: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- fullness lama menjadi riwayat kompartemen organik.
-- rename bersifat metadata-only: instan, data lama tetap utuh.
alter table public.smartbin_readings
  rename column fullness to fullness_organik;

-- Kompartemen baru nullable: baris lama tidak punya nilainya dan
-- sengaja tidak di-backfill agar rata-rata tidak tercampur data bohong.
-- API wajib mengirim 3 angka; penanganan null dilakukan di aplikasi.
alter table public.smartbin_readings
  add column if not exists fullness_anorganik double precision,
  add column if not exists fullness_kertas double precision;

-- Rollback (kalau perlu):
-- alter table public.smartbin_readings
--   rename column fullness_organik to fullness;
-- alter table public.smartbin_readings
--   drop column if exists fullness_anorganik,
--   drop column if exists fullness_kertas;
