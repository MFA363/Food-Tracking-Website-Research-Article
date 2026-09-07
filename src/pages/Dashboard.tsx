import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateBMI, calculateEnergyRequirement, sumNutrients, getRDI } from "@/lib/calculations";
import { calculateMacroTargets } from "@/lib/macronutrients";
import { getUserLogs, deleteFoodLog } from "@/lib/firebase";
import { localDate, downloadText } from "@/lib/workspace";
import MacronutrientCalculator from "@/components/MacronutrientCalculator";
import PatientCalculator from "@/components/PatientCalculator";
import NutrientProgress from "@/components/NutrientProgress";
import FoodSearchModal from "@/components/FoodSearchModal";
import Icon from "@/components/Icon";
import type { FoodLogEntry, MealType } from "@/lib/types";

const meals: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function Dashboard() {
  const { user } = useAuth(); const { t, lang } = useLanguage();
  const tx = (en: string, id: string) => lang === "id" ? id : en;
  const [date, setDate] = useState(localDate);
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [defaultMeal, setDefaultMeal] = useState<MealType>("breakfast");
  useEffect(() => {
    if (!user?.uid) return;
    let active = true; setLoading(true); setError(""); setLogs([]);
    getUserLogs(user.uid, date).then((items) => { if (active) setLogs(items); }).catch(() => { if (active) setError("Intake records could not be loaded. Please retry."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.uid, date, retry]);
  if (!user) return null;
  const profileValid = [user.height, user.weight, user.age].every(Number.isFinite) && user.height >= 50 && user.weight >= 20 && user.age >= 19 && user.age <= 78;
  const energy = profileValid ? calculateEnergyRequirement(user.weight, user.height, user.age, user.gender, user.activityLevel) : null;
  const bmi = profileValid ? calculateBMI(user.weight, user.height) : null;
  const tdee = energy?.tdee || 0;
  const totals = sumNutrients(logs);
  const rdi = getRDI(user.gender, user.age);
  let customTargets = false;
  if (user.macroPercentages && tdee > 0) {
    try { const target = calculateMacroTargets(tdee, user.macroPercentages); rdi.carbohydrate = target.carbohydrate.grams; rdi.protein = target.protein.grams; rdi.fat = target.fat.grams; customTargets = true; } catch { /* Reference values remain visible for invalid saved data. */ }
  }
  const unavailable = loading || !!error;
  async function remove(id: string) {
    setDeleting(id);
    try { await deleteFoodLog(id); setLogs((previous) => previous.filter((entry) => entry.id !== id)); setConfirmDelete(null); }
    catch { setError(tx("The entry could not be deleted. Please retry.", "Catatan tidak dapat dihapus. Coba lagi.")); }
    finally { setDeleting(null); }
  }
  function addFood(meal: MealType = "breakfast") { setDefaultMeal(meal); setModalOpen(true); }
  function exportIntake() {
    downloadText(`CalNut-intake-${date}.txt`, ["CalNut — intake summary", `Date: ${date}`, "Recorded intake only; incomplete records do not establish deficiency.", ...logs.map((entry) => `${entry.mealType} | ${entry.foodName} | ${entry.weightGrams} g | ${entry.nutrients.energy} kcal | carbohydrate ${entry.nutrients.carbohydrate} g | protein ${entry.nutrients.protein} g | fat ${entry.nutrients.fat} g`), "", `Recorded energy: ${totals.energy.toFixed(1)} kcal`, `Current profile TDEE estimate: ${tdee > 0 ? tdee : "unavailable"} kcal/day`, "Food values require source verification. Methods: /references"].join("\n"));
  }
  return <div className="page-stack">
    <div className="page-heading"><div><p className="eyebrow">{tx("YOUR NUTRITION WORKSPACE", "RUANG KERJA GIZI ANDA")}</p><h1>{tx("Welcome back", "Selamat datang")}, {user.name.split(" ")[0]}.</h1><p className="muted">{tx("A clear view of your intake. A considered plan for what comes next.", "Pantau asupan dan susun rencana gizi dalam satu ruang kerja.")}</p></div><button className="btn-primary" onClick={() => addFood()}><Icon name="plus" size={17} />{tx("Record food", "Catat pangan")}</button></div>
    {!profileValid && <div className="notice"><span>{tx("Complete valid adult measurements to calculate your TDEE and macronutrient grams.", "Lengkapi pengukuran dewasa untuk menghitung TDEE dan gram makronutrien.")}</span><Link to="/profile">{tx("Complete profile", "Lengkapi profil")}</Link></div>}
    {error && <div className="notice error-notice" role="alert"><span>{error}</span><button className="btn-secondary" onClick={() => setRetry((value) => value + 1)}>{tx("Retry", "Coba lagi")}</button></div>}
    <div className="stat-grid">
      <div className="stat-card highlight"><div className="stat-top"><span>TDEE</span><span className="stat-icon"><Icon name="activity" size={17} /></span></div><strong>{tdee > 0 ? tdee.toLocaleString() : "—"}</strong><span className="stat-foot">kcal/{tx("day · current profile estimate", "hari · estimasi profil saat ini")}</span></div>
      <div className="stat-card"><div className="stat-top"><span>{tx("Recorded energy", "Energi tercatat")}</span><span className="stat-icon"><Icon name="food" size={17} /></span></div><strong>{unavailable ? "—" : Math.round(totals.energy).toLocaleString()}</strong><span className="stat-foot">{date} · kcal</span></div>
      <div className="stat-card"><div className="stat-top"><span>{tx("Food entries", "Catatan pangan")}</span><span className="stat-icon"><Icon name="diary" size={17} /></span></div><strong>{unavailable ? "—" : logs.length}</strong><span className="stat-foot">{tx("For the selected date", "Untuk tanggal terpilih")}</span></div>
      <div className="stat-card"><div className="stat-top"><span>BMI</span><span className="stat-icon"><Icon name="chart" size={17} /></span></div><strong>{bmi?.value || "—"}</strong><span className="stat-foot">{bmi ? `${user.weight} kg · ${user.height} cm` : tx("Add measurements in your profile", "Isi pengukuran pada profil")}</span></div>
    </div>
    <div className="dashboard-columns"><div className="dashboard-main">
      <MacronutrientCalculator key={user.uid} tdee={tdee} />
      <section className="panel"><div className="panel-heading meals-panel-heading"><div><p className="eyebrow">{tx("DAILY RECORD", "CATATAN HARIAN")}</p><h2>{tx("Food diary", "Catatan pangan")}</h2></div><div className="date-control"><label className="sr-only" htmlFor="dashboard-date">{tx("Diary date", "Tanggal catatan")}</label><input id="dashboard-date" type="date" max={localDate()} value={date} onChange={(event) => { if (event.target.value && event.target.value <= localDate()) { setDate(event.target.value); setConfirmDelete(null); } }} /></div></div>
        {loading ? <p role="status" className="muted">{tx("Loading intake…", "Memuat asupan…")}</p> : error ? <p className="muted">{tx("Records are unavailable until the request succeeds.", "Catatan belum tersedia sampai permintaan berhasil.")}</p> : logs.length === 0 ? <div className="empty-state"><Icon name="diary" size={31} /><h3>{tx("Your diary starts with one entry", "Mulai dengan satu catatan")}</h3><p className="muted">{tx("Record a food and its edible weight to see the breakdown here.", "Catat pangan dan berat bagian yang dimakan untuk melihat rinciannya.")}</p><button className="btn-primary" onClick={() => addFood()}><Icon name="plus" size={16} />{tx("Add first food", "Tambah pangan pertama")}</button></div> : meals.map((meal) => { const entries = logs.filter((entry) => entry.mealType === meal); if (!entries.length) return null; return <div key={meal}><div className="meal-heading"><strong>{t(meal)}</strong><button className="btn-text" onClick={() => addFood(meal)}>+ {tx("Add food", "Tambah pangan")}</button></div>{entries.map((entry) => <div className="meal-entry" key={entry.id}><div><strong>{entry.foodName}</strong><small>{entry.weightGrams} g · P {entry.nutrients.protein.toFixed(1)} g · F {entry.nutrients.fat.toFixed(1)} g · C {entry.nutrients.carbohydrate.toFixed(1)} g</small>{confirmDelete === entry.id && <div className="planner-actions"><span className="small-text">{tx("Delete this entry?", "Hapus catatan ini?")}</span><button className="btn-text" disabled={deleting !== null} onClick={() => remove(entry.id)}>{tx("Delete", "Hapus")}</button><button className="btn-text" onClick={() => setConfirmDelete(null)}>{tx("Cancel", "Batal")}</button></div>}</div><span>{Math.round(entry.nutrients.energy)} kcal</span><button aria-label={`${tx("Delete", "Hapus")} ${entry.foodName}`} className="delete-entry" disabled={deleting !== null} onClick={() => setConfirmDelete(entry.id)}><Icon name="close" size={16} /></button></div>)}</div>; })}
        <div className="planner-actions"><Link to="/diary" className="btn-text">{tx("Open full diary", "Buka catatan lengkap")} →</Link><button className="btn-text" disabled={unavailable || !logs.length} onClick={exportIntake}>{tx("Export day summary", "Ekspor ringkasan harian")}</button></div>
      </section>
    </div><aside className="dashboard-aside">
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">{tx("INTAKE VS REFERENCE", "ASUPAN VS ACUAN")}</p><h2>{tx("Your daily balance", "Keseimbangan harian")}</h2></div><Icon name="chart" size={18} /></div><p className="muted small-text" style={{ marginBottom: 22 }}>{customTargets ? tx("Macros use your saved targets. Fiber uses adult AKG.", "Makro memakai target tersimpan. Serat memakai AKG dewasa.") : tx("Adult AKG reference values. Save an allocation to personalize macro targets.", "Nilai acuan AKG dewasa. Simpan alokasi untuk target makro pribadi.")}</p>{unavailable ? <p className="muted">{tx("Waiting for intake data", "Menunggu data asupan")}</p> : <div className="intake-bars"><NutrientProgress label={tx("Carbohydrate", "Karbohidrat")} value={totals.carbohydrate} rdi={rdi.carbohydrate} unit="g" color="#14857e" /><NutrientProgress label="Protein" value={totals.protein} rdi={rdi.protein} unit="g" color="#5165c6" /><NutrientProgress label={tx("Fat", "Lemak")} value={totals.fat} rdi={rdi.fat} unit="g" color="#c78c31" /><NutrientProgress label={tx("Fiber", "Serat")} value={totals.fiber} rdi={rdi.fiber} unit="g" color="#899AAA" /></div>}<Link className="btn-text" to="/nutrition" style={{ display: "inline-flex", marginTop: 18 }}>{tx("Explore nutrition analysis", "Lihat analisis gizi")} →</Link></section>
      <section className="panel case-promo"><p className="eyebrow">{tx("FROM CALCULATION TO UNDERSTANDING", "DARI PERHITUNGAN KE PEMAHAMAN")}</p><h2>{tx("Explore a case. Explain the result.", "Eksplorasi kasus. Jelaskan hasilnya.")}</h2><p className="muted">{tx("A separate space for adult scenarios, worked examples, and teaching discussions.", "Ruang terpisah untuk skenario dewasa, contoh hitung, dan diskusi belajar.")}</p><Link className="btn-secondary" to="/case-workspace"><Icon name="lab" size={17} />{tx("Open case workspace", "Buka ruang kasus")}</Link></section>
      <section className="panel"><h2>{tx("Tools & references", "Alat & referensi")}</h2><Link className="quick-link" to="/profile"><span><Icon name="settings" size={18} /></span><div><strong>{tx("Profile & assumptions", "Profil & asumsi")}</strong><small>{tx("Measurements and activity level", "Pengukuran dan tingkat aktivitas")}</small></div><Icon name="arrow" size={16} /></Link><Link className="quick-link" to="/references"><span><Icon name="book" size={18} /></span><div><strong>{tx("Sources & methods", "Sumber & metode")}</strong><small>{tx("Understand estimates and data limits", "Pahami estimasi dan batasan data")}</small></div><Icon name="arrow" size={16} /></Link></section>
    </aside></div>
    <PatientCalculator />
    {modalOpen && <FoodSearchModal open onClose={() => setModalOpen(false)} onAdd={(entry) => setLogs((previous) => [...previous, entry])} defaultMeal={defaultMeal} date={date} />}
  </div>;
}
