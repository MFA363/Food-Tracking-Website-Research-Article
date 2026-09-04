import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserLogs } from "@/lib/firebase";
import { sumNutrients, getRDI, calculateEnergyRequirement } from "@/lib/calculations";
import NutrientProgress from "@/components/NutrientProgress";
import type { FoodLogEntry, Nutrients } from "@/lib/types";

function todayStr() { return new Date().toISOString().split("T")[0]; }

export default function NutritionSummary() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [date, setDate] = useState(todayStr());
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"macros" | "micros" | "byMeal" | "byFood">("macros");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserLogs(user.uid, date).then(setLogs).finally(() => setLoading(false));
  }, [user, date]);

  if (!user) return null;

  const rdi = getRDI(user.gender, user.age);
  const energy = calculateEnergyRequirement(user.weight, user.height, user.age, user.gender, user.activityLevel);
  const totals = sumNutrients(logs);

  const MACRO_NUTRIENTS: { key: keyof Nutrients; label: string; unit: string; color: string }[] = [
    { key: "energy", label: t("energy"), unit: "kkal", color: "var(--accent)" },
    { key: "protein", label: t("protein"), unit: "g", color: "#16a34a" },
    { key: "fat", label: t("fat"), unit: "g", color: "#F59E0B" },
    { key: "carbohydrate", label: t("carbohydrate"), unit: "g", color: "#3B82F6" },
    { key: "fiber", label: t("fiber"), unit: "g", color: "#8B5CF6" },
  ];

  const MICRO_NUTRIENTS: { key: keyof Nutrients; label: string; unit: string; color: string }[] = [
    { key: "calcium", label: t("calcium"), unit: "mg", color: "#06B6D4" },
    { key: "phosphorus", label: t("phosphorus"), unit: "mg", color: "#14B8A6" },
    { key: "iron", label: t("iron"), unit: "mg", color: "#EF4444" },
    { key: "sodium", label: t("sodium"), unit: "mg", color: "#F97316" },
    { key: "potassium", label: t("potassium"), unit: "mg", color: "#EC4899" },
    { key: "copper", label: t("copper"), unit: "mg", color: "#D97706" },
    { key: "zinc", label: t("zinc"), unit: "mg", color: "#64748B" },
  ];

  const mealCalories = {
    breakfast: sumNutrients(logs.filter((l) => l.mealType === "breakfast")),
    lunch: sumNutrients(logs.filter((l) => l.mealType === "lunch")),
    dinner: sumNutrients(logs.filter((l) => l.mealType === "dinner")),
    snack: sumNutrients(logs.filter((l) => l.mealType === "snack")),
  };

  const MEAL_COLORS = { breakfast: "#F59E0B", lunch: "#16a34a", dinner: "#3B82F6", snack: "#A855F7" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl" style={{ color: "var(--foreground)" }}>{t("nutritionTitle")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{t("nutritionSubtitle")}</p>
        </div>
        <input
          type="date"
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t("energy"), value: `${Math.round(totals.energy)}`, unit: "kkal", rdiV: energy.tdee, color: "var(--accent)" },
          { label: t("protein"), value: `${Math.round(totals.protein * 10) / 10}`, unit: "g", rdiV: rdi.protein, color: "#16a34a" },
          { label: t("fat"), value: `${Math.round(totals.fat * 10) / 10}`, unit: "g", rdiV: rdi.fat, color: "#F59E0B" },
          { label: t("carbohydrate"), value: `${Math.round(totals.carbohydrate * 10) / 10}`, unit: "g", rdiV: rdi.carbohydrate, color: "#3B82F6" },
        ].map((card) => {
          const pct = card.rdiV > 0 ? Math.min(Math.round((Number(card.value) / card.rdiV) * 100), 150) : 0;
          return (
            <div key={card.label} className="p-4 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase" style={{ color: "var(--muted-foreground)" }}>{card.label}</p>
              <p className="font-display font-black text-2xl mt-1" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{card.unit} · {pct}% AKG</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
        {[
          { key: "macros", label: t("macros") },
          { key: "micros", label: t("micros") },
          { key: "byMeal", label: t("byMeal") },
          { key: "byFood", label: t("byFood") },
        ].map((t_) => (
          <button
            key={t_.key}
            onClick={() => setTab(t_.key as typeof tab)}
            className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
            style={tab === t_.key ? { background: "var(--card)", color: "var(--foreground)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" } : { color: "var(--muted-foreground)" }}
          >
            {t_.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border p-5 space-y-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
          </div>
        ) : (
          <>
            {tab === "macros" && (
              <div className="space-y-6">
                {MACRO_NUTRIENTS.map((n) => (
                  <NutrientProgress
                    key={n.key}
                    label={n.label}
                    value={Math.round((totals[n.key] as number) * 100) / 100}
                    rdi={n.key === "energy" ? energy.tdee : rdi[n.key] as number}
                    unit={n.unit}
                    color={n.color}
                  />
                ))}
              </div>
            )}

            {tab === "micros" && (
              <div className="space-y-6">
                {MICRO_NUTRIENTS.map((n) => (
                  <NutrientProgress
                    key={n.key}
                    label={n.label}
                    value={Math.round((totals[n.key] as number) * 100) / 100}
                    rdi={rdi[n.key] as number}
                    unit={n.unit}
                    color={n.color}
                  />
                ))}
              </div>
            )}

            {tab === "byMeal" && (
              <div className="space-y-4">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => {
                  const cal = Math.round(mealCalories[meal].energy);
                  const totalCal = Math.round(totals.energy);
                  const pct = totalCal > 0 ? Math.round((cal / totalCal) * 100) : 0;
                  return (
                    <div key={meal} className="p-4 rounded-xl border" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: MEAL_COLORS[meal] }} />
                          <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{t(meal)}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm" style={{ color: MEAL_COLORS[meal] }}>{cal} kkal</span>
                          <span className="text-xs ml-2" style={{ color: "var(--muted-foreground)" }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="nutrient-bar">
                        <div className="nutrient-bar-fill" style={{ width: `${pct}%`, background: MEAL_COLORS[meal] }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
                        <div><p className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{Math.round(mealCalories[meal].protein * 10) / 10}g</p><p style={{ color: "var(--muted-foreground)" }}>Protein</p></div>
                        <div><p className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{Math.round(mealCalories[meal].fat * 10) / 10}g</p><p style={{ color: "var(--muted-foreground)" }}>Lemak</p></div>
                        <div><p className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{Math.round(mealCalories[meal].carbohydrate * 10) / 10}g</p><p style={{ color: "var(--muted-foreground)" }}>Karbo</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "byFood" && (
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: "var(--muted-foreground)" }}>Belum ada makanan dicatat untuk tanggal ini.</p>
                ) : (
                  logs.sort((a, b) => b.nutrients.energy - a.nutrients.energy).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--border)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--foreground)" }}>{entry.foodName}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{entry.weightGrams}g · {t(entry.mealType)}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-mono font-bold text-sm" style={{ color: "var(--primary)" }}>{Math.round(entry.nutrients.energy)} kkal</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>P:{Math.round(entry.nutrients.protein*10)/10}g L:{Math.round(entry.nutrients.fat*10)/10}g</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
        <span className="text-lg flex-shrink-0">⚠️</span>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{t("disclaimer")}</p>
      </div>
    </div>
  );
}
