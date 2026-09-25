"use client";

import { useState } from "react";

export default function Dashboard() {
  // KONTRAK DATA: Diperbarui untuk mendukung 3 kompartemen tong sampah.
  // Sampaikan ke backend untuk mengirim data 'tong' dalam bentuk array seperti ini.
  const [sensorData] = useState({
    tong: [
      { id: "organik", nama: "Organik", persen: 62, status: "Tersedia", color: "bg-emerald-500", lightBg: "bg-emerald-50", text: "text-emerald-700" },
      { id: "anorganik", nama: "Anorganik", persen: 11, status: "Tersedia", color: "bg-blue-500", lightBg: "bg-blue-50", text: "text-blue-700" },
      { id: "kertas", nama: "Kertas", persen: 91, status: "Hampir Penuh", color: "bg-amber-500", lightBg: "bg-amber-50", text: "text-amber-700" },
    ],
    udara: {
      ppm: 0,
      kategori: "UDARA BERSIH"
    },
    hardware: {
      servo: "TRIGGERED",
      jarakOrang: 3.9
    }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Status Kapasitas & Sensor</h2>
          <p className="text-sm text-slate-300 mt-1">Pantauan real-time dari ESP32 Kopdes</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm inline-flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Deteksi User:</span>
          <span className ="text-sm font-bold text-slate-800">{sensorData.hardware.jarakOrang} cm</span>
        </div>
      </div>

      {/* MAIN GRID: 3 Kolom di Desktop, 1 Kolom di Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: KAPASITAS TONG (3 Kompartemen) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              🗑️ Kapasitas Tempat Sampah
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">HC-SR04</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sensorData.tong.map((item) => (
              <div key={item.id} className={`${item.lightBg} p-4 rounded-xl border border-white/50`}>
                <div className="flex justify-between items-center mb-4">
                  <span className={`font-semibold ${item.text}`}>{item.nama}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 bg-white rounded-md shadow-sm ${item.text}`}>
                    {item.status}
                  </span>
                </div>
                
                {/* Minimalist Linear Gauge */}
                <div className="flex items-end gap-2 mb-2">
                  <span className={`text-3xl font-extrabold ${item.text}`}>{item.persen}%</span>
                </div>
                <div className="w-full bg-white/60 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${item.persen}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: KUALITAS UDARA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              💨 Deteksi Gas & Bau

            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">MQ-135</span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
            <span className="text-5xl font-extrabold text-slate-800 tracking-tighter mb-2">
              {sensorData.udara.ppm} <span className="text-lg text-slate-400 font-medium">PPM</span>
            </span>
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              {sensorData.udara.kategori}
            </span>
          </div>
        </div>

        {/* CARD 3: STATUS AKTUATOR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              ⚙️ Sistem Gate
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">SG90</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-600">Status Gate / Pemilah</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md uppercase tracking-wider">
              {sensorData.hardware.servo}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}