-- ============================================================
-- SmartBin Dashboard — Skema Supabase
-- Jalankan sekali di: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Tabel untuk menyimpan setiap postingan data sensor dari ESP32.
create table if not exists public.smartbin_readings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  person_distance double precision not null, -- jarak orang dari HC-SR04 (cm), -1 = error
  full_distance double precision not null,   -- jarak permukaan sampah dari HC-SR04 (cm), -1 = error
  fullness double precision not null,        -- persentase penuh tong (%)
  gas_value double precision not null,       -- raw ADC MQ-135 (0-4095)
  gas_label text not null,                   -- hasil klasifikasi gas
  servo_triggered boolean not null default false
);

-- Aktifkan Row Level Security lalu buka akses anon untuk INSERT (ESP32
-- mengirim data via dashboard tanpa login) dan SELECT (dashboard membaca).
alter table public.smartbin_readings enable row level security;

drop policy if exists "anon boleh insert readings" on public.smartbin_readings;
create policy "anon boleh insert readings"
  on public.smartbin_readings
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "anon boleh baca readings" on public.smartbin_readings;
create policy "anon boleh baca readings"
  on public.smartbin_readings
  for select
  to anon, authenticated
  using (true);

-- Index agar query "data terbaru" di dashboard tetap cepat.
create index if not exists smartbin_readings_created_at_idx
  on public.smartbin_readings (created_at desc);
