import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { registerUser } from "@/lib/firebase";
import { calculateBMI, calculateEnergyRequirement } from "@/lib/calculations";
import type { Gender, ActivityLevel } from "@/lib/types";

const STEPS = ["personal", "health", "preview"] as const;
type Step = typeof STEPS[number];

export default function Register() {
  const { t, lang } = useLanguage();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    height: "",
    weight: "",
    age: "",
    gender: "male" as Gender,
    job: "",
    activityLevel: "moderate" as ActivityLevel,
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const validate = (): boolean => {
    setError("");
    if (step === "personal") {
      if (!form.name || !form.email || !form.password || !form.confirmPassword) { setError(t("errorRequired")); return false; }
      if (!form.email.includes("@")) { setError(t("errorEmail")); return false; }
      if (form.password.length < 6) { setError(t("errorPasswordLength")); return false; }
      if (form.password !== form.confirmPassword) { setError(t("errorPasswordMatch")); return false; }
    }
    if (step === "health") {
      if (!form.height || !form.weight || !form.age || !form.job) { setError(t("errorRequired")); return false; }
      if (Number(form.height) < 50 || Number(form.height) > 250) { setError("Tinggi badan tidak valid (50–250 cm)"); return false; }
      if (Number(form.weight) < 20 || Number(form.weight) > 300) { setError("Berat badan tidak valid (20–300 kg)"); return false; }
      if (Number(form.age) < 1 || Number(form.age) > 120) { setError("Usia tidak valid"); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const profile = await registerUser(form.email, form.password, {
        email: form.email,
        name: form.name,
        role: "user",
        height: Number(form.height),
        weight: Number(form.weight),
        age: Number(form.age),
        gender: form.gender,
        job: form.job,
        activityLevel: form.activityLevel,
        language: lang,
      });
      setUser(profile);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errorRegister"));
    } finally {
      setLoading(false);
    }
  };

  const bmiPreview = form.height && form.weight ? calculateBMI(Number(form.weight), Number(form.height)) : null;
  const energyPreview = form.height && form.weight && form.age
    ? calculateEnergyRequirement(Number(form.weight), Number(form.height), Number(form.age), form.gender, form.activityLevel)
    : null;

  const stepIdx = STEPS.indexOf(step);

  const inputClass = "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2";
  const inputStyle = { background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12" style={{ background: "var(--primary)" }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-lg bg-white/20">N</div>
          <span className="font-display font-bold text-2xl text-white">NutriSiji</span>
        </Link>
        <div className="space-y-8">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-start gap-4 transition-all ${stepIdx >= i ? "opacity-100" : "opacity-30"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${stepIdx >= i ? "bg-white text-green-700" : "bg-white/20 text-white"}`}>
                {stepIdx > i ? "✓" : i + 1}
              </div>
              <div>
                <p className="text-white font-display font-bold">
                  {s === "personal" ? "Informasi Pribadi" : s === "health" ? "Data Kesehatan" : "Konfirmasi"}
                </p>
                <p className="text-white/60 text-xs">
                  {s === "personal" ? "Nama, email, dan password" : s === "health" ? "Tinggi, berat, usia, aktivitas" : "Tinjau dan buat akun"}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/50 text-sm">Data Anda aman dan hanya digunakan untuk kalkulasi gizi personal.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Progress bar (mobile) */}
          <div className="flex gap-1 mb-8 lg:hidden">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 h-1.5 rounded-full" style={{ background: stepIdx >= i ? "var(--primary)" : "var(--border)" }} />
            ))}
          </div>

          <h1 className="font-display font-black text-3xl mb-2" style={{ color: "var(--foreground)" }}>{t("registerTitle")}</h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            {step === "personal" ? t("registerSubtitle") : step === "health" ? "Kami perlu data ini untuk menghitung kebutuhan gizi Anda." : "Periksa informasi Anda sebelum membuat akun."}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm border" style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>
              {error}
            </div>
          )}

          {/* STEP 1: Personal */}
          {step === "personal" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("fullName")}</label>
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nama Lengkap Anda" className={inputClass} style={inputStyle} autoComplete="name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("email")}</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@email.com" className={inputClass} style={inputStyle} autoComplete="email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("password")}</label>
                <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 6 karakter" className={inputClass} style={inputStyle} autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("confirmPassword")}</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Ulangi password" className={inputClass} style={inputStyle} autoComplete="new-password" />
              </div>
            </div>
          )}

          {/* STEP 2: Health */}
          {step === "health" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("heightCm")}</label>
                  <input type="number" min="50" max="250" value={form.height} onChange={(e) => set("height", e.target.value)} placeholder="165" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("weightKg")}</label>
                  <input type="number" min="20" max="300" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="60" className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("age")}</label>
                  <input type="number" min="1" max="120" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="25" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("gender")}</label>
                  <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={inputClass} style={inputStyle}>
                    <option value="male">{t("male")}</option>
                    <option value="female">{t("female")}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("job")}</label>
                <input type="text" value={form.job} onChange={(e) => set("job", e.target.value)} placeholder="Pelajar / Guru / Petani / dll" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("activityLevel")}</label>
                <select value={form.activityLevel} onChange={(e) => set("activityLevel", e.target.value)} className={inputClass} style={inputStyle}>
                  <option value="sedentary">{t("sedentary")}</option>
                  <option value="light">{t("light")}</option>
                  <option value="moderate">{t("moderate")}</option>
                  <option value="active">{t("active")}</option>
                  <option value="very_active">{t("very_active")}</option>
                </select>
              </div>

              {/* Live preview */}
              {bmiPreview && energyPreview && (
                <div className="p-4 rounded-xl border" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--secondary-foreground)" }}>Pratinjau Kalkulasi:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>IMT</span><span className="font-mono font-bold" style={{ color: bmiPreview.color }}>{bmiPreview.value}</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Kategori</span><span style={{ color: bmiPreview.color }}>{t(bmiPreview.category as any)}</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>BMR</span><span className="font-mono" style={{ color: "var(--foreground)" }}>{energyPreview.bmr} kkal</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>TDEE</span><span className="font-mono font-bold" style={{ color: "var(--primary)" }}>{energyPreview.tdee} kkal</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>Informasi Akun</h3>
                {[
                  { label: "Nama", value: form.name },
                  { label: "Email", value: form.email },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>{r.label}</span>
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-5 rounded-2xl border space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>Data Kesehatan</h3>
                {[
                  { label: t("heightCm"), value: `${form.height} cm` },
                  { label: t("weightKg"), value: `${form.weight} kg` },
                  { label: t("age"), value: `${form.age} tahun` },
                  { label: t("gender"), value: form.gender === "male" ? t("male") : t("female") },
                  { label: t("job"), value: form.job },
                  { label: t("activityLevel"), value: t(form.activityLevel as any) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>{r.label}</span>
                    <span className="font-medium text-right max-w-[60%]" style={{ color: "var(--foreground)" }}>{r.value}</span>
                  </div>
                ))}
              </div>
              {bmiPreview && energyPreview && (
                <div className="p-5 rounded-2xl border" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
                  <h3 className="font-display font-bold mb-3" style={{ color: "var(--secondary-foreground)" }}>Hasil Kalkulasi</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>IMT</span><span className="font-mono font-bold" style={{ color: bmiPreview.color }}>{bmiPreview.value} ({t(bmiPreview.category as any)})</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Estimasi Kalori Harian</span><span className="font-mono font-bold" style={{ color: "var(--primary)" }}>{energyPreview.tdee} kkal/hari</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {stepIdx > 0 && (
              <button
                onClick={() => setStep(STEPS[stepIdx - 1])}
                className="px-6 py-3 rounded-xl font-medium text-sm border hover:bg-muted transition-all"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {t("back")}
              </button>
            )}
            <button
              onClick={step === "preview" ? handleSubmit : handleNext}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-display font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {loading ? t("saving") : step === "preview" ? t("registerBtn") : t("next")}
            </button>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            {t("hasAccount")}{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--primary)" }}>{t("loginBtn")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
