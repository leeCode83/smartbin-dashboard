import type { SmartBinReading } from "@/lib/smartbin";

/** Bentuk dasar respons semua endpoint smartbin: `{ ok, ... }` atau `{ ok: false, error }`. */
interface ApiResponse {
  ok: boolean;
  error?: string;
}

/**
 * Fetch JSON dari endpoint API internal.
 *
 * @param url Path endpoint (mis. "/api/smartbin/now").
 * @param init Opsi fetch tambahan (method, body, dll).
 * @returns Body respons yang sudah diparse.
 * @throws Error jika HTTP gagal atau API membalas `ok: false`.
 */
async function fetchJson<T extends ApiResponse>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new Error(`Tidak dapat menghubungi ${url}`);
  }

  let body: T;
  try {
    body = (await res.json()) as T;
  } catch {
    throw new Error(`Respons tidak valid dari ${url} (HTTP ${res.status})`);
  }

  if (!res.ok || !body.ok) {
    throw new Error(body.error ?? `Permintaan gagal (HTTP ${res.status})`);
  }
  return body;
}

/** Ambil bacaan sensor terbaru dari `GET /api/smartbin/now`. `null` = database masih kosong. */
export async function getSmartbinNow(): Promise<SmartBinReading | null> {
  const body = await fetchJson<{ ok: boolean; data: SmartBinReading | null }>(
    "/api/smartbin/now"
  );
  return body.data;
}

/** Isi pengaturan threshold dari tabel `smartbin_settings`. */
export type ThresholdSettings = {
  gasThreshold: number;
  updatedAt: string;
};

/** Baca threshold bau tersimpan dari `GET /api/smartbin/threshold`. `null` = pengaturan belum ada. */
export async function getThreshold(): Promise<ThresholdSettings | null> {
  const body = await fetchJson<{ ok: boolean; data: ThresholdSettings | null }>(
    "/api/smartbin/threshold"
  );
  return body.data;
}

/**
 * Simpan threshold bau baru via `POST /api/smartbin/threshold`.
 * @param gasThreshold Nilai ADC 0–4095 (divalidasi juga di server).
 */
export async function saveThreshold(gasThreshold: number): Promise<ThresholdSettings> {
  const body = await fetchJson<{ ok: boolean; data: ThresholdSettings }>(
    "/api/smartbin/threshold",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gasThreshold }),
    }
  );
  return body.data;
}
