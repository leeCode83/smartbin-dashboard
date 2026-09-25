import { supabase } from "@/lib/supabase";

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
