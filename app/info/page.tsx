import {
  ArrowsHorizontal,
  Cpu,
  Gear,
  Monitor,
  Target,
  UsersThree,
  Wind,
} from "@phosphor-icons/react/dist/ssr";

export default function InfoProject() {
  return (
    <div className="space-y-7">
      {/* HEADER */}
      <header className="rise">
        <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Informasi Proyek
        </h1>
        <p className="mt-2 text-sm text-hush">
          Dokumentasi teknis dan profil tim pengembang KOPDES.
        </p>
      </header>

      <div className="rise [animation-delay:120ms] rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] p-2 shadow-[0_24px_60px_-36px_rgb(0_0_0/0.8)]">
        <div className="space-y-8 rounded-[1.375rem] border border-white/[0.05] bg-panel/70 p-6 md:p-8">
          {/* SEKSI 1: DESKRIPSI & SCOPE */}
          <section>
            <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold text-ink">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-mint ring-1 ring-brand/20">
                <Target size={17} weight="light" />
              </span>
              Deskripsi & Batasan Sistem
            </h2>
            <p className="max-w-[65ch] text-sm leading-relaxed text-hush">
              <strong className="font-semibold text-ink">KOPDES (Kotak Pemilah Otomatis)</strong>{" "}
              versi saat ini difokuskan pada pemantauan <em>Basic Sensing & Monitoring</em> berbasis
              Internet of Things (IoT). Sistem dapat membaca jarak pengguna untuk membuka pintu
              secara otomatis, memantau persentase kepenuhan tong, serta mendeteksi kepekatan
              gas/bau secara <em>real-time</em>.
            </p>
            <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-4">
              <span className="mb-1 block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-amber-200">
                Catatan Pengembangan (Future Work)
              </span>
              <p className="text-sm leading-relaxed text-amber-200/85">
                Sistem klasifikasi jenis sampah (Organik/Anorganik) menggunakan{" "}
                <strong className="font-semibold">AI Vision / Machine Learning</strong> belum
                diaktifkan pada fase ini dan direncanakan sebagai tahap pengembangan lanjutan
                (Assignment 2).
              </p>
            </div>
          </section>

          <div className="border-t border-white/[0.06]" />

          {/* SEKSI 2: HARDWARE */}
          <section>
            <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold text-ink">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-mint ring-1 ring-brand/20">
                <Cpu size={17} weight="light" />
              </span>
              Spesifikasi Hardware (IoT)
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { nama: "ESP32", fungsi: "Mikrokontroler & Modul Wi-Fi", icon: Cpu },
                { nama: "Ultrasonik HC-SR04", fungsi: "Deteksi Jarak & Kepenuhan", icon: ArrowsHorizontal },
                { nama: "Sensor Gas MQ-135", fungsi: "Deteksi Kepekatan Bau (ADC)", icon: Wind },
                { nama: "Servo SG90", fungsi: "Aktuator Mekanisme Gate", icon: Gear },
                { nama: "Modul LCD", fungsi: "Display Indikator Fisik", icon: Monitor },
              ].map((hw, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors duration-300 ease-fluid hover:bg-white/[0.04]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-mint ring-1 ring-brand/20">
                    <hw.icon size={15} weight="light" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{hw.nama}</h3>
                    <p className="mt-0.5 text-xs text-hush">{hw.fungsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-white/[0.06]" />

          {/* SEKSI 3: TIM */}
          <section>
            <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold text-ink">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-mint ring-1 ring-brand/20">
                <UsersThree size={17} weight="light" />
              </span>
              Profil Tim Pengembang
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { nama: "Brian", peran: "Team Leader & Hardware Engineering", inisial: "KB", color: "bg-orange-400/15 text-orange-200 ring-orange-300/25" },
                { nama: "Lean", peran: "Backend API & Logic", inisial: "LN", color: "bg-violet-400/15 text-violet-200 ring-violet-300/25" },
                { nama: "Sirajudin", peran: "Frontend & UI/UX Dashboard", inisial: "SJ", color: "bg-sky-400/15 text-sky-200 ring-sky-300/25" },
                { nama: "Komang", peran: "Hardware Engineering", inisial: "KB", color: "bg-red-400/15 text-red-200 ring-red-300/25" },
                { nama: "Daniel", peran: "Physical Prototyping", inisial: "DN", color: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25" },
              ].map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-semibold ring-1 ${member.color}`}
                  >
                    {member.inisial}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{member.nama}</h3>
                    <p className="mt-0.5 text-xs text-hush">{member.peran}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
