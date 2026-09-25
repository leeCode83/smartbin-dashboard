"use client";

import { useState } from "react";

export default function Dashboard() {
  // 1. KONTRAK DATA (JSON untuk API Backend)
  const [sensorData] = useState({
    tong_organik: 62,
    tong_anorganik: 11,
    gas_adc: 2500, // Threshold: >= 2000 (BAU)
    jarak_user_cm: 3.9 // Threshold: <= 5 cm (TERBUKA)
  });

  // 2. LOGIKA KONDISIONAL (Otomatisasi UI)
  const isBau = sensorData.gas_adc >= 2000;
  const isServoBuka = sensorData.jarak_user_cm <= 5;

  const dataTong = [
    { id: "organik", nama: "Organik", persen: sensorData.tong_organik },
    { id: "anorganik", nama: "Anorganik", persen: sensorData.tong_anorganik },
  ].map(tong => {
    const isFull = tong.persen >= 100;
    return {
      ...tong,
      status: isFull ? "FULL" : "TERSEDIA",
      color: isFull ? "bg-red-500" : (tong.id === "organik" ? "bg-emerald-500" : "bg-blue-500"),
      lightBg: isFull ? "bg-red-50" : (tong.id === "organik" ? "bg-emerald-50" : "bg-blue-50"),
      textColor: isFull ? "text-red-700" : (tong.id === "organik" ? "text-emerald-700" : "text-blue-700"),
    };
  });

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
            {isServoBuka ? "TERBUKA" : "TERTUTUP"}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: KAPASITAS TONG */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">🗑️ Kapasitas Tempat Sampah</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">HC-SR04</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dataTong.map((item) => (
              <div key={item.id} className={`${item.lightBg} p-4 rounded-xl border border-white/50`}>
                <div className="flex justify-between items-center mb-4">
                  <span className={`font-semibold ${item.textColor}`}>{item.nama}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 bg-white rounded-md shadow-sm ${item.textColor}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className={`text-3xl font-extrabold ${item.textColor}`}>{item.persen}%</span>
                </div>
                <div className="w-full bg-white/60 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500 ease-out`} style={{ width: `${item.persen}%` }}></div>
                </div>
              </div>
            ))}
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
        </div>
      </div>

      {/* NEW SECTION: DATA SENSOR REAL-TIME (Sesuai Request Lean) */}
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
                <td className="px-4 py-3 font-medium text-slate-800">HC-SR04 (Tong Organik)</td>
                <td className="px-4 py-3">Persentase Kepenuhan</td>
                <td className="px-4 py-3 font-bold text-emerald-600">{sensorData.tong_organik}%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">HC-SR04 (Tong Anorganik)</td>
                <td className="px-4 py-3">Persentase Kepenuhan</td>
                <td className="px-4 py-3 font-bold text-blue-600">{sensorData.tong_anorganik}%</td>
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