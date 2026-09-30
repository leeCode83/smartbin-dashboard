import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#08110d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh bg-abyss text-ink md:flex md:h-dvh md:overflow-hidden">
        {/* Lapisan atmosfer: pendaran emerald + grain, murni dekoratif */}
        <div aria-hidden className="ambient pointer-events-none fixed inset-0" />
        <div aria-hidden className="grain pointer-events-none fixed inset-0" />

        <Navigation />

        <div className="flex min-w-0 flex-1 flex-col md:h-dvh">
          <main className="flex-1 overflow-y-auto px-4 pb-36 pt-8 sm:px-6 md:px-10 md:pb-12 md:pt-10">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
