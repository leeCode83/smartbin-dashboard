export default function InfoProject() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Informasi Proyek</h2>
        <p className="text-sm text-slate-500 mt-1">Dokumentasi teknis dan profil tim pengembang KOPDES.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-8">
        
        {/* SEKSI 1: DESKRIPSI & SCOPE */}
        <section>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
            🎯 Deskripsi & Batasan Sistem
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            <strong>KOPDES (Kotak Pemilah Otomatis)</strong> versi saat ini difokuskan pada pemantauan <em>Basic Sensing & Monitoring</em> berbasis Internet of Things (IoT). Sistem dapat membaca jarak pengguna untuk membuka pintu secara otomatis, memantau persentase kepenuhan tong, serta mendeteksi kepekatan gas/bau secara <em>real-time</em>.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Catatan Pengembangan (Future Work)</span>
            <p className="text-sm text-amber-900">
              Sistem klasifikasi jenis sampah (Organik/Anorganik) menggunakan <strong>AI Vision / Machine Learning</strong> belum diaktifkan pada fase ini dan direncanakan sebagai tahap pengembangan lanjutan (Assignment 2).
            </p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* SEKSI 2: HARDWARE */}
        <section>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            ⚙️ Spesifikasi Hardware (IoT)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { nama: "ESP32", fungsi: "Mikrokontroler & Modul Wi-Fi" },
              { nama: "Ultrasonik HC-SR04", fungsi: "Deteksi Jarak & Kepenuhan" },
              { nama: "Sensor Gas MQ-135", fungsi: "Deteksi Kepekatan Bau (ADC)" },
              { nama: "Servo SG90", fungsi: "Aktuator Mekanisme Gate" },
              { nama: "Modul LCD", fungsi: "Display Indikator Fisik" }
            ].map((hw, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{hw.nama}</h4>
                  <p className="text-xs text-slate-500">{hw.fungsi}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* SEKSI 3: TIM */}
        <section>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            👥 Profil Tim Pengembang
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { nama: "Brian", peran: "Team Leader & Hardware Engineering", inisial: "KB", color: "bg-orange-100 text-orange-700" },
              { nama: "Lean", peran: "Backend API & Logic", inisial: "LN", color: "bg-purple-100 text-purple-700" },
              { nama: "Sirajudin", peran: "Frontend & UI/UX Dashboard", inisial: "SJ", color: "bg-blue-100 text-blue-700" },
              { nama: "Komang", peran: "Hardware Engineering", inisial: "KB", color: "bg-red-100 text-white-700" },
              { nama: "Daniel", peran: "Physical Prototyping", inisial: "DN", color: "bg-emerald-100 text-emerald-700" }
            ].map((member, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.color}`}>
                  {member.inisial}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{member.nama}</h4>
                  <p className="text-xs text-slate-500">{member.peran}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}