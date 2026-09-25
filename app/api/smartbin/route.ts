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

function classifyGas(gasValue: number): string {
  for (const range of GAS_RANGES) {
    if (gasValue < range.max) {
      return range.label;
    }
  }
  return "TIDAK DIKETAHUI";
}

// Sensor HC-SR04 mengirim -1 sebagai tanda error
function formatSensor(value: number, unit: string): string {
  return value < 0 ? "SENSOR ERROR" : `${value}${unit}`;
}

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
  const timestamp = new Date().toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "medium",
  });

  console.log(
    [
      "",
      `[SMARTBIN] ${timestamp}`,
      `  Person   : ${formatSensor(data.personDistance, " cm")}`,
      `  Bin      : ${formatSensor(data.fullness, "%")} (jarak ${formatSensor(data.fullDistance, " cm")})`,
      `  Gas      : ${data.gasValue} → ${gasLabel}`,
      `  Servo    : ${data.servoTriggered ? "TRIGGERED" : "READY"}`,
      "",
    ].join("\n")
  );

  return Response.json({ ok: true, gasLabel });
}
