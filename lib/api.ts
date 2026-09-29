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
