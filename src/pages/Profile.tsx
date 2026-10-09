import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { updateUserProfile } from "@/lib/firebase";
import { calculateBMI, calculateEnergyRequirement } from "@/lib/calculations";
import BMIGauge from "@/components/BMIGauge";
import HelpTip from "@/components/HelpTip";
import type { Gender, ActivityLevel } from "@/lib/types";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { t, lang } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    height: String(user?.height || ""),
    weight: String(user?.weight || ""),
    age: String(user?.age || ""),
    gender: (user?.gender || "male") as Gender,
    job: user?.job || "",
    activityLevel: (user?.activityLevel || "moderate") as ActivityLevel,
  });

  if (!user) return null;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const bmi = form.height && form.weight
    ? calculateBMI(Number(form.weight), Number(form.height))
    : calculateBMI(user.weight, user.height);

  const energy = form.height && form.weight && form.age
    ? calculateEnergyRequirement(Number(form.weight), Number(form.height), Number(form.age), form.gender, form.activityLevel)
    : calculateEnergyRequirement(user.weight, user.height, user.age, user.gender, user.activityLevel);

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.height || !form.weight || !form.age || !form.job) {
      setError(t("errorRequired")); return;
    }
    setSaving(true);
    if (![form.height, form.weight, form.age].every((value) => Number.isFinite(Number(value))) || Number(form.height) < 50 || Number(form.height) > 250 || Number(form.weight) < 20 || Number(form.weight) > 300 || Number(form.age) < 19 || Number(form.age) > 78) {
      setError("Enter valid values for this adult estimate: age 19–78, height 50–250 cm, weight 20–300 kg.");
      setSaving(false);
      return;
    }
    try {
      await updateUserProfile(user.uid, {
        name: form.name,
        height: Number(form.height),
        weight: Number(form.weight),
        age: Number(form.age),
        gender: form.gender,
        job: form.job,
        activityLevel: form.activityLevel,
        language: lang,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errorGeneral"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2";
  const inputStyle = { background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl" style={{ color: "var(--foreground)" }}>{t("profileTitle")}</h1>
      </div>

      {/* Calculated summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5 flex flex-col items-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>{t("bmi")} <HelpTip label="BMI">BMI is weight divided by height squared. Adult category cutoffs vary by population; see Sources & methods.</HelpTip></p>
          <BMIGauge bmi={bmi} />
        </div>
        <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>TDEE <HelpTip label="TDEE estimate">Estimated daily energy expenditure = resting energy estimate × activity factor. It is a planning estimate, not a prescription.</HelpTip></p>
          <p className="font-display font-black text-4xl" style={{ color: "var(--primary)" }}>{energy.tdee.toLocaleString()}</p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>kcal / day</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>REE (Mifflin–St Jeor)</span><span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{energy.bmr} kkal</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Faktor Aktivitas</span><span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>×{energy.activityFactor}</span></div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>{t("personalInfo")}</h2>
        {error && <div className="px-4 py-3 rounded-xl text-sm border" style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>{error}</div>}
        {saved && <div className="px-4 py-3 rounded-xl text-sm border" style={{ background: "#F0FDF4", color: "#166534", borderColor: "#BBF7D0" }}>✓ {t("profileUpdated")}</div>}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("fullName")}</label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>Email</label>
          <input type="email" value={user.email} disabled className={inputClass} style={{ ...inputStyle, opacity: 0.6 }} />
        </div>
      </div>

      {/* Health info */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>{t("healthInfo")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("heightCm")} <HelpTip label="Height">Enter height in centimetres. Used in BMI and the adult energy estimate.</HelpTip></label>
            <input type="number" min="50" max="250" value={form.height} onChange={(e) => set("height", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("weightKg")} <HelpTip label="Weight">Enter weight in kilograms. Used in BMI and the adult energy estimate.</HelpTip></label>
            <input type="number" min="20" max="300" value={form.weight} onChange={(e) => set("weight", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("age")} <HelpTip label="Age">This estimate currently supports adults aged 19–78.</HelpTip></label>
            <input type="number" min="1" max="120" value={form.age} onChange={(e) => set("age", e.target.value)} className={inputClass} style={inputStyle} />
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
          <select value={form.job} onChange={(e) => set("job", e.target.value)} className={inputClass} style={inputStyle}>
            <option value="">Pilih peran</option>
            <option value="Mahasiswa gizi">Mahasiswa gizi</option>
            <option value="Nutrisionis dalam pelatihan">Nutrisionis dalam pelatihan</option>
            <option value="Nutrisionis profesional">Nutrisionis profesional</option>
            <option value="Calon nutrisionis">Calon nutrisionis</option>
            <option value="Dosen atau pengajar gizi">Dosen atau pengajar gizi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("activityLevel")} <HelpTip label="Activity factor">A multiplier applied to resting energy. It is a broad estimate; individual needs vary.</HelpTip></label>
          <select value={form.activityLevel} onChange={(e) => set("activityLevel", e.target.value)} className={inputClass} style={inputStyle}>
            <option value="sedentary">{t("sedentary")}</option>
            <option value="light">{t("light")}</option>
            <option value="moderate">{t("moderate")}</option>
            <option value="active">{t("active")}</option>
            <option value="very_active">{t("very_active")}</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-xl font-display font-bold transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        {saving ? t("saving") : t("updateProfile")}
      </button>
    </div>
  );
}
