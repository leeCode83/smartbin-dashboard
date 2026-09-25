import type { NextRequest } from "next/server";

import { supabase } from "@/lib/supabase";
import { toReading, type SmartBinRow } from "@/lib/smartbin";

// Batasan pagination GET /api/smartbin.
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

type SmartBinPayload = {
  personDistance: number;
  fullDistance: number;
  fullness: number;
  gasValue: number;
  servoTriggered?: boolean;
};

// Rentang raw ADC MQ-135 (0-4095) → jenis gas.
// Batas 2000 mengikuti BAU_THRESHOLD di firmware ESP32.
const GAS_RANGES = [
  { max: 1000, label: "UDARA BERSIH" },
  { max: 2000, label: "CO2 / ASAP RINGAN" },
  { max: 3000, label: "AMONIA / BAU SAMPAH" },
  { max: Infinity, label: "GAS BERBAHAYA" },
];

/**
 * Klasifikasikan raw ADC MQ-135 menjadi label kategori gas.
 *
 * @param gasValue Pembacaan raw ADC MQ-135 (0-4095).
 * @returns Label kategori gas sesuai batas di GAS_RANGES.
 */
function classifyGas(gasValue: number): string {
  for (const range of GAS_RANGES) {
    if (gasValue < range.max) {
      return range.label;
    }
  }
  return "TIDAK DIKETAHUI";
}

/**
 * Terima data sensor dari ESP32 dan simpan sebagai satu baris di tabel
 * `smartbin_readings`. Timestamp dibuat oleh database (`created_at`).
 *
 * Body JSON: `personDistance`, `fullDistance`, `fullness`, `gasValue`
 * wajib angka; `servoTriggered` opsional (default false).
 *
 * @returns 200 `{ ok: true, gasLabel }` saat tersimpan,
 *          400 untuk body tidak valid, 500 saat gagal insert.
 */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Body harus JSON yang valid" },
      { status: 400 }
    );
  }

  const payload = (body ?? {}) as Partial<SmartBinPayload>;

  const numericFields = [
    "personDistance",
    "fullDistance",
    "fullness",
    "gasValue",
  ] as const;

  const invalid = numericFields.filter(
    (field) =>
      typeof payload[field] !== "number" || !Number.isFinite(payload[field])
  );

  if (invalid.length > 0) {
    return Response.json(
      {
        ok: false,
        error: `Field ${invalid.join(", ")} wajib berupa angka`,
      },
      { status: 400 }
    );
  }

  const data = payload as SmartBinPayload;
  const gasLabel = classifyGas(data.gasValue);

  const { error } = await supabase.from("smartbin_readings").insert({
    person_distance: data.personDistance,
    full_distance: data.fullDistance,
    fullness: data.fullness,
    gas_value: data.gasValue,
    gas_label: gasLabel,
    servo_triggered: data.servoTriggered ?? false,
  });

  if (error) {
    return Response.json(
      { ok: false, error: `Gagal menyimpan ke database: ${error.message}` },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, gasLabel });
}

/**
 * Ambil integer positif dari query param dengan nilai default.
 *
 * @param params Query param URL.
 * @param name Nama param (mis. "page").
 * @param fallback Nilai yang dipakai saat param tidak ada / kosong.
 * @returns Angka hasil parsing, `fallback` saat param kosong,
 *          atau `null` saat param ada tapi bukan integer >= 1.
 */
function positiveIntParam(
  params: URLSearchParams,
  name: string,
  fallback: number
): number | null {
  const raw = params.get(name);
  if (raw === null || raw === "") return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 1 ? value : null;
}

/**
 * Daftar seluruh reading sensor, terbaru duluan, dengan pagination.
 *
 * Query param: `page` (default 1) dan `limit` (default 30, maksimal 100).
 *
 * @returns 200 `{ ok, data, page, limit, total, totalPages }`,
 *          400 untuk param tidak valid, 500 saat gagal query.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = positiveIntParam(params, "page", DEFAULT_PAGE);
  const limit = positiveIntParam(params, "limit", DEFAULT_LIMIT);

  if (page === null || limit === null) {
    return Response.json(
      { ok: false, error: "Param page dan limit wajib integer >= 1" },
      { status: 400 }
    );
  }

  if (limit > MAX_LIMIT) {
    return Response.json(
      { ok: false, error: `limit maksimal ${MAX_LIMIT}` },
      { status: 400 }
    );
  }

  const { data, error, count } = await supabase
    .from("smartbin_readings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return Response.json(
      { ok: false, error: `Gagal membaca database: ${error.message}` },
      { status: 500 }
    );
  }

  const total = count ?? 0;

  return Response.json({
    ok: true,
    data: ((data ?? []) as SmartBinRow[]).map(toReading),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
