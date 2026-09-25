import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./Navigation";

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
        
        <Navigation />

        <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
          
          <header className="h-16 md:h-20 bg-white shadow-sm border-b border-green-100/50 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0">
            <h1 className="font-extrabold text-lg md:text-xl text-slate-800 tracking-tight truncate">Monitoring Sistem</h1>
            {/* Gimik status koneksi dihapus dari sini */}
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}