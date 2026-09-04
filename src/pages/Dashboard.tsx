import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateBMI, calculateEnergyRequirement, sumNutrients, getRDI } from "@/lib/calculations";
import { getUserLogs, deleteFoodLog } from "@/lib/firebase";
import BMIGauge from "@/components/BMIGauge";
import NutrientProgress from "@/components/NutrientProgress";
import FoodSearchModal from "@/components/FoodSearchModal";
import type { FoodLogEntry, MealType } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getMealColor(meal: MealType) {
  return { breakfast: "#F59E0B", lunch: "#16a34a", dinner: "#3B82F6", snack: "#A855F7" }[meal];
}

function getMealEmoji(meal: MealType) {
  return { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" }[meal];
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultMeal, setDefaultMeal] = useState<MealType>("breakfast");
  const [showInsights, setShowInsights] = useState(true);

  const today = todayStr();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserLogs(user.uid, today)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [user, today]);

  if (!user) return null;

  const bmi = calculateBMI(user.weight, user.height);
  const energy = calculateEnergyRequirement(user.weight, user.height, user.age, user.gender, user.activityLevel);
  const rdi = getRDI(user.gender, user.age);
  const totals = sumNutrients(logs);

  const caloriesPct = Math.min((totals.energy / energy.tdee) * 100, 100);
  const caloriesRemaining = Math.max(energy.tdee - totals.energy, 0);

  const mealGroups: Record<MealType, FoodLogEntry[]> = {
    breakfast: logs.filter((l) => l.mealType === "breakfast"),
    lunch: logs.filter((l) => l.mealType === "lunch"),
    dinner: logs.filter((l) => l.mealType === "dinner"),
    snack: logs.filter((l) => l.mealType === "snack"),
  };

  const handleDelete = async (id: string) => {
    await deleteFoodLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAdd = (entry: FoodLogEntry) => {
    setLogs((prev) => [...prev, entry]);
  };

  // Insights
  const insights: { nutrient: string; message: string; tip: string }[] = [];
  if (totals.fiber < rdi.fiber * 0.5) insights.push({ nutrient: "🌾 " + t("fiber"), message: lang === "id" ? "Asupan serat Anda masih rendah hari ini." : "Your fiber intake is low today.", tip: lang === "id" ? "Coba tambahkan sayuran hijau atau buah." : "Try adding green vegetables or fruits." });
  if (totals.calcium < rdi.calcium * 0.5) insights.push({ nutrient: "🦴 " + t("calcium"), message: lang === "id" ? "Kalsium Anda belum mencukupi." : "Your calcium intake is insufficient.", tip: lang === "id" ? "Konsumsi susu atau tahu untuk tambah kalsium." : "Consume milk or tofu to boost calcium." });
  if (totals.iron < rdi.iron * 0.5) insights.push({ nutrient: "🔴 " + t("iron"), message: lang === "id" ? "Zat besi Anda kurang." : "Your iron intake is low.", tip: lang === "id" ? "Makan tempe, bayam, atau ikan untuk tambah zat besi." : "Eat tempeh, spinach, or fish for more iron." });
  if (totals.energy > energy.tdee * 0.9) insights.push({ nutrient: "⚡ " + t("energy"), message: lang === "id" ? "Anda hampir mencapai kebutuhan kalori harian." : "You're close to your daily calorie goal.", tip: lang === "id" ? "Perhatikan makanan berikutnya agar tidak berlebih." : "Be mindful of your next meal to avoid exceeding your limit." });

  const dateFormatted = new Date(today).toLocaleDateString(lang === "ar" ? "ar-SA" : lang === "en" ? "en-GB" : "id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{dateFormatted}</p>
          <h1 className="font-display font-black text-2xl sm:text-3xl" style={{ color: "var(--foreground)" }}>
            {t("welcomeBack")}, <span style={{ color: "var(--primary)" }}>{user.name.split(" ")[0]}</span> 👋
          </h1>
        </div>
        <button
          onClick={() => { setDefaultMeal("breakfast"); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t("addFood")}
        </button>
      </div>

      {/* Top grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BMI card */}
        <div className="rounded-2xl p-5 border sm:col-span-1 flex flex-col items-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>{t("bmi")}</p>
          <BMIGauge bmi={bmi} />
          <p className="text-xs text-center mt-2" style={{ color: "var(--muted-foreground)" }}>
            {user.weight}kg · {user.height}cm
          </p>
        </div>

        {/* Energy need */}
        <div className="rounded-2xl p-5 border flex flex-col justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>{t("dailyEnergyNeeds")}</p>
            <p className="font-display font-black text-3xl mt-2" style={{ color: "var(--primary)" }}>{energy.tdee.toLocaleString()}</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>kkal / hari</p>
          </div>
          <div className="mt-4 text-xs space-y-1">
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>BMR</span><span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{energy.bmr} kkal</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Faktor Aktivitas</span><span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>×{energy.activityFactor}</span></div>
          </div>
          <p className="text-xs mt-3 italic" style={{ color: "var(--muted-foreground)" }}>{t("estimatedNote")}</p>
        </div>

        {/* Calories today */}
        <div className="rounded-2xl p-5 border flex flex-col justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>{t("caloriesConsumed")}</p>
            <p className="font-display font-black text-3xl mt-2" style={{ color: "var(--accent)" }}>{Math.round(totals.energy).toLocaleString()}</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>kkal dikonsumsi</p>
          </div>
          <div className="mt-4">
            <div className="nutrient-bar mb-2">
              <div className="nutrient-bar-fill" style={{ width: `${caloriesPct}%`, background: caloriesPct > 100 ? "#EF4444" : "var(--accent)" }} />
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--muted-foreground)" }}>{Math.round(caloriesPct)}% terpenuhi</span>
              <span style={{ color: "var(--muted-foreground)" }}>Sisa ~{Math.round(caloriesRemaining)} kkal</span>
            </div>
          </div>
        </div>

        {/* Macro summary */}
        <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>{t("macros")}</p>
          <div className="space-y-3">
            <NutrientProgress label={t("protein")} value={Math.round(totals.protein * 10) / 10} rdi={rdi.protein} unit="g" color="#16a34a" />
            <NutrientProgress label={t("fat")} value={Math.round(totals.fat * 10) / 10} rdi={rdi.fat} unit="g" color="#F59E0B" />
            <NutrientProgress label={t("carbohydrate")} value={Math.round(totals.carbohydrate * 10) / 10} rdi={rdi.carbohydrate} unit="g" color="#3B82F6" />
            <NutrientProgress label={t("fiber")} value={Math.round(totals.fiber * 10) / 10} rdi={rdi.fiber} unit="g" color="#8B5CF6" />
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <button
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted transition-all"
            onClick={() => setShowInsights(!showInsights)}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span className="font-display font-bold" style={{ color: "var(--foreground)" }}>{t("nutritionInsights")}</span>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>{insights.length}</span>
            </div>
            <svg className={`w-4 h-4 transition-transform ${showInsights ? "rotate-180" : ""}`} style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showInsights && (
            <div className="px-5 pb-5 grid sm:grid-cols-2 gap-3">
              {insights.map((ins, i) => (
                <div key={i} className="p-4 rounded-xl border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>{ins.nutrient}</p>
                  <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>{ins.message}</p>
                  <p className="text-xs font-medium" style={{ color: "var(--primary)" }}>💡 {ins.tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meal groups */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>{t("todayIntake")}</h2>
          <Link to="/diary" className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>{t("viewAll")}</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mx-auto" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>{t("noFoodLogged")}</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {t("addFood")}
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((meal) => {
              const mealLogs = mealGroups[meal];
              if (mealLogs.length === 0) return null;
              const mealTotal = sumNutrients(mealLogs);
              return (
                <div key={meal} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{getMealEmoji(meal)}</span>
                      <span className="font-display font-bold text-sm" style={{ color: "var(--foreground)" }}>{t(meal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold" style={{ color: getMealColor(meal) }}>{Math.round(mealTotal.energy)} kkal</span>
                      <button
                        onClick={() => { setDefaultMeal(meal); setModalOpen(true); }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                      >+</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {mealLogs.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-2 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{entry.foodName}</p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{entry.weightGrams}g · {Math.round(entry.nutrients.energy)} kkal · P:{Math.round(entry.nutrients.protein*10)/10}g L:{Math.round(entry.nutrients.fat*10)/10}g K:{Math.round(entry.nutrients.carbohydrate*10)/10}g</p>
                        </div>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 transition-all flex-shrink-0"
                          style={{ color: "#EF4444" }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FoodSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        defaultMeal={defaultMeal}
        date={today}
      />
    </div>
  );
}
