import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { updateUserProfile } from "@/lib/firebase";
import { calculateBMI, calculateEnergyRequirement } from "@/lib/calculations";
import BMIGauge from "@/components/BMIGauge";
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
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Perbarui informasi dan data kesehatan Anda</p>
      </div>

      {/* Calculated summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5 flex flex-col items-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>{t("bmi")}</p>
          <BMIGauge bmi={bmi} />
        </div>
        <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>{t("dailyEnergyNeeds")}</p>
          <p className="font-display font-black text-4xl" style={{ color: "var(--primary)" }}>{energy.tdee.toLocaleString()}</p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>kkal / hari (estimasi)</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>BMR (Mifflin-St Jeor)</span><span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{energy.bmr} kkal</span></div>
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
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("heightCm")}</label>
            <input type="number" min="50" max="250" value={form.height} onChange={(e) => set("height", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("weightKg")}</label>
            <input type="number" min="20" max="300" value={form.weight} onChange={(e) => set("weight", e.target.value)} className={inputClass} style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("age")}</label>
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
          <input type="text" value={form.job} onChange={(e) => set("job", e.target.value)} className={inputClass} style={inputStyle} />
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
      </div>

      {/* User info */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-display font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>Informasi Akun</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>UID</span><span className="font-mono text-xs" style={{ color: "var(--foreground)" }}>{user.uid.slice(0, 16)}...</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Role</span><span className="font-medium capitalize px-2 py-0.5 rounded" style={{ background: user.role === "admin" ? "var(--accent)" + "20" : "var(--secondary)", color: user.role === "admin" ? "var(--accent)" : "var(--primary)" }}>{user.role}</span></div>
          <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Bergabung</span><span style={{ color: "var(--foreground)" }}>{new Date(user.createdAt).toLocaleDateString("id-ID")}</span></div>
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
