import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserLogs } from "@/lib/firebase";
import { sumNutrients, calculateEnergyRequirement } from "@/lib/calculations";
import type { FoodLogEntry } from "@/lib/types";

function getDateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export default function History() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [allLogs, setAllLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"week" | "list">("week");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserLogs(user.uid).then(setAllLogs).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const energy = calculateEnergyRequirement(user.weight, user.height, user.age, user.gender, user.activityLevel);

  // Group by date
  const byDate = useMemo(() => {
    const map: Record<string, FoodLogEntry[]> = {};
    allLogs.forEach((l) => {
      if (!map[l.date]) map[l.date] = [];
      map[l.date].push(l);
    });
    return map;
  }, [allLogs]);

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  const recentDates = getDateRange(14);

  const selectedLogs = selectedDate ? (byDate[selectedDate] || []) : [];
  const selectedTotals = sumNutrients(selectedLogs);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl" style={{ color: "var(--foreground)" }}>{t("historyTitle")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{t("historySubtitle")}</p>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 w-fit p-1 rounded-xl" style={{ background: "var(--muted)" }}>
        {[{ key: "week", label: "14 Hari Terakhir" }, { key: "list", label: "Semua Riwayat" }].map((v) => (
          <button key={v.key} onClick={() => setView(v.key as typeof view)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={view === v.key ? { background: "var(--card)", color: "var(--foreground)" } : { color: "var(--muted-foreground)" }}>
            {v.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
        </div>
      ) : (
        <>
          {view === "week" && (
            <div className="space-y-4">
              {/* 14-day bar chart */}
              <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <h3 className="font-display font-bold mb-4" style={{ color: "var(--foreground)" }}>Kalori 14 Hari Terakhir</h3>
                <div className="flex items-end gap-1.5 h-32">
                  {recentDates.reverse().map((date) => {
                    const dayLogs = byDate[date] || [];
                    const cal = sumNutrients(dayLogs).energy;
                    const pct = energy.tdee > 0 ? Math.min((cal / energy.tdee) * 100, 120) : 0;
                    const isSelected = selectedDate === date;
                    const hasData = dayLogs.length > 0;
                    const d = new Date(date);
                    return (
                      <div key={date} className="flex-1 flex flex-col items-center gap-1" onClick={() => setSelectedDate(isSelected ? null : date)}>
                        <div
                          className="w-full rounded-t-md cursor-pointer transition-all hover:opacity-80"
                          style={{
                            height: `${Math.max(pct, 2)}%`,
                            background: isSelected ? "var(--accent)" : hasData ? "var(--primary)" : "var(--border)",
                            minHeight: "4px",
                          }}
                        />
                        <span className="text-xs" style={{ color: "var(--muted-foreground)", fontSize: "9px" }}>
                          {d.getDate()}/{d.getMonth() + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: "var(--primary)" }} /><span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Ada data</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ background: "var(--border)" }} /><span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Tidak ada data</span></div>
                </div>
              </div>

              {/* Selected date detail */}
              {selectedDate && (
                <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
                    <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>
                      {new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </h3>
                    {selectedLogs.length > 0 && (
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="font-mono font-bold" style={{ color: "var(--primary)" }}>{Math.round(selectedTotals.energy)} kkal</span>
                        <span style={{ color: "var(--muted-foreground)" }}>P:{Math.round(selectedTotals.protein)}g</span>
                        <span style={{ color: "var(--muted-foreground)" }}>L:{Math.round(selectedTotals.fat)}g</span>
                        <span style={{ color: "var(--muted-foreground)" }}>K:{Math.round(selectedTotals.carbohydrate)}g</span>
                      </div>
                    )}
                  </div>
                  {selectedLogs.length === 0 ? (
                    <p className="px-5 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>{t("noHistory")}</p>
                  ) : (
                    <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                      {selectedLogs.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between px-5 py-3">
                          <div>
                            <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{entry.foodName}</p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{entry.weightGrams}g · {t(entry.mealType)}</p>
                          </div>
                          <span className="font-mono text-sm font-semibold" style={{ color: "var(--primary)" }}>{Math.round(entry.nutrients.energy)} kkal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {view === "list" && (
            <div className="space-y-4">
              {sortedDates.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <p className="text-4xl mb-3">📋</p>
                  <p style={{ color: "var(--muted-foreground)" }}>Belum ada riwayat makan.</p>
                </div>
              ) : (
                sortedDates.map((date) => {
                  const dayLogs = byDate[date];
                  const dayTotals = sumNutrients(dayLogs);
                  const pct = Math.round((dayTotals.energy / energy.tdee) * 100);
                  return (
                    <div key={date} className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted transition-all"
                        onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                      >
                        <div className="text-left">
                          <p className="font-display font-bold" style={{ color: "var(--foreground)" }}>
                            {new Date(date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{dayLogs.length} item · {pct}% dari kebutuhan</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold" style={{ color: "var(--primary)" }}>{Math.round(dayTotals.energy)} kkal</span>
                          <svg className={`w-4 h-4 transition-transform ${selectedDate === date ? "rotate-180" : ""}`} style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </button>
                      {selectedDate === date && (
                        <div className="divide-y border-t" style={{ borderColor: "var(--border)" }}>
                          {dayLogs.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between px-5 py-3">
                              <div>
                                <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{entry.foodName}</p>
                                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{entry.weightGrams}g · {t(entry.mealType)}</p>
                              </div>
                              <span className="font-mono text-sm font-semibold" style={{ color: "var(--primary)" }}>{Math.round(entry.nutrients.energy)} kkal</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
