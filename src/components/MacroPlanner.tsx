import { useId, useState } from "react";
import { calculateMacroTargets, deriveMacroPercentages, type MacroPercentages } from "@/lib/macronutrients";
import { useLanguage } from "@/contexts/LanguageContext";
import { downloadText } from "@/lib/workspace";
import Icon from "./Icon";
import HelpTip from "./HelpTip";

const macroKeys = ["carbohydrate", "protein", "fat"] as const;
const colors = { carbohydrate: "#14857e", protein: "#5165c6", fat: "#c78c31" };
interface Props { tdee: number; saved?: MacroPercentages; onSave?: (value: MacroPercentages) => Promise<void>; exportContext?: string; }

export default function MacroPlanner({ tdee, saved, onSave, exportContext = "Personal TDEE" }: Props) {
  const id = useId();
  const { lang } = useLanguage();
  const idn = lang === "id";
  const tx = (en: string, ind: string) => idn ? ind : en;
  const [form, setForm] = useState(() => ({ protein: saved ? String(saved.protein) : "", fat: saved ? String(saved.fat) : "" }));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [statusError, setStatusError] = useState(false);
  const labels = { carbohydrate: tx("Carbohydrate", "Karbohidrat"), protein: "Protein", fat: tx("Fat", "Lemak") };
  const entered = form.protein.trim() !== "" && form.fat.trim() !== "";
  let percentages: MacroPercentages | null = null;
  let targets: ReturnType<typeof calculateMacroTargets> | null = null;
  let error = "";
  if (entered) {
    try { percentages = deriveMacroPercentages(Number(form.protein), Number(form.fat)); }
    catch { error = tx("Use values from 0 to 100. Protein + fat must not exceed 100%.", "Gunakan nilai 0–100. Jumlah protein + lemak tidak boleh melebihi 100%."); }
    if (percentages && Number.isFinite(tdee) && tdee > 0) targets = calculateMacroTargets(tdee, percentages);
  }
  function change(key: "protein" | "fat", value: string) {
    setForm((previous) => ({ ...previous, [key]: value })); setStatus("");
  }
  async function save() {
    if (!onSave || !percentages || !targets || saving) return;
    setSaving(true); setStatus(""); setStatusError(false);
    try { await onSave(percentages); setStatus(tx("Targets saved. Your intake comparisons are updated.", "Target tersimpan. Perbandingan asupan telah diperbarui.")); }
    catch { setStatusError(true); setStatus(tx("Targets could not be saved. Check your connection and try again.", "Target belum tersimpan. Periksa koneksi dan coba lagi.")); }
    finally { setSaving(false); }
  }
  function exportSummary() {
    if (!targets || !percentages) return;
    downloadText("CalNut-macronutrient-summary.txt", ["CalNut — macronutrient estimate", exportContext, `TDEE: ${tdee} kcal/day`, ...macroKeys.map((key) => `${key}: ${percentages![key]}% | ${targets![key].energy.toFixed(1)} kcal/day | ${targets![key].grams.toFixed(1)} g/day`), "Carbohydrate % = 100 − protein % − fat %", "Energy = TDEE × percentage / 100; grams = energy / 4 (carbohydrate, protein) or / 9 (fat).", "Planning estimate, not a diagnosis or prescription. Adult assumptions and sources: /references"].join("\n"));
  }
  return <section className="panel macro-planner" aria-labelledby={`${id}-title`}>
    <div className="panel-heading"><div><p className="eyebrow">{tx("DAILY TARGETS", "TARGET HARIAN")}</p><h2 id={`${id}-title`}>{tx("Macronutrients", "Makronutrien")} <HelpTip label={tx("Macronutrient calculation", "Perhitungan makronutrien")}>{tx("Enter protein and fat. Carbohydrate is the remainder to 100%. Grams use TDEE with 4/4/9 kcal per gram.", "Masukkan protein dan lemak. Karbohidrat adalah sisa hingga 100%. Gram dihitung dari TDEE dengan 4/4/9 kkal per gram.")}</HelpTip></h2></div><span className="pill"><Icon name="lab" size={16} />{tx("Live", "Langsung")}</span></div>
    <div className="macro-inputs">
      {(["protein", "fat"] as const).map((key) => <div className="macro-field" key={key}>
        <label htmlFor={`${id}-${key}`}><span className="color-dot" style={{ background: colors[key] }} />{labels[key]}</label>
        <div className="percent-input"><input id={`${id}-${key}`} type="number" inputMode="decimal" min="0" max="100" step="0.01" value={form[key]} disabled={saving} onChange={(event) => change(key, event.target.value)} aria-invalid={!!error} aria-describedby={`${id}-validation`} /><span>%</span></div>
        <input type="range" aria-label={`${labels[key]} ${tx("percentage slider", "persen")}`} min="0" max="100" step="1" value={form[key] === "" ? 0 : Math.min(100, Math.max(0, Number(form[key]) || 0))} onChange={(event) => change(key, event.target.value)} disabled={saving} style={{ accentColor: colors[key] }} />
      </div>)}
      <div className="macro-field computed-field"><label htmlFor={`${id}-carbohydrate`}><span className="color-dot" style={{ background: colors.carbohydrate }} />{labels.carbohydrate}</label><div className="percent-input"><output id={`${id}-carbohydrate`} aria-live="polite">{percentages ? Number(percentages.carbohydrate.toFixed(2)) : "—"}</output><span>%</span></div><p className="computed-label"><Icon name="check" size={14} />{tx("Automatically calculated", "Dihitung otomatis")}</p></div>
    </div>
    <p id={`${id}-validation`} className={`validation-line ${error ? "error-text" : ""}`} role="status">{error || (!entered ? tx("Enter protein and fat percentages to begin.", "Masukkan persentase protein dan lemak untuk mulai.") : !targets ? tx("Allocation totals 100%. Complete a valid TDEE to calculate grams.", "Alokasi berjumlah 100%. Lengkapi TDEE yang valid untuk menghitung gram.") : tx("Balanced: carbohydrate + protein + fat = 100%", "Seimbang: karbohidrat + protein + lemak = 100%"))}</p>
    {percentages && <div className="macro-stack" role="img" aria-label={macroKeys.map((key) => `${labels[key]} ${percentages![key]}%`).join(", ")}>{macroKeys.map((key) => <span key={key} style={{ width: `${percentages![key]}%`, background: colors[key] }} />)}</div>}
    {targets && <div className="macro-results">{macroKeys.map((key) => <div key={key}><p><span className="color-dot" style={{ background: colors[key] }} />{labels[key]}</p><strong>{targets![key].grams.toFixed(1)} <small>g/{tx("day", "hari")}</small></strong><span className="muted">{targets![key].energy.toFixed(1)} kcal · {percentages![key]}%</span></div>)}</div>}
    <details className="method-details"><summary>{tx("Calculation details", "Rincian perhitungan")}</summary><div className="method-content"><p>{tx("Carbohydrate % = 100 − protein % − fat %. Energy = TDEE × percentage ÷ 100; grams = energy ÷ 4 for carbohydrate/protein or ÷ 9 for fat.", "Karbohidrat % = 100 − protein % − lemak %. Energi = TDEE × persentase ÷ 100; gram = energi ÷ 4 untuk karbohidrat/protein atau ÷ 9 untuk lemak.")}</p>{targets && <div className="formula-grid">{macroKeys.map((key) => <p key={key}><strong>{labels[key]}</strong><br />({tdee} × {percentages![key]} ÷ 100) ÷ {key === "fat" ? 9 : 4} = {targets![key].grams.toFixed(1)} g</p>)}</div>}<a href="/references">{tx("Sources & assumptions", "Sumber & asumsi")}</a></div></details>
    <div className="planner-actions">{onSave && <button className="btn-primary" disabled={!targets || saving} onClick={save}><Icon name="check" size={17} />{saving ? tx("Saving…", "Menyimpan…") : tx("Save targets", "Simpan target")}</button>}<button className="btn-secondary" disabled={!targets || saving} onClick={exportSummary}><Icon name="download" size={17} />{tx("Export calculation", "Ekspor perhitungan")}</button><button className="btn-text" disabled={saving} onClick={() => { setForm({ protein: saved ? String(saved.protein) : "", fat: saved ? String(saved.fat) : "" }); setStatus(""); }}>{tx(saved ? "Restore saved" : "Clear inputs", saved ? "Pulihkan tersimpan" : "Kosongkan")}</button></div>
    {status && <p role="status" className={statusError ? "error-text" : "success-text"}>{status}</p>}
  </section>;
}
