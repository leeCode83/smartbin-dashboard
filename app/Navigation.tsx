"use client"; // Wajib agar komponen bisa membaca URL aktif

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartLine, Info, Recycle } from "@phosphor-icons/react";

const MENU = [
  { href: "/", label: "Dashboard", icon: ChartLine },
  { href: "/info", label: "Info Project", icon: Info },
] as const;

export default function Navigation() {
  const pathname = usePathname(); // Membaca posisi URL saat ini

  return (
    <>
      {/* SIDEBAR (Desktop Only) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.02] px-5 py-8 md:flex lg:w-64">
        <div className="mb-10 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-mint ring-1 ring-brand/25">
            <Recycle size={20} weight="light" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-[0.22em] text-ink">KOPDES</p>
            <p className="mt-0.5 text-[11px] text-hush">Smart Bin Monitoring</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {MENU.map(({ href, label, icon: Icon }) => {
            const aktif = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-300 ease-fluid active:scale-[0.98] ${
                  aktif
                    ? "bg-brand/10 font-semibold text-mint ring-1 ring-brand/20"
                    : "font-medium text-hush hover:bg-white/[0.04] hover:text-ink"
                }`}
              >
                <Icon size={17} weight={aktif ? "fill" : "light"} className="shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* BOTTOM NAV (Mobile Only) — island kaca mengambang */}
      <nav className="fixed inset-x-4 bottom-4 z-40 flex gap-1 rounded-2xl border border-white/10 bg-panel/85 p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl md:hidden">
        {MENU.map(({ href, label, icon: Icon }) => {
          const aktif = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition-all duration-300 ease-fluid active:scale-[0.97] ${
                aktif
                  ? "bg-brand/10 font-semibold text-mint"
                  : "font-medium text-hush"
              }`}
            >
              <Icon size={18} weight={aktif ? "fill" : "light"} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
