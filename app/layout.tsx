import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./Navigation"; // Import komponen navigasi yang baru dibuat

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kopdes Dashboard",
  description: "Kotak Otomatis Pemilah Dengan ESP32 & Server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-[#FDFBF7] text-slate-800 flex h-screen overflow-hidden">
        
        {/* Memanggil Sidebar dari file Navigation.tsx */}
        <Navigation />

        <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
          
          {/* HEADER */}
          <header className="h-16 md:h-20 bg-white shadow-sm border-b border-green-100/50 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0">
            <h1 className="font-extrabold text-lg md:text-xl text-slate-800 tracking-tight truncate">Monitoring Sistem</h1>
            
            <div className="flex items-center gap-2 md:gap-3">
              <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 md:py-2 rounded-full border border-green-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="hidden md:inline">ESP32 Connected</span>
                <span className="md:hidden">Online</span>
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}