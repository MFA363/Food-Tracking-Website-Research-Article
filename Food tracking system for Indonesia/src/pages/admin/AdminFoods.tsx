import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getCustomFoods, addCustomFood, deleteCustomFood, updateCustomFood } from "@/lib/firebase";
import { FOOD_DATABASE, FOOD_CATEGORIES } from "@/lib/foodDatabase";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Food, Nutrients } from "@/lib/types";

const EMPTY_NUTRIENTS: Nutrients = { energy: 0, protein: 0, fat: 0, carbohydrate: 0, fiber: 0, calcium: 0, phosphorus: 0, iron: 0, sodium: 0, potassium: 0, copper: 0, zinc: 0 };

export default function AdminFoods() {
  const { t } = useLanguage();
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState<Food | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSource, setShowSource] = useState<"builtin" | "custom">("builtin");

  const [form, setForm] = useState<{ nameId: string; nameEn: string; category: string; defaultUnit: string; defaultWeight: number; nutrients: Nutrients }>({
    nameId: "", nameEn: "", category: "grains", defaultUnit: "porsi", defaultWeight: 100, nutrients: { ...EMPTY_NUTRIENTS },
  });

  useEffect(() => { getCustomFoods().then(setCustomFoods).finally(() => setLoading(false)); }, []);

  const allFoods = showSource === "builtin" ? FOOD_DATABASE : customFoods;
  const filtered = allFoods.filter((f) => {
    const matchCat = catFilter === "all" || f.category === catFilter;
    const matchSearch = !search || f.name.id?.toLowerCase().includes(search.toLowerCase()) || f.name.en?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const setN = (key: keyof Nutrients, val: string) => setForm((f) => ({ ...f, nutrients: { ...f.nutrients, [key]: Number(val) } }));

  const handleSave = async () => {
    if (!form.nameId) { alert("Nama (Indonesia) wajib diisi."); return; }
    setSaving(true);
    const id = "custom_" + Date.now();
    const food: Food = {
      id: editing?.id || id,
      name: { id: form.nameId, en: form.nameEn || form.nameId, ms: form.nameId, jv: form.nameId, ar: form.nameId },
      category: form.category,
      nutrients: form.nutrients,
      defaultUnit: form.defaultUnit,
      defaultWeight: form.defaultWeight,
      isCustom: true,
    };
    if (editing) {
      await updateCustomFood(editing.id, food);
      setCustomFoods((prev) => prev.map((f) => f.id === editing.id ? food : f));
    } else {
      await addCustomFood(food);
      setCustomFoods((prev) => [...prev, food]);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm({ nameId: "", nameEn: "", category: "grains", defaultUnit: "porsi", defaultWeight: 100, nutrients: { ...EMPTY_NUTRIENTS } });
  };

  const handleEdit = (food: Food) => {
    setEditing(food);
    setForm({
      nameId: food.name.id || "",
      nameEn: food.name.en || "",
      category: food.category,
      defaultUnit: food.defaultUnit,
      defaultWeight: food.defaultWeight,
      nutrients: { ...food.nutrients },
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCustomFood(id);
    setCustomFoods((prev) => prev.filter((f) => f.id !== id));
    setConfirmDelete(null);
  };

  const NUTRIENT_FIELDS: { key: keyof Nutrients; label: string; unit: string }[] = [
    { key: "energy", label: "Energi", unit: "kkal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "fat", label: "Lemak", unit: "g" },
    { key: "carbohydrate", label: "Karbohidrat", unit: "g" },
    { key: "fiber", label: "Serat", unit: "g" },
    { key: "calcium", label: "Kalsium", unit: "mg" },
    { key: "phosphorus", label: "Fosfor", unit: "mg" },
    { key: "iron", label: "Zat Besi", unit: "mg" },
    { key: "sodium", label: "Natrium", unit: "mg" },
    { key: "potassium", label: "Kalium", unit: "mg" },
    { key: "copper", label: "Tembaga", unit: "mg" },
    { key: "zinc", label: "Seng", unit: "mg" },
  ];

  const inputStyle = { background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchFoods")} className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
          </div>
          <div className="flex gap-2">
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-3 py-3 rounded-xl border text-sm" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}>
              {FOOD_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.id_lang}</option>)}
            </select>
            <button onClick={() => { setShowForm(true); setEditing(null); }} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah
            </button>
          </div>
        </div>

        {/* Source toggle */}
        <div className="flex gap-1 w-fit p-1 rounded-xl" style={{ background: "var(--muted)" }}>
          <button onClick={() => setShowSource("builtin")} className="px-4 py-2 rounded-lg text-sm font-medium" style={showSource === "builtin" ? { background: "var(--card)", color: "var(--foreground)" } : { color: "var(--muted-foreground)" }}>
            Database Bawaan ({FOOD_DATABASE.length})
          </button>
          <button onClick={() => setShowSource("custom")} className="px-4 py-2 rounded-lg text-sm font-medium" style={showSource === "custom" ? { background: "var(--card)", color: "var(--foreground)" } : { color: "var(--muted-foreground)" }}>
            Makanan Kustom ({customFoods.length})
          </button>
        </div>

        {/* Food table */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Nama (ID)", "Nama (EN)", "Kategori", "Energi/100g", "Protein", "Lemak", "Karbo", "Aksi"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Tidak ada makanan ditemukan.</td></tr>
                ) : (
                  filtered.map((food) => (
                    <tr key={food.id} className="hover:bg-muted transition-all">
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>{food.name.id}</td>
                      <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{food.name.en}</td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>{food.category}</span></td>
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: "var(--primary)" }}>{food.nutrients.energy}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--foreground)" }}>{food.nutrients.protein}g</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--foreground)" }}>{food.nutrients.fat}g</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--foreground)" }}>{food.nutrients.carbohydrate}g</td>
                      <td className="px-4 py-3">
                        {food.isCustom && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(food)} className="p-1.5 rounded-lg hover:bg-blue-50" style={{ color: "#3B82F6" }}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => setConfirmDelete(food.id)} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: "#EF4444" }}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border shadow-2xl my-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>{editing ? t("editFoodItem") : t("addFoodItem")}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ color: "var(--muted-foreground)" }}>✕</button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Nama (Indonesia)*</label>
                  <input type="text" value={form.nameId} onChange={(e) => setForm((f) => ({ ...f, nameId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Nama (English)</label>
                  <input type="text" value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Kategori</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm" style={inputStyle}>
                    {FOOD_CATEGORIES.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.id_lang}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>Satuan Default</label>
                  <input type="text" value={form.defaultUnit} onChange={(e) => setForm((f) => ({ ...f, defaultUnit: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm" style={inputStyle} placeholder="porsi, gelas, buah..." />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Nilai Gizi per 100g</p>
              <div className="grid grid-cols-2 gap-3">
                {NUTRIENT_FIELDS.map((n) => (
                  <div key={n.key}>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>{n.label} ({n.unit})</label>
                    <input type="number" min="0" step="0.01" value={form.nutrients[n.key]} onChange={(e) => setN(n.key, e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono" style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--foreground)" }}>Hapus Makanan?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border font-medium text-sm" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>{t("cancel")}</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#EF4444", color: "white" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
