import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchFoods, FOOD_CATEGORIES, FOOD_UNITS, getFoodById } from "@/lib/foodDatabase";
import { loadTkpiFoods, searchTkpiFoods } from "@/lib/tkpiDatabase";
import { calculateFoodNutrients } from "@/lib/calculations";
import { addFoodLog, getCustomFoods } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { Food, MealType, FoodLogEntry } from "@/lib/types";

interface FoodSearchModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: FoodLogEntry) => void;
  defaultMeal?: MealType;
  date: string;
  editEntry?: FoodLogEntry | null;
}

export default function FoodSearchModal({
  open,
  onClose,
  onAdd,
  defaultMeal = "breakfast",
  date,
  editEntry,
}: FoodSearchModalProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [mealType, setMealType] = useState<MealType>(defaultMeal);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitLabel, setUnitLabel] = useState("gram (g)");
  const [unitGrams, setUnitGrams] = useState(100);
  const [customWeight, setCustomWeight] = useState<number>(100);
  const [useCustomWeight, setUseCustomWeight] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [tkpiFoods, setTkpiFoods] = useState<Food[]>([]);
  const [dataError, setDataError] = useState("");

  const isEditingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize modal state & load Firebase custom foods
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    loadTkpiFoods().then((foods) => { if (isMounted) setTkpiFoods(foods); }).catch(() => { if (isMounted) setDataError("Food data could not be loaded. Please retry."); });
    setQuery("");
    setCategory("all");
    setSelected(null);
    setQuantity(1);
    setUnitLabel("gram (g)");
    setUnitGrams(100);
    setCustomWeight(100);
    setUseCustomWeight(false);
    setMealType(defaultMeal);
    isEditingRef.current = !!editEntry;

    // Delayed auto-focus for mobile rendering ease
    const focusTimer = setTimeout(() => {
      if (isMounted) inputRef.current?.focus();
    }, 100);

    getCustomFoods()
      .then((fetchedCustomFoods) => {
        if (!isMounted) return;
        setCustomFoods(fetchedCustomFoods);

        if (editEntry) {
          const food =
            getFoodById(editEntry.foodId) ||
            fetchedCustomFoods.find((f) => f.id === editEntry.foodId);

          if (food) {
            setSelected(food);
            setMealType(editEntry.mealType);
            setCustomWeight(editEntry.weightGrams || 100);
            setUnitLabel(editEntry.unit || "gram (g)");
            setUnitGrams(editEntry.unitGrams || 100);
            setQuantity(editEntry.quantity || 1);
            setUseCustomWeight(editEntry.unit === "gram (g)" || !editEntry.unit);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load custom foods:", err);
      });

    return () => {
      isMounted = false;
      clearTimeout(focusTimer);
    };
  }, [open, defaultMeal, editEntry]);

  // Filter foods by query & selected category
  useEffect(() => {
    const q = query.toLowerCase().trim();
    const localResults = searchTkpiFoods(tkpiFoods.filter((food) => category === "all" || food.category === category), query);

    const customResults = customFoods.filter((f) => {
      const matchCategory = category === "all" || f.category === category;
      const matchName =
        !q ||
        f.name[lang]?.toLowerCase().includes(q) ||
        f.name.id?.toLowerCase().includes(q) ||
        f.name.en?.toLowerCase().includes(q);
      return matchCategory && matchName;
    });

    const localIds = new Set(localResults.map((r) => r.id));
    const combined = [
      ...localResults,
      ...customResults.filter((f) => !localIds.has(f.id)),
    ];

    setResults(combined.slice(0, 20));
  }, [query, category, lang, customFoods, tkpiFoods]);

  // Configure default units on selection (skips overwrite during edit mode initialization)
  useEffect(() => {
    if (!selected) return;

    if (isEditingRef.current) {
      isEditingRef.current = false;
      return;
    }

    const defaultUnits = getUnitsForFood(selected);
    if (defaultUnits.length > 0) {
      setUnitLabel(defaultUnits[0].label);
      setUnitGrams(defaultUnits[0].grams);
      setCustomWeight(defaultUnits[0].grams);
    }
  }, [selected]);

  function getUnitsForFood(food: Food) {
    const key = food.defaultUnit || "porsi";
    const specificUnits = FOOD_UNITS[key] || [];
    const defaultUnits = FOOD_UNITS.default || [];
    return [...specificUnits, ...defaultUnits];
  }

  function getFoodName(food: Food): string {
    return food.name[lang] || food.name.id || food.name.en || "";
  }

  const totalGrams = useCustomWeight
    ? Math.max(0, customWeight || 0)
    : Math.max(0, (quantity || 0) * (unitGrams || 0));

  const calculatedNutrients = selected
    ? calculateFoodNutrients(selected.nutrients, totalGrams)
    : null;

  const handleAdd = async () => {
    if (!selected || !user || totalGrams <= 0) return;
    setSaving(true);

    try {
      const entry: Omit<FoodLogEntry, "id"> & { id?: string } = {
        ...(editEntry?.id ? { id: editEntry.id } : {}),
        userId: user.uid,
        foodId: selected.id,
        foodName: getFoodName(selected),
        date,
        mealType,
        weightGrams: totalGrams,
        unit: useCustomWeight ? "gram (g)" : unitLabel,
        unitGrams: useCustomWeight ? 1 : unitGrams,
        quantity: useCustomWeight ? customWeight : quantity,
        nutrients: calculatedNutrients!,
        loggedAt: editEntry?.loggedAt || new Date().toISOString(),
      };

      const saved = await addFoodLog(entry);
      onAdd(saved);
      onClose();
    } catch (err) {
      console.error("Failed to add or update food log:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--card)", maxHeight: "90vh" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
            {selected ? getFoodName(selected) : t("addFood")}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-all" style={{ color: "var(--muted-foreground)" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {!selected ? (
            <div className="p-4 space-y-3">
              <p className="text-xs">Imported values require source verification. Invalid or incomplete rows are excluded. <a href="/references" className="underline">Sources and data quality</a></p>
              {dataError && <p role="alert">{dataError}</p>}
              {/* Meal Selector */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
                {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMealType(m)}
                    className="py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={
                      mealType === m
                        ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                        : { color: "var(--muted-foreground)" }
                    }
                  >
                    {t(m)}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchFood")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {FOOD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                    style={
                      category === cat.id
                        ? { background: "var(--primary)", color: "var(--primary-foreground)", borderColor: "var(--primary)" }
                        : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
                    }
                  >
                    {lang === "id" ? cat.id_lang : cat.en}
                  </button>
                ))}
              </div>

              {/* Food List */}
              <div className="space-y-1">
                {results.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Tidak ada makanan ditemukan
                  </p>
                ) : (
                  results.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelected(food)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted transition-all text-left border"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                          {getFoodName(food)}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {food.nutrients?.energy ?? 0} kkal / 100g
                        </p>
                      </div>
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Back to List */}
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-medium hover:opacity-75 transition-all" style={{ color: "var(--primary)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t("back")}
              </button>

              {/* Selected Food Macro Card */}
              <div className="p-4 rounded-xl" style={{ background: "var(--muted)" }}>
                <h4 className="font-display font-bold" style={{ color: "var(--foreground)" }}>
                  {getFoodName(selected)}
                </h4>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: "Energi", value: `${selected.nutrients?.energy ?? 0}`, unit: "kkal" },
                    { label: "Protein", value: `${selected.nutrients?.protein ?? 0}`, unit: "g" },
                    { label: "Lemak", value: `${selected.nutrients?.fat ?? 0}`, unit: "g" },
                    { label: "Karbo", value: `${selected.nutrients?.carbohydrate ?? 0}`, unit: "g" },
                  ].map((n) => (
                    <div key={n.label} className="text-center p-2 rounded-lg" style={{ background: "var(--card)" }}>
                      <p className="font-mono text-xs font-bold" style={{ color: "var(--primary)" }}>{n.value}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{n.unit}</p>
                      <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{n.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>per 100g</p>
              </div>

              {/* Meal Category Select */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{t("mealTime")}</label>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
                  {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((m) => (
                    <button key={m} onClick={() => setMealType(m)} className="py-1.5 rounded-lg text-xs font-medium transition-all" style={mealType === m ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}>
                      {t(m)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Serving Input / Custom Weight Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{t("quantity")}</label>
                  <button
                    onClick={() => setUseCustomWeight(!useCustomWeight)}
                    className="text-xs font-medium underline"
                    style={{ color: "var(--primary)" }}
                  >
                    {useCustomWeight ? "Ganti ke satuan" : "Input berat (gram)"}
                  </button>
                </div>

                {useCustomWeight ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={customWeight || ""}
                      onChange={(e) => setCustomWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                      className="flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                      style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>gram</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={quantity || ""}
                      onChange={(e) => setQuantity(e.target.value === "" ? 0 : Number(e.target.value))}
                      className="w-20 px-3 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 text-center"
                      style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                    <select
                      value={unitLabel}
                      onChange={(e) => {
                        const units = getUnitsForFood(selected);
                        const found = units.find((u) => u.label === e.target.value);
                        if (found) { setUnitLabel(found.label); setUnitGrams(found.grams); }
                      }}
                      className="flex-1 px-3 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                      style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      {getUnitsForFood(selected).map((u) => (
                        <option key={u.label} value={u.label}>{u.label} ({u.grams}g)</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Dynamic Nutrient Calculations */}
              {calculatedNutrients && (
                <div className="p-4 rounded-xl border" style={{ borderColor: "var(--primary)", background: "var(--secondary)" }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: "var(--secondary-foreground)" }}>
                    Total untuk {totalGrams}g:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Energi</span><span className="font-mono font-bold" style={{ color: "var(--primary)" }}>{Math.round(calculatedNutrients.energy)} kkal</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Protein</span><span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{(Math.round(calculatedNutrients.protein * 10) / 10)}g</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Lemak</span><span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{(Math.round(calculatedNutrients.fat * 10) / 10)}g</span></div>
                    <div className="flex justify-between"><span style={{ color: "var(--muted-foreground)" }}>Karbo</span><span className="font-mono font-semibold" style={{ color: "var(--foreground)" }}>{(Math.round(calculatedNutrients.carbohydrate * 10) / 10)}g</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Submit Footer */}
        {selected && (
          <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={handleAdd}
              disabled={saving || totalGrams <= 0}
              className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {saving ? t("saving") : `${t("addEntry")} · ${Math.round(calculatedNutrients?.energy ?? 0)} kkal`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
