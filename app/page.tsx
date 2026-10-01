"use client";

import { useEffect, useState } from "react";
import {
  Broadcast,
  SpinnerGap,
  Trash,
  WarningCircle,
  WifiSlash,
  Wind,
} from "@phosphor-icons/react";
import { getSmartbinNow, getThreshold, saveThreshold } from "@/lib/api";
import type { SmartBinReading } from "@/lib/smartbin";

// Tinggi dalam tong (cm) untuk konversi fullDistance -> persentase kepenuhan.
// Sesuaikan dengan tinggi asli tong sampah.
const TINGGI_TONG_CM = 30;

export default function Dashboard() {
  const [reading, setReading] = useState<SmartBinReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [thresholdBau, setThresholdBau] = useState(2000);
  const [menyimpan, setMenyimpan] = useState(false);
  const [feedbackSimpan, setFeedbackSimpan] = useState<{
    tipe: "sukses" | "gagal";
    pesan: string;
  } | null>(null);

  // Polling setiap 5 detik; endpoint /now tidak butuh parameter dan selalu
  // mengembalikan bacaan terbaru, jadi cukup satu sumber data.
  useEffect(() => {
    let aktif = true;

    async function muat() {
      try {
        const data = await getSmartbinNow();
        if (!aktif) return;
        setReading(data);
        setError(null);
      } catch (err) {
        if (!aktif) return;
        setError(err instanceof Error ? err.message : "Gagal memuat data sensor");
      } finally {
        if (aktif) setIsLoading(false);
      }
    }

    // Threshold dibaca sekali saat mount; gagal load cukup pakai default 2000.
    async function muatThreshold() {
      try {
        const data = await getThreshold();
        if (aktif && data) setThresholdBau(data.gasThreshold);
      } catch (err) {
        console.error("Gagal memuat threshold:", err);
      }
    }

    muat();
    muatThreshold();
    const interval = setInterval(muat, 5000);
    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, []);

  // -1 berarti sensor HC-SR04 error -> dianggap tidak ada nilai.
  const kapasitas =
    reading && reading.fullDistance >= 0
      ? Math.min(
          100,
          Math.max(0, ((TINGGI_TONG_CM - reading.fullDistance) / TINGGI_TONG_CM) * 100)
        )
      : null;
  const gasAdc = reading ? Math.round(reading.gasValue) : null;
  const jarakUser = reading && reading.personDistance >= 0 ? reading.personDistance : null;

  // 2. LOGIKA KONDISIONAL
  const isBau = gasAdc !== null && gasAdc >= thresholdBau;
  const isFull = kapasitas !== null && kapasitas >= 100;

  const kapasitasTone =
    kapasitas === null ? "text-hush" : isFull ? "text-red-300" : "text-mint";
  const kapasitasBg =
    kapasitas === null
      ? "border-white/[0.06] bg-white/[0.02]"
      : isFull
        ? "border-red-400/25 bg-red-400/[0.07]"
        : "border-brand/20 bg-brand/[0.06]";
  const kapasitasBar =
    kapasitas === null
      ? "bg-white/15"
      : isFull
        ? "bg-red-400 shadow-[0_0_16px_rgb(248_113_113/0.45)]"
        : "bg-gradient-to-r from-brand to-mint shadow-[0_0_16px_rgb(16_185_129/0.35)]";
  const kapasitasBadge =
    kapasitas === null
      ? "border-white/[0.08] bg-white/[0.04] text-hush"
      : isFull
        ? "border-red-400/30 bg-red-400/10 text-red-200"
        : "border-brand/30 bg-brand/10 text-mint";
  const gasAngkaTone =
    gasAdc === null ? "text-hush" : isBau ? "text-red-300" : "text-ink";
  const gasPill =
    gasAdc === null
      ? "border-white/[0.08] bg-white/[0.04] text-hush"
      : isBau
        ? "border-red-400/30 bg-red-400/10 text-red-200"
        : "border-brand/30 bg-brand/10 text-mint";
  const gasTabelTone =
    gasAdc === null ? "text-hush" : isBau ? "text-red-300" : "text-mint";

  const handleSimpanThreshold = async () => {
    if (!Number.isFinite(thresholdBau) || thresholdBau < 0 || thresholdBau > 4095) {
      setFeedbackSimpan({ tipe: "gagal", pesan: "Harus angka 0–4095" });
      return;
    }
    setMenyimpan(true);
    setFeedbackSimpan(null);
    try {
      const data = await saveThreshold(thresholdBau);
      setThresholdBau(data.gasThreshold);
      setFeedbackSimpan({ tipe: "sukses", pesan: "Tersimpan" });
    } catch (err) {
      setFeedbackSimpan({
        tipe: "gagal",
        pesan: err instanceof Error ? err.message : "Gagal menyimpan",
      });
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* HEADER */}
      <header className="rise flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Status Kapasitas & Sensor
          </h1>
          <p className="mt-2 text-sm text-hush">Pantauan real-time dari ESP32 Kopdes</p>
        </div>
      </header>

      {/* STATUS SUMBER DATA */}
      {error ? (
        <div className="rise [animation-delay:60ms] flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.07] px-5 py-4">
          <WarningCircle size={18} weight="light" className="mt-0.5 shrink-0 text-red-300" />
          <p className="text-sm font-medium text-red-200">
            Gagal memuat data sensor: {error}, mencoba lagi otomatis…
          </p>
        </div>
      ) : !reading ? (
        isLoading ? (
          <div className="rise [animation-delay:60ms] flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
            <SpinnerGap
              size={18}
              weight="light"
              className="mt-0.5 shrink-0 animate-spin text-mint motion-reduce:animate-none"
            />
            <p className="text-sm font-medium text-hush">Memuat data sensor…</p>
          </div>
        ) : (
          <div className="rise [animation-delay:60ms] flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] px-5 py-4">
            <WifiSlash size={18} weight="light" className="mt-0.5 shrink-0 text-amber-200" />
            <p className="text-sm font-medium text-amber-200/90">
              Belum ada data dari ESP32, menunggu bacaan pertama…
            </p>
          </div>
        )
      ) : null}

      {/* MAIN GRID */}
      {isLoading && !reading ? (
        /* Skeleton memuat pertama: mengikuti bentuk layout akhir */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <div className="h-72 animate-pulse rounded-[1.75rem] border border-white/[0.06] bg-white/[0.03] motion-reduce:animate-none lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-[1.75rem] border border-white/[0.06] bg-white/[0.03] motion-reduce:animate-none" />
          <div className="h-52 animate-pulse rounded-[1.75rem] border border-white/[0.06] bg-white/[0.03] motion-reduce:animate-none lg:col-span-3" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {/* CARD 1: KAPASITAS TONG (1 Kompartemen Sentral) */}
          <section className="rise [animation-delay:120ms] rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] p-2 shadow-[0_24px_60px_-36px_rgb(0_0_0/0.8)] lg:col-span-2">
            <div className="flex h-full flex-col rounded-[1.375rem] border border-white/[0.05] bg-panel/70 p-6 md:p-7">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-mint ring-1 ring-brand/20">
                    <Trash size={17} weight="light" />
                  </span>
                  <h2 className="text-sm font-semibold text-ink">Kapasitas Tempat Sampah</h2>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-hush">
                  HC-SR04
                </span>
              </div>

              <div className={`flex flex-1 flex-col justify-center rounded-2xl border p-6 md:p-8 ${kapasitasBg}`}>
                <div className="mb-6 flex items-center justify-between">
                  <span className={`text-base font-semibold ${kapasitasTone}`}>Kopdes Bin</span>
                  <span
                    className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-wide ${kapasitasBadge}`}
                  >
                    {kapasitas === null ? "—" : isFull ? "FULL" : "TERSEDIA"}
                  </span>
                </div>
                <div className="mb-5">
                  <span
                    className={`font-mono text-6xl font-semibold tracking-tighter tabular-nums md:text-7xl ${kapasitasTone}`}
                  >
                    {kapasitas === null ? "—" : `${Math.round(kapasitas)}%`}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-fluid ${kapasitasBar}`}
                    style={{ width: `${kapasitas ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* CARD 2: KEPEKATAN GAS */}
          <section className="rise [animation-delay:200ms] rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] p-2 shadow-[0_24px_60px_-36px_rgb(0_0_0/0.8)]">
            <div className="flex h-full flex-col rounded-[1.375rem] border border-white/[0.05] bg-panel/70 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-mint ring-1 ring-brand/20">
                    <Wind size={17} weight="light" />
                  </span>
                  <h2 className="text-sm font-semibold text-ink">Kepekatan Gas</h2>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-hush">
                  MQ-135
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
                <span
                  className={`font-mono text-5xl font-semibold tracking-tighter tabular-nums ${gasAngkaTone}`}
                >
                  {gasAdc === null ? "—" : gasAdc}
                  <span className="ml-1.5 text-base font-medium tracking-normal text-hush">ADC</span>
                </span>
                <span className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${gasPill}`}>
                  {gasAdc === null ? "—" : isBau ? "BAU TERDETEKSI" : "TIDAK BAU"}
                </span>
              </div>

              {/* KONTROL THRESHOLD */}
              <div className="mt-2 border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-hush">
                    Batas Pemicu
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={thresholdBau}
                      onChange={(e) => setThresholdBau(Number(e.target.value))}
                      className="w-24 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-center font-mono text-sm font-semibold text-ink transition-colors duration-300 ease-fluid focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                    <button
                      onClick={handleSimpanThreshold}
                      disabled={menyimpan}
                      className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-[#04140c] transition-all duration-300 ease-fluid hover:bg-mint active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
                {feedbackSimpan && (
                  <p
                    className={`mt-2 text-right text-[11px] font-semibold ${
                      feedbackSimpan.tipe === "sukses" ? "text-mint" : "text-red-300"
                    }`}
                  >
                    {feedbackSimpan.pesan}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* DATA SENSOR REAL-TIME */}
          <section className="rise [animation-delay:280ms] rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] p-2 shadow-[0_24px_60px_-36px_rgb(0_0_0/0.8)] lg:col-span-3">
            <div className="rounded-[1.375rem] border border-white/[0.05] bg-panel/70 p-6 md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-mint ring-1 ring-brand/20">
                  <Broadcast size={17} weight="light" />
                </span>
                <h2 className="text-sm font-semibold text-ink">Data Mentah Sensor</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-hush">
                        Hardware
                      </th>
                      <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-hush">
                        Parameter
                      </th>
                      <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-hush">
                        Nilai Saat Ini
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/[0.05] transition-colors duration-300 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-medium text-ink">HC-SR04 (Tong Sampah)</td>
                      <td className="px-4 py-3.5 text-hush">Persentase Kepenuhan</td>
                      <td className={`px-4 py-3.5 font-mono font-semibold tabular-nums ${kapasitasTone}`}>
                        {kapasitas === null ? "—" : `${Math.round(kapasitas)}%`}
                      </td>
                    </tr>
                    <tr className="border-b border-white/[0.05] transition-colors duration-300 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-medium text-ink">HC-SR04 (Deteksi User)</td>
                      <td className="px-4 py-3.5 text-hush">Jarak Objek</td>
                      <td className="px-4 py-3.5 font-mono font-semibold tabular-nums text-ink">
                        {jarakUser === null ? "—" : `${jarakUser.toFixed(1)} cm`}
                      </td>
                    </tr>
                    <tr className="transition-colors duration-300 hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-medium text-ink">MQ-135</td>
                      <td className="px-4 py-3.5 text-hush">Tingkat Kepekatan Gas</td>
                      <td className={`px-4 py-3.5 font-mono font-semibold tabular-nums ${gasTabelTone}`}>
                        {gasAdc === null ? "—" : `${gasAdc} ADC`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
