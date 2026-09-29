"use client";

import { useEffect, useState } from "react";
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
  const isServoBuka = jarakUser !== null && jarakUser <= 5;
  const isFull = kapasitas !== null && kapasitas >= 100;

  const kapasitasTone =
    kapasitas === null ? "text-slate-400" : isFull ? "text-red-700" : "text-emerald-700";
  const kapasitasBg =
    kapasitas === null
      ? "bg-slate-50 border-slate-100"
      : isFull
        ? "bg-red-50 border-red-100"
        : "bg-emerald-50 border-emerald-100";
  const kapasitasBar =
    kapasitas === null ? "bg-slate-300" : isFull ? "bg-red-500" : "bg-emerald-500";

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Status Kapasitas & Sensor</h2>
          <p className="text-sm text-slate-500 mt-1">Pantauan real-time dari ESP32 Kopdes</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm inline-flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Sistem Gate:</span>
          <span className={`text-sm font-bold ${jarakUser === null ? 'text-slate-400' : isServoBuka ? 'text-green-600' : 'text-slate-800'}`}>
            {jarakUser === null ? "—" : isServoBuka ? "TERBUKA (0°)" : "TERTUTUP (90°)"}
          </span>
        </div>
      </div>

      {/* STATUS SUMBER DATA */}
      {error ? (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700">
          Gagal memuat data sensor: {error} — mencoba lagi otomatis…
        </div>
      ) : !reading ? (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-700">
          {isLoading ? "Memuat data sensor…" : "Belum ada data dari ESP32 — menunggu bacaan pertama…"}
        </div>
      ) : null}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* CARD 1: KAPASITAS TONG (1 Kompartemen Sentral) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">🗑️ Kapasitas Tempat Sampah</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">HC-SR04</span>
          </div>

          <div className={`p-8 rounded-2xl border ${kapasitasBg} flex-1 flex flex-col justify-center`}>
            <div className="flex justify-between items-center mb-6">
              <span className={`font-semibold text-xl ${kapasitasTone}`}>Kopdes Bin</span>
              <span className={`text-xs font-bold px-3 py-1.5 bg-white rounded-md shadow-sm ${kapasitasTone}`}>
                {kapasitas === null ? "—" : isFull ? "FULL" : "TERSEDIA"}
              </span>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className={`text-6xl font-extrabold tracking-tighter ${kapasitasTone}`}>{kapasitas === null ? "—" : `${Math.round(kapasitas)}%`}</span>
            </div>
            <div className="w-full bg-white/60 h-4 rounded-full overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all duration-500 ease-out ${kapasitasBar}`} style={{ width: `${kapasitas ?? 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* CARD 2: KEPEKATAN GAS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">💨 Kepekatan Gas</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">MQ-135</span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
            <span className={`text-5xl font-extrabold tracking-tighter mb-2 ${gasAdc === null ? 'text-slate-300' : isBau ? 'text-red-600' : 'text-slate-800'}`}>
              {gasAdc === null ? "—" : gasAdc} <span className={`text-lg font-medium ${isBau ? 'text-red-400' : 'text-slate-400'}`}>ADC</span>
            </span>
            <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${gasAdc === null ? 'bg-slate-50 text-slate-400 border-slate-200' : isBau ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
              {gasAdc === null ? "—" : isBau ? "BAU TERDETEKSI" : "TIDAK BAU"}
            </span>
          </div>

          {/* KONTROL THRESHOLD */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Batas Pemicu</span>
               <div className="flex items-center gap-2">
                  <input type="number" value={thresholdBau} onChange={(e) => setThresholdBau(Number(e.target.value))} className="w-20 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-center font-bold text-slate-700 bg-slate-50"/>
                  <button onClick={handleSimpanThreshold} disabled={menyimpan} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-md hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Simpan</button>
               </div>
            </div>
            {feedbackSimpan && (
              <p className={`mt-2 text-[11px] font-semibold text-right ${feedbackSimpan.tipe === "sukses" ? "text-emerald-600" : "text-red-600"}`}>
                {feedbackSimpan.pesan}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* DATA SENSOR REAL-TIME */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">📡 Data Mentah Sensor</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Hardware</th>
                <th className="px-4 py-3 font-semibold">Parameter</th>
                <th className="px-4 py-3 font-semibold">Nilai Saat Ini</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">HC-SR04 (Tong Sampah)</td>
                <td className="px-4 py-3">Persentase Kepenuhan</td>
                <td className={`px-4 py-3 font-bold ${kapasitasTone}`}>{kapasitas === null ? "—" : `${Math.round(kapasitas)}%`}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">HC-SR04 (Deteksi User)</td>
                <td className="px-4 py-3">Jarak Objek</td>
                <td className="px-4 py-3 font-bold text-slate-800">{jarakUser === null ? "—" : `${jarakUser.toFixed(1)} cm`}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">MQ-135</td>
                <td className="px-4 py-3">Tingkat Kepekatan Gas</td>
                <td className={`px-4 py-3 font-bold ${gasAdc === null ? 'text-slate-400' : isBau ? 'text-red-600' : 'text-emerald-600'}`}>{gasAdc === null ? "—" : `${gasAdc} ADC`}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
