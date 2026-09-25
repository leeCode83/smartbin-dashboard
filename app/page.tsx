"use client";

import { useState } from "react";

export default function Dashboard() {
  // 1. KONTRAK DATA FINAL (Hanya 1 Tong untuk Assignment 1)
  const [sensorData] = useState({
    kapasitas_tong: 62, 
    gas_adc: 2500,
    jarak_user_cm: 3.9
  });

  const [thresholdBau, setThresholdBau] = useState(2000);

  // 2. LOGIKA KONDISIONAL
  const isBau = sensorData.gas_adc >= thresholdBau;
  const isServoBuka = sensorData.jarak_user_cm <= 5;
  const isFull = sensorData.kapasitas_tong >= 100;

  const handleSimpanThreshold = () => {
    alert(`Threshold bau disetel ke: ${thresholdBau} ADC.\n(Nanti tombol ini menembak API POST ke Backend)`);
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
          <span className={`text-sm font-bold ${isServoBuka ? 'text-green-600' : 'text-slate-800'}`}>
            {isServoBuka ? "TERBUKA (0°)" : "TERTUTUP (90°)"}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: KAPASITAS TONG (1 Kompartemen Sentral) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">🗑️ Kapasitas Tempat Sampah</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">HC-SR04</span>
          </div>
          
          <div className={`p-8 rounded-2xl border ${isFull ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'} flex-1 flex flex-col justify-center`}>
            <div className="flex justify-between items-center mb-6">
              <span className={`font-semibold text-xl ${isFull ? 'text-red-700' : 'text-emerald-700'}`}>Kopdes Bin</span>
              <span className={`text-xs font-bold px-3 py-1.5 bg-white rounded-md shadow-sm ${isFull ? 'text-red-700' : 'text-emerald-700'}`}>
                {isFull ? "FULL" : "TERSEDIA"}
              </span>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className={`text-6xl font-extrabold tracking-tighter ${isFull ? 'text-red-700' : 'text-emerald-700'}`}>{sensorData.kapasitas_tong}%</span>
            </div>
            <div className="w-full bg-white/60 h-4 rounded-full overflow-hidden shadow-inner">
              <div className={`h-full rounded-full transition-all duration-500 ease-out ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${sensorData.kapasitas_tong}%` }}></div>
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
            <span className={`text-5xl font-extrabold tracking-tighter mb-2 ${isBau ? 'text-red-600' : 'text-slate-800'}`}>
              {sensorData.gas_adc} <span className={`text-lg font-medium ${isBau ? 'text-red-400' : 'text-slate-400'}`}>ADC</span>
            </span>
            <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${isBau ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
              {isBau ? "BAU TERDETEKSI" : "TIDAK BAU"}
            </span>
          </div>

          {/* KONTROL THRESHOLD */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase">Batas Pemicu</span>
             <div className="flex items-center gap-2">
                <input type="number" value={thresholdBau} onChange={(e) => setThresholdBau(Number(e.target.value))} className="w-20 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-center font-bold text-slate-700 bg-slate-50"/>
                <button onClick={handleSimpanThreshold} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-md hover:bg-slate-700 transition-colors shadow-sm">Simpan</button>
             </div>
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
                <td className="px-4 py-3 font-bold text-emerald-600">{sensorData.kapasitas_tong}%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">HC-SR04 (Deteksi User)</td>
                <td className="px-4 py-3">Jarak Objek</td>
                <td className="px-4 py-3 font-bold text-slate-800">{sensorData.jarak_user_cm} cm</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">MQ-135</td>
                <td className="px-4 py-3">Tingkat Kepekatan Gas</td>
                <td className={`px-4 py-3 font-bold ${isBau ? 'text-red-600' : 'text-emerald-600'}`}>{sensorData.gas_adc} ADC</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}