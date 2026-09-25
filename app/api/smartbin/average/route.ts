import type { NextRequest } from "next/server";

import { supabase } from "@/lib/supabase";
import type { SmartBinRow } from "@/lib/smartbin";

// Durasi satu satuan range dalam milidetik; 1m dibulatkan menjadi 30 hari.
const UNIT_MS = {
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
  m: 2_592_000_000,
} as const;

const MIN_RANGE_MS = UNIT_MS.h; // batas bawah: 1 jam
const MAX_RANGE_MS = UNIT_MS.m; // batas atas: 1 bulan (30 hari)

type ParsedRange = { raw: string; ms: number };

/** Kolom numerik yang dirata-ratakan, pas dengan select di handler. */
type NumericRow = Pick<
  SmartBinRow,
  "person_distance" | "full_distance" | "fullness" | "gas_value"
>;

/**
 * Parse rentang waktu seperti `1h`, `2d`, `1w`, `1m` menjadi durasi milidetik.
 *
 * @param raw Nilai mentah query param `range`.
 * @returns Rentang hasil parsing, atau `null` saat format salah / durasi
 *          di luar batas 1 jam – 30 hari.
 */
function parseRange(raw: string): ParsedRange | null {
  const match = /^(\d+)(h|d|w|m)$/.exec(raw);
  if (!match) return null;

  const ms = Number(match[1]) * UNIT_MS[match[2] as keyof typeof UNIT_MS];
  if (ms < MIN_RANGE_MS || ms > MAX_RANGE_MS) return null;

  return { raw, ms };
}

/**
 * Hitung rata-rata nilai sensor, mengabaikan -1 (tanda error dari HC-SR04).
 *
 * @param values Semua nilai satu kolom dalam rentang waktu.
 * @returns Rata-rata nilai valid, atau `null` saat tidak ada satu pun.
 */
function average(values: number[]): number | null {
  const valid = values.filter((value) => value !== -1);
  if (valid.length === 0) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

/**
 * Rata-rata tiap sensor selama rentang waktu tertentu.
 *
 * Query param: `range` dengan format `<angka><satuan>` (satuan: h/d/w/m,
 * 1m = 30 hari), default `1d`. Total durasi wajib antara 1 jam – 30 hari.
 *
 * @returns 200 `{ ok, range, from, to, averages, samples }` — nilai sensor
 *          tanpa sampel valid menjadi `null`; 400 untuk range tidak valid,
 *          500 saat gagal query.
 */
export async function GET(request: NextRequest) {
  const range = parseRange(request.nextUrl.searchParams.get("range") ?? "1d");

  if (!range) {
    return Response.json(
      {
        ok: false,
        error:
          "range tidak valid. Format: <angka><h|d|w|m>, minimal 1h dan maksimal 1m (30 hari), contoh: 1h, 2d, 1w",
      },
      { status: 400 }
    );
  }

  const from = new Date(Date.now() - range.ms);
  const to = new Date();

  const { data, error } = await supabase
    .from("smartbin_readings")
    .select("person_distance, full_distance, fullness, gas_value")
    .gte("created_at", from.toISOString());

  if (error) {
    return Response.json(
      { ok: false, error: `Gagal membaca database: ${error.message}` },
      { status: 500 }
    );
  }

  // ponytail: rata-rata di JS cukup untuk volume posting event-triggered;
  // pindah ke fungsi RPC (AVG di SQL) kalau rentang 1 bulan mulai terasa lambat.
  const rows = (data ?? []) as NumericRow[];

  return Response.json({
    ok: true,
    range: range.raw,
    from: from.toISOString(),
    to: to.toISOString(),
    averages: {
      personDistance: average(rows.map((row) => row.person_distance)),
      fullDistance: average(rows.map((row) => row.full_distance)),
      fullness: average(rows.map((row) => row.fullness)),
      gasValue: average(rows.map((row) => row.gas_value)),
    },
    samples: rows.length,
  });
}
