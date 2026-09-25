"use client"; // Wajib agar komponen bisa membaca URL aktif

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname(); // Membaca posisi URL saat ini

  // Fungsi penentu warna tombol (Aktif vs Inaktif)
  const getDesktopClass = (path: string) => 
    pathname === path 
      ? "px-4 py-2.5 bg-green-50 text-green-800 rounded-xl font-semibold transition-colors"
      : "px-4 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors";

  const getMobileClass = (path: string) =>
    pathname === path
      ? "flex flex-col items-center gap-1 text-green-700"
      : "flex flex-col items-center gap-1 text-slate-400";

  return (
    <>
      {/* SIDEBAR (Desktop Only) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-5 shrink-0 z-10 shadow-sm">
        <div className="font-bold text-2xl text-green-700 mb-2 flex items-center gap-2">
          🌱 KOPDES
        </div>
        <p className="text-xs text-slate-400 mb-8 font-medium">Kotak Otomatis Pemilah Dengan ESP32 & Server</p>
        
        <nav className="flex flex-col gap-2">
          <Link href="/" className={getDesktopClass("/")}>
            📊 Dashboard
          </Link>
          <Link href="/info" className={getDesktopClass("/info")}>
            ℹ️ Info Project
          </Link>
        </nav>
      </aside>

      {/* BOTTOM NAV (Mobile Only) - Akan dipanggil di dalam wrapper utama */}
      <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around p-3 shrink-0 pb-safe z-20">
        <Link href="/" className={getMobileClass("/")}>
          <span className="text-lg">📊</span>
          <span className="text-[10px] font-bold">Dashboard</span>
        </Link>
        <Link href="/info" className={getMobileClass("/info")}>
          <span className="text-lg">ℹ️</span>
          <span className="text-[10px] font-medium">Info</span>
        </Link>
      </nav>
    </>
  );
}