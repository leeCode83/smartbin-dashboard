import { supabase } from "@/lib/supabase";

// Tabel smartbin_settings hanya punya satu baris konfigurasi (id = 1).
const SETTINGS_ID = 1;

// Rentang valid gasThreshold, sama dengan check constraint di tabel
// (raw ADC MQ-135 12-bit). Validasi di API memberi pesan 400 yang jelas;
// constraint database menjadi jaring pengaman terakhir.
const MIN_THRESHOLD = 0;
const MAX_THRESHOLD = 4095;

/** Bentuk baris tabel `smartbin_settings` dari database (snake_case). */
type SettingsRow = {
  id: number;
  gas_threshold: number;
  updated_at: string;
};

/** Bentuk pengaturan yang dikonsumsi konsumen API (camelCase). */
type ThresholdSettings = {
  gasThreshold: number;
  updatedAt: string;
};

/**
 * Ubah baris hasil query `smartbin_settings` (snake_case) menjadi bentuk
 * API camelCase.
 *
 * @param row Baris mentah dari Supabase.
 * @returns Pengaturan threshold dalam bentuk camelCase.
 */
function toSettings(row: SettingsRow): ThresholdSettings {
  return {
    gasThreshold: row.gas_threshold,
    updatedAt: row.updated_at,
  };
}

/**
 * Ambil threshold bau tersimpan (baris tunggal `smartbin_settings`).
 * Dipakai dashboard untuk mengisi awal input "Batas Pemicu".
 *
 * @returns 200 `{ ok, data }` dengan `{ gasThreshold, updatedAt }`,
 *          atau `data: null` saat baris belum ada (migration belum
 *          dijalankan); 500 saat gagal query.
 */
export async function GET() {
  const { data, error } = await supabase
    .from("smartbin_settings")
    .select("id, gas_threshold, updated_at")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) {
    return Response.json(
      { ok: false, error: `Gagal membaca database: ${error.message}` },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    data: data ? toSettings(data as SettingsRow) : null,
  });
}

type ThresholdPayload = {
  gasThreshold: number;
};

/**
 * Simpan threshold bau baru ke baris tunggal `smartbin_settings`
 * (dipakai tombol "Simpan" di dashboard). Hanya UPDATE — baris id=1
 * sudah di-seed migration, dan tabel tidak mengizinkan insert/delete.
 *
 * Body JSON: `gasThreshold` wajib angka antara 0–4095.
 *
 * @returns 200 `{ ok, data }` dengan nilai terbaru hasil update,
 *          400 untuk body tidak valid / di luar rentang,
 *          500 saat gagal update.
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

  const payload = (body ?? {}) as Partial<ThresholdPayload>;

  if (
    typeof payload.gasThreshold !== "number" ||
    !Number.isFinite(payload.gasThreshold)
  ) {
    return Response.json(
      { ok: false, error: "Field gasThreshold wajib berupa angka" },
      { status: 400 }
    );
  }

  if (payload.gasThreshold < MIN_THRESHOLD || payload.gasThreshold > MAX_THRESHOLD) {
    return Response.json(
      {
        ok: false,
        error: `gasThreshold harus antara ${MIN_THRESHOLD} dan ${MAX_THRESHOLD}`,
      },
      { status: 400 }
    );
  }

  // Migration sengaja tanpa trigger updated_at, jadi endpoint yang men-set now().
  const { data, error } = await supabase
    .from("smartbin_settings")
    .update({
      gas_threshold: payload.gasThreshold,
      updated_at: new Date().toISOString(),
    })
    .eq("id", SETTINGS_ID)
    .select()
    .single();

  if (error) {
    return Response.json(
      { ok: false, error: `Gagal menyimpan ke database: ${error.message}` },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, data: toSettings(data as SettingsRow) });
}
