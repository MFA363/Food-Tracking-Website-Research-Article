import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserLogs, deleteFoodLog } from "@/lib/firebase";
import { sumNutrients } from "@/lib/calculations";
import FoodSearchModal from "@/components/FoodSearchModal";
import type { FoodLogEntry, MealType } from "@/lib/types";

function todayStr() { return new Date().toISOString().split("T")[0]; }

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: "#F59E0B", lunch: "#16a34a", dinner: "#3B82F6", snack: "#A855F7",
};
const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎",
};

export default function FoodDiary() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [date, setDate] = useState(todayStr());
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultMeal, setDefaultMeal] = useState<MealType>("breakfast");
  const [filterMeal, setFilterMeal] = useState<MealType | "all">("all");
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserLogs(user.uid, date).then(setLogs).finally(() => setLoading(false));
  }, [user, date]);

  const handleAdd = (entry: FoodLogEntry) => setLogs((prev) => [...prev, entry]);
  const handleDelete = async (id: string) => {
    await deleteFoodLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const openCamera = async () => {
    setCapturedImage(null);
    setCameraOpen(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      alert("Kamera tidak dapat diakses. Pastikan izin kamera diberikan.");
      setCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg"));
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOpen(false);
    setCapturedImage(null);
  };

  const filteredLogs = filterMeal === "all" ? logs : logs.filter((l) => l.mealType === filterMeal);
  const totals = sumNutrients(logs);

  const mealGroups: Record<MealType, FoodLogEntry[]> = {
    breakfast: logs.filter((l) => l.mealType === "breakfast"),
    lunch: logs.filter((l) => l.mealType === "lunch"),
    dinner: logs.filter((l) => l.mealType === "dinner"),
    snack: logs.filter((l) => l.mealType === "snack"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl" style={{ color: "var(--foreground)" }}>{t("diaryTitle")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{t("diarySubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCamera}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-all"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {t("camera")}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-sm"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t("addFood")}
          </button>
        </div>
      </div>

      {/* Date picker + stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="border-none bg-transparent text-sm font-medium focus:outline-none"
            style={{ color: "var(--foreground)" }}
          />
        </div>

        <div className="flex-1 grid grid-cols-4 gap-2">
          {[
            { label: "Energi", value: `${Math.round(totals.energy)} kkal`, color: "var(--accent)" },
            { label: "Protein", value: `${Math.round(totals.protein * 10) / 10}g`, color: "#16a34a" },
            { label: "Lemak", value: `${Math.round(totals.fat * 10) / 10}g`, color: "#F59E0B" },
            { label: "Karbo", value: `${Math.round(totals.carbohydrate * 10) / 10}g`, color: "#3B82F6" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="font-mono text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meal filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "breakfast", "lunch", "dinner", "snack"] as (MealType | "all")[]).map((m) => (
          <button
            key={m}
            onClick={() => setFilterMeal(m)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border"
            style={
              filterMeal === m
                ? { background: "var(--primary)", color: "var(--primary-foreground)", borderColor: "var(--primary)" }
                : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
            }
          >
            {m === "all" ? t("allMeals") : `${MEAL_EMOJI[m]} ${t(m)}`}
          </button>
        ))}
      </div>

      {/* Meal sections */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-5xl mb-4">🍽️</p>
          <p className="font-display font-bold mb-2" style={{ color: "var(--foreground)" }}>{t("noFoodLogged")}</p>
          <button onClick={() => setModalOpen(true)} className="mt-4 px-6 py-3 rounded-xl font-medium text-sm" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{t("addFood")}</button>
        </div>
      ) : (
        <div className="space-y-4">
          {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((meal) => {
            const mealLogs = filterMeal === "all" ? mealGroups[meal] : filterMeal === meal ? mealGroups[meal] : [];
            if (mealLogs.length === 0 && filterMeal !== "all" && filterMeal !== meal) return null;
            const mealTotal = sumNutrients(mealLogs);
            return (
              <div key={meal} className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)", background: MEAL_COLORS[meal] + "15" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{MEAL_EMOJI[meal]}</span>
                    <span className="font-display font-bold" style={{ color: "var(--foreground)" }}>{t(meal)}</span>
                    {mealLogs.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: MEAL_COLORS[meal] + "25", color: MEAL_COLORS[meal] }}>
                        {Math.round(mealTotal.energy)} kkal
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { setDefaultMeal(meal); setModalOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: MEAL_COLORS[meal] + "20", color: MEAL_COLORS[meal] }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {t("add")}
                  </button>
                </div>

                {mealLogs.length === 0 ? (
                  <div className="px-5 py-4 text-center">
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Belum ada catatan untuk {t(meal).toLowerCase()}</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {mealLogs.map((entry) => (
                      <div key={entry.id} className="flex items-start justify-between gap-3 px-5 py-3 group hover:bg-muted transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{entry.foodName}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            {entry.weightGrams}g · {Math.round(entry.nutrients.energy)} kkal · P:{Math.round(entry.nutrients.protein*10)/10}g · L:{Math.round(entry.nutrients.fat*10)/10}g · K:{Math.round(entry.nutrients.carbohydrate*10)/10}g
                          </p>
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
                    {/* Meal subtotals */}
                    <div className="px-5 py-3 grid grid-cols-4 gap-2 text-xs" style={{ background: "var(--muted)" }}>
                      <div className="text-center"><p className="font-mono font-bold" style={{ color: MEAL_COLORS[meal] }}>{Math.round(mealTotal.energy)}</p><p style={{ color: "var(--muted-foreground)" }}>kkal</p></div>
                      <div className="text-center"><p className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{Math.round(mealTotal.protein*10)/10}g</p><p style={{ color: "var(--muted-foreground)" }}>Protein</p></div>
                      <div className="text-center"><p className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{Math.round(mealTotal.fat*10)/10}g</p><p style={{ color: "var(--muted-foreground)" }}>Lemak</p></div>
                      <div className="text-center"><p className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{Math.round(mealTotal.carbohydrate*10)/10}g</p><p style={{ color: "var(--muted-foreground)" }}>Karbo</p></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Camera modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between px-5 py-4">
              <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>{t("camera")}</h3>
              <button onClick={closeCamera} className="p-2 rounded-lg hover:bg-muted" style={{ color: "var(--muted-foreground)" }}>✕</button>
            </div>
            {capturedImage ? (
              <div className="p-4 space-y-4">
                <img src={capturedImage} alt="Captured" className="w-full rounded-xl" />
                <div className="p-4 rounded-xl" style={{ background: "var(--muted)" }}>
                  <p className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>💡 {t("cameraNote")}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Foto berhasil diambil. Sekarang cari makanan yang sesuai di daftar dan tambahkan porsinya.</p>
                </div>
                <button
                  onClick={() => { closeCamera(); setModalOpen(true); }}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Cari & Tambah Makanan
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black" style={{ aspectRatio: "4/3" }} />
                <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>{t("cameraNote")}</p>
                <button onClick={capturePhoto} className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                  📷 Ambil Foto
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <FoodSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        defaultMeal={defaultMeal}
        date={date}
      />
    </div>
  );
}
