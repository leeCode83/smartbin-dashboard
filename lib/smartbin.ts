/** Bentuk baris tabel `smartbin_readings` sebagaimana dikembalikan database (snake_case). */
export type SmartBinRow = {
  id: number;
  created_at: string;
  person_distance: number;
  full_distance: number;
  fullness_organik: number;
  // null = baris lama sebelum migrasi 3 kompartemen.
  fullness_anorganik: number | null;
  fullness_kertas: number | null;
  gas_value: number;
  gas_label: string;
  servo_triggered: boolean;
};

/** Bentuk reading yang dikonsumsi konsumen API (camelCase, konsisten dengan payload POST). */
export type SmartBinReading = {
  id: number;
  createdAt: string;
  personDistance: number;
  fullDistance: number;
  fullnessOrganik: number;
  fullnessAnorganik: number | null;
  fullnessKertas: number | null;
  gasValue: number;
  gasLabel: string;
  servoTriggered: boolean;
};

/**
 * Ubah baris hasil query `smartbin_readings` (snake_case) menjadi bentuk API
 * camelCase agar konsisten dengan kontrak POST.
 *
 * @param row Baris mentah dari Supabase.
 * @returns Reading dalam bentuk camelCase.
 */
export function toReading(row: SmartBinRow): SmartBinReading {
  return {
    id: row.id,
    createdAt: row.created_at,
    personDistance: row.person_distance,
    fullDistance: row.full_distance,
    fullnessOrganik: row.fullness_organik,
    fullnessAnorganik: row.fullness_anorganik,
    fullnessKertas: row.fullness_kertas,
    gasValue: row.gas_value,
    gasLabel: row.gas_label,
    servoTriggered: row.servo_triggered,
  };
}
