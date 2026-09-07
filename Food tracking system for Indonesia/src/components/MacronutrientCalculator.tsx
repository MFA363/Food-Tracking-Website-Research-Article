import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firebase";
import { calculateMacroTargets, type MacroPercentages } from "@/lib/macronutrients";

const keys = ["carbohydrate", "protein", "fat"] as const;
const labels = { carbohydrate: "Carbohydrate", protein: "Protein", fat: "Fat" };

export default function MacronutrientCalculator({ tdee }: { tdee: number }) {
  const { user, refreshUser } = useAuth();
  const saved = user?.macroPercentages;
  const [form, setForm] = useState({ carbohydrate: saved ? String(saved.carbohydrate) : "", protein: saved ? String(saved.protein) : "", fat: saved ? String(saved.fat) : "" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const percentages: MacroPercentages = { carbohydrate: Number(form.carbohydrate), protein: Number(form.protein), fat: Number(form.fat) };
  const complete = keys.every((key) => form[key].trim() !== "");
  let error = complete ? "" : "Enter all three percentages to calculate your requirements.";
  let targets: ReturnType<typeof calculateMacroTargets> | null = null;
  if (complete) {
    try { targets = calculateMacroTargets(tdee, percentages); }
    catch (cause) { error = cause instanceof Error ? cause.message : "Check your percentages."; }
  }
  const total = percentages.carbohydrate + percentages.protein + percentages.fat;
  async function save() {
    if (!user || !targets || saving) return;
    setSaving(true); setStatus("");
    try { await updateUserProfile(user.uid, { macroPercentages: percentages }); await refreshUser(); setStatus("Macronutrient targets saved."); }
    catch { setStatus("Unable to save targets. Please try again."); }
    finally { setSaving(false); }
  }
  return <section className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }} aria-labelledby="macro-title">
    <div><h2 id="macro-title" className="font-display font-bold text-lg">Macronutrient requirements</h2><p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Allocate your TDEE across carbohydrate, protein, and fat.</p></div>
    <p id="macro-hint" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Carbohydrate: 45â€“65% Â· Protein: 20â€“30% Â· Fat: 10â€“20%</p>
    <div className="grid sm:grid-cols-3 gap-4">{keys.map((key) => <label key={key} className="block text-sm font-medium">{labels[key]} %<input type="number" min="0" max="100" step="0.01" value={form[key]} disabled={saving} aria-describedby="macro-hint macro-validation" onChange={(event) => { setForm({ ...form, [key]: event.target.value }); setStatus(""); }} className="mt-2 w-full border rounded-lg px-3 py-2" style={{ background: "var(--background)", borderColor: "var(--border)" }} /></label>)}</div>
    <p id="macro-validation" role="status" className="text-sm" style={{ color: error ? "#B45309" : "var(--primary)" }}>Total: {Number.isFinite(total) ? Number(total.toFixed(2)) : "â€”"}% / 100%. {error}</p>
    {targets && <div className="overflow-x-auto"><table className="w-full text-sm text-left"><caption className="text-left mb-2 font-semibold">TDEE: {tdee.toLocaleString()} kcal/day</caption><thead><tr><th className="py-2">Macronutrient</th><th>Energy (kcal/day)</th><th>Requirement (g/day)</th></tr></thead><tbody>{keys.map((key) => <tr key={key} className="border-t" style={{ borderColor: "var(--border)" }}><th className="py-3 font-medium">{labels[key]}</th><td>{targets[key].energy.toFixed(1)}</td><td>{targets[key].grams.toFixed(1)}</td></tr>)}</tbody></table></div>}
    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Energy = TDEE Ã— percentage Ã· 100. Carbohydrate and protein: 4 kcal/g; fat: 9 kcal/g. Grams = allocated energy Ã· kcal/g. The ranges above are hints; the total must equal 100%.</p>
    <button onClick={save} disabled={!targets || saving} className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ background: "var(--primary)", color: "white" }}>{saving ? "Savingâ€¦" : "Save targets"}</button>
    <p role="status" className="text-sm">{status}</p>
  </section>;
}
