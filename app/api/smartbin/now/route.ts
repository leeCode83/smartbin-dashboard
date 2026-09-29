import { supabase } from "@/lib/supabase";
import { toReading, type SmartBinRow } from "@/lib/smartbin";

/**
 * Reading sensor terbaru (setara `ORDER BY created_at DESC LIMIT 1`,
 * disupport index `smartbin_readings_created_at_idx`).
 *
 * @returns 200 `{ ok, data }` dengan reading terbaru dalam bentuk camelCase,
 *          atau `data: null` saat tabel masih kosong; 500 saat gagal query.
 */
export async function GET() {
  const { data, error } = await supabase
    .from("smartbin_readings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return Response.json(
      { ok: false, error: `Gagal membaca database: ${error.message}` },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    data: data ? toReading(data as SmartBinRow) : null,
  });
}
