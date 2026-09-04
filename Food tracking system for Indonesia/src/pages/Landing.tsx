import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/translations";
import type { Language } from "@/lib/types";

const FEATURES = [
  {
    icon: "🥗",
    title: { id: "Pantau Asupan Gizi", en: "Track Nutritional Intake" },
    desc: { id: "Catat setiap makanan dan minuman yang Anda konsumsi dengan mudah dan akurat.", en: "Log every meal with detailed nutritional breakdowns from TKPI 2017 data." },
  },
  {
    icon: "📊",
    title: { id: "Kalkulator BMI & Energi", en: "BMI & Energy Calculator" },
    desc: { id: "Hitung IMT dan estimasi kebutuhan kalori harian berdasarkan profil tubuhmu.", en: "Calculate BMI and daily caloric needs using the Mifflin-St Jeor equation." },
  },
  {
    icon: "💡",
    title: { id: "Wawasan Gizi Personal", en: "Personalized Nutrition Insights" },
    desc: { id: "Dapatkan rekomendasi berdasarkan asupan harianmu untuk mencapai tujuan kesehatanmu.", en: "Get smart insights based on your daily intake and health goals." },
  },
  {
    icon: "🌏",
    title: { id: "Multibahasa", en: "Multilingual" },
    desc: { id: "Tersedia dalam Bahasa Indonesia, Inggris, Melayu, Jawa, dan Arab.", en: "Available in Indonesian, English, Malay, Javanese, and Arabic." },
  },
  {
    icon: "📱",
    title: { id: "Mobile-Friendly", en: "Mobile-Friendly" },
    desc: { id: "Desain responsif yang nyaman digunakan di ponsel maupun komputer.", en: "Fully responsive design optimised for both phone and desktop use." },
  },
  {
    icon: "🏥",
    title: { id: "Berbasis Data Ilmiah", en: "Science-Based Data" },
    desc: { id: "Data gizi dari TKPI 2017 (Tabel Komposisi Pangan Indonesia) yang terstandarisasi.", en: "Nutritional data from the official Indonesian Food Composition Table (TKPI 2017)." },
  },
];

export default function Landing() {
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>N</div>
            <span className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>NutriSiji</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="text-sm border rounded-lg px-2 py-1.5 focus:outline-none"
              style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--muted-foreground)" }}
            >
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.nativeLabel}</option>)}
            </select>
            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-all" style={{ color: "var(--foreground)" }}>{t("login")}</Link>
            <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-bold transition-all" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{t("register")}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--accent) 0%, transparent 50%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", borderColor: "var(--border)" }}>
            <span>🇮🇩</span>
            <span>Dirancang untuk Pekalongan, Jawa Tengah</span>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-tight mb-6" style={{ color: "var(--foreground)" }}>
            Pantau Gizi,{" "}
            <span style={{ color: "var(--primary)" }}>Jaga Kesehatan</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--muted-foreground)" }}>
            {t("appDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl font-display font-bold text-base transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {t("registerBtn")} — Gratis
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl font-display font-bold text-base border transition-all hover:bg-muted"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              {t("loginBtn")}
            </Link>
          </div>
          <p className="mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
            Demo: gunakan email <strong>admin@nutrisiji.id</strong> / password <strong>admin123</strong>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "40+", label: lang === "id" ? "Jenis Makanan Indonesia" : "Indonesian Foods" },
              { value: "12", label: lang === "id" ? "Nutrisi Dipantau" : "Nutrients Tracked" },
              { value: "5", label: lang === "id" ? "Bahasa Tersedia" : "Languages Available" },
              { value: "TKPI", label: lang === "id" ? "Sumber Data Gizi" : "Data Source" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display font-black text-3xl sm:text-4xl" style={{ color: "var(--primary)" }}>{stat.value}</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-center mb-4" style={{ color: "var(--foreground)" }}>
            {lang === "id" ? "Fitur Unggulan" : "Key Features"}
          </h2>
          <p className="text-center mb-12" style={{ color: "var(--muted-foreground)" }}>
            {lang === "id" ? "Semua yang Anda butuhkan untuk memantau gizi harian" : "Everything you need to monitor your daily nutrition"}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat) => (
              <div key={feat.title.id} className="p-6 rounded-2xl border hover:shadow-lg transition-all" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--foreground)" }}>
                  {lang === "id" ? feat.title.id : feat.title.en}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {lang === "id" ? feat.desc.id : feat.desc.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            ⚠️ {lang === "id"
              ? "NutriSiji menampilkan estimasi nilai gizi berdasarkan TKPI 2017. Nilai sebenarnya dapat berbeda. Konsultasikan dengan ahli gizi untuk saran medis."
              : "NutriSiji displays estimated nutritional values based on TKPI 2017. Actual values may differ. Consult a nutritionist for medical advice."}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "var(--secondary)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-4" style={{ color: "var(--secondary-foreground)" }}>
            {lang === "id" ? "Mulai Pantau Gizimu Sekarang" : "Start Tracking Your Nutrition Today"}
          </h2>
          <p className="mb-8" style={{ color: "var(--muted-foreground)" }}>
            {lang === "id" ? "Daftar gratis dan mulai perjalanan hidupmu yang lebih sehat." : "Register for free and begin your healthier lifestyle journey."}
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 rounded-xl font-display font-bold text-base transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {t("registerBtn")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>© 2025 NutriSiji · Pekalongan, Jawa Tengah, Indonesia</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Data gizi: TKPI 2017 · Nilai bersifat estimasi</p>
        </div>
      </footer>
    </div>
  );
}
