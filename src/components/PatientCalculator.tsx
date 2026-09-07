import { useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateEnergyRequirement, calculateBMI } from "@/lib/calculations";
import { calculateMacroTargets, deriveMacroPercentages } from "@/lib/macronutrients";
import { downloadText } from "@/lib/workspace";
import type { ActivityLevel, Gender } from "@/lib/types";
import Icon from "./Icon";

type CaseForm = { weight: string; height: string; age: string; gender: Gender; activity: ActivityLevel; protein: string; fat: string };
const empty: CaseForm = { weight: "", height: "", age: "", gender: "female", activity: "light", protein: "", fat: "" };
const keys = ["carbohydrate", "protein", "fat"] as const;
type Result = { form: CaseForm; energy: ReturnType<typeof calculateEnergyRequirement>; bmi: ReturnType<typeof calculateBMI>; percentages: ReturnType<typeof deriveMacroPercentages>; macros: ReturnType<typeof calculateMacroTargets> };

export default function PatientCalculator() {
  const id = useId(); const { lang, t } = useLanguage();
  const tx = (en: string, ind: string) => lang === "id" ? ind : en;
  const [form, setForm] = useState<CaseForm>({ ...empty });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState(""); const [teaching, setTeaching] = useState(false);
  const [reveal, setReveal] = useState(false);
  const stale = result !== null && JSON.stringify(result.form) !== JSON.stringify(form);
  const labels = { carbohydrate: tx("Carbohydrate", "Karbohidrat"), protein: "Protein", fat: tx("Fat", "Lemak") };
  let carbohydrate: number | null = null;
  if (form.protein.trim() && form.fat.trim()) {
    try { carbohydrate = deriveMacroPercentages(Number(form.protein), Number(form.fat)).carbohydrate; } catch { /* Validation is shown on Calculate. */ }
  }
  function change(key: keyof CaseForm, value: string) { setForm((previous) => ({ ...previous, [key]: value })); setError(""); setReveal(false); }
  function calculate(event: FormEvent) {
    event.preventDefault(); setError(""); setReveal(false);
    if (![form.weight, form.height, form.age, form.protein, form.fat].every((value) => value.trim() !== "" && Number.isFinite(Number(value)))) { setError(tx("Complete all measurements and protein/fat percentages.", "Lengkapi pengukuran dan persentase protein/lemak.")); return; }
    const weight = Number(form.weight), height = Number(form.height), age = Number(form.age);
    if (weight < 20 || weight > 300 || height < 50 || height > 250 || age < 19 || age > 78 || !Number.isInteger(age)) { setError(tx("Use adult values: age 19–78 whole years, height 50–250 cm, weight 20–300 kg.", "Gunakan nilai dewasa: usia bulat 19–78 tahun, tinggi 50–250 cm, berat 20–300 kg.")); return; }
    try {
      const percentages = deriveMacroPercentages(Number(form.protein), Number(form.fat));
      const energy = calculateEnergyRequirement(weight, height, age, form.gender, form.activity);
      if (!Number.isFinite(energy.tdee) || energy.tdee <= 0) {
        setError(tx("These measurements produce a non-positive energy estimate. Check the inputs; this equation may not be suitable for this case.", "Pengukuran ini menghasilkan estimasi energi tidak positif. Periksa input; rumus ini mungkin tidak sesuai untuk kasus ini."));
        setResult(null);
        return;
      }
      setResult({ form: { ...form }, energy, bmi: calculateBMI(weight, height), percentages, macros: calculateMacroTargets(energy.tdee, percentages) });
    } catch { setError(tx("Protein and fat must each be 0–100% and their sum cannot exceed 100%.", "Protein dan lemak masing-masing harus 0–100% dan jumlahnya tidak melebihi 100%.")); }
  }
  function startNew() { setForm({ ...empty }); setResult(null); setError(""); setReveal(false); }
  function exportCase() {
    if (!result || stale) return;
    downloadText("CalNut-anonymous-case.txt", [
      "CalNut — anonymous adult estimate",
      "Weight: " + result.form.weight + " kg | Height: " + result.form.height + " cm | Age: " + result.form.age + " | Sex: " + result.form.gender,
      "Activity: " + result.form.activity + " ×" + result.energy.activityFactor,
      "BMI: " + result.bmi.value + " kg/m² | REE: " + result.energy.bmr + " kcal/day | TDEE: " + result.energy.tdee + " kcal/day",
      ...keys.map((key) => key + ": " + result.percentages[key] + "% | " + result.macros[key].energy.toFixed(1) + " kcal/day | " + result.macros[key].grams.toFixed(1) + " g/day"),
      "Carbohydrate % = 100 − protein % − fat %",
      "Energy = TDEE × percentage / 100; grams = energy / 4 (carbohydrate, protein) or / 9 (fat).",
      "Planning estimate only. No pregnancy, lactation or disease-specific adjustments. Methods: /references",
      "This calculation is separate from your personal profile and diary."
    ].join("\n"));
  }
  return <section className="panel patient-calculator" id="patient-calculator" aria-labelledby={id + "-title"}>
    <div className="panel-heading"><div><p className="eyebrow">{tx("SEPARATE FROM YOUR PERSONAL PROFILE", "TERPISAH DARI PROFIL PRIBADI")}</p><h2 id={id + "-title"}>{tx("Patient / teaching calculator", "Kalkulator pasien / pembelajaran")}</h2><p className="muted">{tx("Calculate for another adult without changing your own information.", "Hitung untuk orang dewasa lain tanpa mengubah informasi Anda sendiri.")}</p></div><span className="pill"><Icon name="lab" size={16} />{tx("Session only", "Sesi ini saja")}</span></div>
    <div className="segmented-control" aria-label={tx("Calculator mode", "Mode kalkulator")}><button type="button" aria-pressed={!teaching} className={!teaching ? "selected" : ""} onClick={() => setTeaching(false)}>{tx("Practice", "Praktik")}</button><button type="button" aria-pressed={teaching} className={teaching ? "selected" : ""} onClick={() => setTeaching(true)}>{tx("Teaching", "Pembelajaran")}</button></div>
    <form onSubmit={calculate} noValidate>
      <div className="patient-input-grid">
        <fieldset><legend>01 / {tx("Measurements & assumptions", "Pengukuran & asumsi")}</legend><div className="case-fields">
          {([["weight", tx("Weight (kg)", "Berat (kg)"), 20, 300], ["height", tx("Height (cm)", "Tinggi (cm)"), 50, 250], ["age", tx("Age (years)", "Usia (tahun)"), 19, 78]] as const).map(([key, label, min, max]) => <label key={key} htmlFor={id + "-" + key}>{label}<input id={id + "-" + key} type="number" inputMode="decimal" required min={min} max={max} step={key === "age" ? 1 : 0.1} value={form[key]} onChange={(event) => change(key, event.target.value)} /></label>)}
          <label htmlFor={id + "-sex"}>{tx("Sex used in equation", "Jenis kelamin untuk rumus")}<select id={id + "-sex"} value={form.gender} onChange={(event) => change("gender", event.target.value)}><option value="female">{t("female")}</option><option value="male">{t("male")}</option></select></label>
          <label htmlFor={id + "-activity"} className="case-wide">{tx("Activity assumption", "Asumsi aktivitas")}<select id={id + "-activity"} value={form.activity} onChange={(event) => change("activity", event.target.value)}>{(["sedentary", "light", "moderate", "active", "very_active"] as const).map((level) => <option key={level} value={level}>{t(level)} · ×{calculateEnergyRequirement(60,165,30,form.gender,level).activityFactor}</option>)}</select></label>
        </div></fieldset>
        <fieldset><legend>02 / {tx("Macronutrient allocation", "Alokasi makronutrien")}</legend><div className="case-fields">
          {(["protein", "fat"] as const).map((key) => <label key={key} htmlFor={id + "-" + key}>{labels[key]} %<input id={id + "-" + key} type="number" inputMode="decimal" min="0" max="100" step="0.01" required value={form[key]} onChange={(event) => change(key, event.target.value)} /></label>)}
          <div className="case-wide patient-carbohydrate"><label htmlFor={id + "-carbohydrate"}>{labels.carbohydrate} %</label><output id={id + "-carbohydrate"} aria-live="polite">{carbohydrate === null ? "—" : Number(carbohydrate.toFixed(2))}%</output><span>{tx("Automatic: 100 − protein − fat", "Otomatis: 100 − protein − lemak")}</span></div>
        </div><p className="small-text muted">{tx("Age, sex, and activity are needed for TDEE. Percentages must total 100%. No patient name or identifier is requested.", "Usia, jenis kelamin, dan aktivitas diperlukan untuk TDEE. Total persentase harus 100%. Tidak meminta nama atau identitas pasien.")}</p></fieldset>
      </div>
      {error && <p role="alert" className="error-text">{error}</p>}
      <div className="planner-actions"><button type="submit" className="btn-primary"><Icon name="lab" size={17} />{tx("Calculate", "Hitung")}</button><button type="button" className="btn-secondary" onClick={startNew}><Icon name="plus" size={17} />{tx("New calculation", "Perhitungan baru")}</button>{teaching && <button type="button" className="btn-text" onClick={() => { setForm({ weight: "60", height: "165", age: "30", gender: "female", activity: "light", protein: "25", fat: "20" }); setResult(null); setError(""); setReveal(false); }}>{tx("Load teaching example", "Muat contoh belajar")}</button>}</div>
    </form>
    {stale && <p role="status" className="notice" style={{ marginTop: 18 }}>{tx("Inputs changed. Select Calculate to update the result.", "Input berubah. Pilih Hitung untuk memperbarui hasil.")}</p>}
    {result && !stale && <div className="patient-results" aria-live="polite"><div className="panel-heading"><div><p className="eyebrow">03 / {tx("CALCULATED RESULT", "HASIL PERHITUNGAN")}</p><h2>{tx("Anonymous adult estimate", "Estimasi dewasa anonim")}</h2></div><button type="button" className="btn-secondary" onClick={exportCase}><Icon name="download" size={16} />{tx("Export result", "Ekspor hasil")}</button></div>
      <div className="patient-stats"><div><span>TDEE</span><strong>{result.energy.tdee.toLocaleString()} <small>kcal/{tx("day", "hari")}</small></strong></div><div><span>REE</span><strong>{result.energy.bmr.toLocaleString()} <small>kcal/{tx("day", "hari")}</small></strong></div><div><span>BMI</span><strong>{result.bmi.value} <small>kg/m²</small></strong></div></div>
      <div className="macro-results">{keys.map((key) => <div key={key}><p>{labels[key]} · {result.percentages[key]}%</p><strong>{result.macros[key].grams.toFixed(1)} <small>g/{tx("day", "hari")}</small></strong><span className="muted">{result.macros[key].energy.toFixed(1)} kcal</span></div>)}</div>
      {teaching && <div className="teaching-panel"><p>{tx("Explain: why is fat divided by 9, while carbohydrate and protein are divided by 4? What changes if the activity assumption changes?", "Jelaskan: mengapa lemak dibagi 9, sedangkan karbohidrat dan protein dibagi 4? Apa yang berubah jika asumsi aktivitas berubah?")}</p><button type="button" className="btn-text" aria-expanded={reveal} onClick={() => setReveal(!reveal)}>{tx(reveal ? "Hide worked steps" : "Reveal worked steps", reveal ? "Tutup langkah" : "Tampilkan langkah")}</button></div>}
      {(!teaching || reveal) && <div className="worked-answer"><p>REE = 10 × {result.form.weight} + 6.25 × {result.form.height} − 5 × {result.form.age} {result.form.gender === "male" ? "+ 5" : "− 161"} = {(10 * Number(result.form.weight) + 6.25 * Number(result.form.height) - 5 * Number(result.form.age) + (result.form.gender === "male" ? 5 : -161)).toFixed(2)} kcal</p><p>TDEE = REE × {result.energy.activityFactor} ≈ {result.energy.tdee} kcal/{tx("day", "hari")}</p><p>{labels.carbohydrate} = 100 − {result.form.protein} − {result.form.fat} = {result.percentages.carbohydrate}%</p>{keys.map((key) => <p key={key}>{labels[key]}: ({result.energy.tdee} × {result.percentages[key]} ÷ 100) ÷ {key === "fat" ? 9 : 4} = {result.macros[key].grams.toFixed(1)} g</p>)}</div>}
    </div>}
    <p className="small-text muted" style={{ marginTop: 19 }}>{tx("Case inputs stay on this page and are not saved to your profile or diary. New calculation clears them; exports remain on your device. Planning estimates for adults, not diagnoses or prescriptions. Pregnancy, lactation, and disease-specific adjustments are not included.", "Input kasus hanya di halaman ini dan tidak disimpan ke profil atau catatan Anda. Perhitungan baru mengosongkannya; ekspor tetap di perangkat Anda. Estimasi dewasa, bukan diagnosis atau resep. Penyesuaian kehamilan, menyusui, dan penyakit tidak termasuk.")} <Link to="/references">{tx("Sources & methods", "Sumber & metode")}</Link></p>
  </section>;
}
