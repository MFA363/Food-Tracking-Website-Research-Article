import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { dailyNutritionTips, mealPriorities, remainingIntake, supportedGuidanceProfile, type GuidanceKey, type NutrientTip } from '@/lib/nutritionGuidance';
import type { FoodLogEntry, MealType, Nutrients, UserProfile } from '@/lib/types';

const foods: Record<GuidanceKey, [string, string]> = {
  fiber: ['Include vegetables, fruit, beans or whole grains.', 'Sertakan sayur, buah, kacang-kacangan atau serealia utuh.'],
  calcium: ['Consider milk, yogurt, calcium-fortified alternatives or fish with edible bones.', 'Pertimbangkan susu, yoghurt, alternatif fortifikasi kalsium atau ikan bertulang lunak yang dimakan.'],
  phosphorus: ['Beans, tempeh, eggs, fish and dairy can contribute phosphorus.', 'Kacang, tempe, telur, ikan dan produk susu dapat menyumbang fosfor.'],
  iron: ['Consider beans, tempeh, lean meat or fish; pair plant sources with vitamin-C-rich fruit or vegetables.', 'Pertimbangkan kacang, tempe, daging tanpa lemak atau ikan; padukan sumber nabati dengan buah atau sayur kaya vitamin C.'],
  potassium: ['Vegetables, beans, potatoes and fruit can contribute potassium.', 'Sayur, kacang, kentang dan buah dapat menyumbang kalium.'],
  copper: ['Consider nuts, seeds, legumes or whole grains.', 'Pertimbangkan kacang-kacangan, biji-bijian atau serealia utuh.'],
  zinc: ['Consider meat, fish, eggs, legumes, nuts or seeds.', 'Pertimbangkan daging, ikan, telur, kacang-kacangan atau biji-bijian.'],
  sodium: ['Use less salty sauces and seasonings. Never add salt to fill a reference gap.', 'Kurangi saus dan bumbu asin. Jangan menambah garam untuk mencapai nilai acuan.'],
};
const names: Record<string, [string, string]> = {
  fiber: ['Fiber', 'Serat'], calcium: ['Calcium', 'Kalsium'], phosphorus: ['Phosphorus', 'Fosfor'], iron: ['Iron', 'Zat besi'], potassium: ['Potassium', 'Kalium'], copper: ['Copper', 'Tembaga'], zinc: ['Zinc', 'Seng'], sodium: ['Sodium', 'Natrium'], energy: ['Energy', 'Energi'], carbohydrate: ['Carbohydrate', 'Karbohidrat'], protein: ['Protein', 'Protein'], fat: ['Fat', 'Lemak'],
};
const mealIdeas: Record<MealType, [string, string]> = {
  breakfast: ['For breakfast, consider a staple or whole grain, a protein food, and fruit or vegetables.', 'Untuk sarapan, pertimbangkan makanan pokok atau serealia utuh, sumber protein, serta buah atau sayur.'],
  lunch: ['For lunch, combine a staple, a protein food such as tempeh or fish, and vegetables.', 'Untuk makan siang, padukan makanan pokok, sumber protein seperti tempe atau ikan, dan sayur.'],
  dinner: ['For dinner, vary your staple, protein food and vegetables from earlier meals.', 'Untuk makan malam, variasikan makanan pokok, sumber protein dan sayur dari makanan sebelumnya.'],
  snack: ['If a snack suits your hunger and plan, consider fruit, plain yogurt or unsalted nuts.', 'Jika camilan sesuai rasa lapar dan rencana Anda, pertimbangkan buah, yoghurt tawar atau kacang tanpa garam.'],
};

export default function DailyNutritionGuidance({ profile, entries, date, loading, error, targets, customTargets, onPlanMeal }: {
  profile: UserProfile; entries: FoodLogEntry[]; date: string; loading: boolean; error: boolean;
  targets: Partial<Nutrients>; customTargets: boolean; onPlanMeal: (meal: MealType) => void;
}) {
  const { lang, t } = useLanguage();
  const ix = lang === 'id' ? 1 : 0;
  const tx = (en: string, id: string) => ix ? id : en;
  const [meal, setMeal] = useState<MealType>('lunch');
  const supported = supportedGuidanceProfile(profile.age, profile.gender);
  const tips = dailyNutritionTips(entries, profile.age, profile.gender);
  const priorities = mealPriorities(tips);
  const remaining = remainingIntake(entries, targets);
  const fmt = (value: number, key: string) => value.toLocaleString(ix ? 'id-ID' : 'en-GB', { maximumFractionDigits: key === 'copper' ? 2 : 1 });
  const unit = (key: string) => key === 'energy' ? 'kcal' : ['fiber', 'carbohydrate', 'protein', 'fat'].includes(key) ? 'g' : 'mg';
  function advice(tip: NutrientTip) {
    if (tip.status === 'incomplete') return tx('Some entries have missing or invalid values. Complete the nutrient data before comparing intake.', 'Sebagian catatan memiliki nilai hilang atau tidak valid. Lengkapi data sebelum membandingkan asupan.');
    if (tip.status === 'referenceReached') return tx('The diary has reached this reference. Continue varied meals; this is not a safety upper limit.', 'Catatan telah mencapai acuan ini. Tetap konsumsi makanan beragam; ini bukan batas aman maksimum.');
    if (tip.nutrient === 'sodium') return `${tip.recorded >= 2000 ? tx('Recorded sodium is at or above 2,000 mg. ', 'Natrium tercatat mencapai atau melebihi 2.000 mg. ') : ''}${foods.sodium[ix]} ${tx('WHO recommends less than 2,000 mg/day for adults.', 'WHO menganjurkan kurang dari 2.000 mg/hari untuk dewasa.')}`;
    return foods[tip.nutrient][ix];
  }
  return <section className="panel nutrition-guidance" aria-label={tx('Personalized nutrition guidance', 'Panduan gizi pribadi')}>
    <p className="eyebrow">{tx('PERSONALIZED DAILY TIPS', 'TIPS HARIAN PRIBADI')}</p>
    <h2>{tx('Plan your next meal', 'Rencanakan makanan berikutnya')}</h2>
    <p className="muted">{date} · {tx('Updates with your food diary and current profile.', 'Diperbarui mengikuti catatan pangan dan profil saat ini.')}</p>
    {loading ? <p role="status">{tx('Loading diary…', 'Memuat catatan…')}</p> : error ? <p role="alert">{tx('Guidance is unavailable until diary data loads successfully.', 'Panduan belum tersedia hingga catatan berhasil dimuat.')}</p> : !supported ? <p>{tx('Complete your profile with age 19–120 and reference sex to use adult guidance.', 'Lengkapi profil dengan usia 19–120 dan jenis kelamin acuan untuk panduan dewasa.')} <Link to="/profile">{tx('Open profile', 'Buka profil')}</Link></p> : !entries.length ? <p>{tx('Log a food for this date to receive personalized tips. An empty diary does not indicate a deficiency.', 'Catat pangan pada tanggal ini untuk mendapat tips pribadi. Catatan kosong tidak menunjukkan defisiensi.')}</p> : <>
      <p className="small-text muted">{tx('Based on adult AKG 2019 references. A recorded gap is not a diagnosed deficiency. General guidance excludes pregnancy, breastfeeding and condition-specific diets.', 'Berdasarkan AKG 2019 dewasa. Selisih catatan bukan diagnosis defisiensi. Panduan umum tidak mencakup kehamilan, menyusui dan diet kondisi khusus.')}</p>
      <div className="meal-guidance-box">
        <label htmlFor="guidance-meal">{tx('Meal to plan', 'Makanan yang direncanakan')}</label>
        <select id="guidance-meal" value={meal} onChange={e => setMeal(e.target.value as MealType)}>{(Object.keys(mealIdeas) as MealType[]).map(key => <option key={key} value={key}>{t(key)}</option>)}</select>
        <p>{mealIdeas[meal][ix]}</p>
        {priorities.length ? <ul>{priorities.map(tip => <li key={tip.nutrient}><strong>{names[tip.nutrient][ix]}: </strong>{foods[tip.nutrient][ix]}</li>)}</ul> : <p>{tips.some(tip => tip.status === 'incomplete') ? tx('Complete missing nutrient values before using personalized food priorities.', 'Lengkapi nilai gizi yang hilang sebelum menggunakan prioritas pangan pribadi.') : tx('Tracked references are reached. Keep variety in your meals.', 'Acuan yang dipantau telah tercapai. Pertahankan variasi makanan.')}</p>}
        <p className="small-text">{tx('Remaining for the whole day, not a portion prescription for this meal.', 'Sisa untuk satu hari penuh, bukan resep porsi untuk makanan ini.')}</p>
        <div className="guidance-budget">{remaining.map(item => <div key={item.nutrient}><span>{names[item.nutrient][ix]}</span><strong>{item.remaining === null ? tx('Incomplete data', 'Data tidak lengkap') : `${fmt(item.remaining, item.nutrient)} ${unit(item.nutrient)}`}</strong></div>)}</div>
        <p className="small-text muted">{customTargets ? tx('Macros use saved percentages × TDEE (4/4/9 kcal per gram).', 'Makro menggunakan persentase tersimpan × TDEE (4/4/9 kkal per gram).') : tx('Macros use adult AKG references; save your allocation in Profile to personalize them.', 'Makro menggunakan acuan AKG dewasa; simpan alokasi di Profil untuk mempersonalisasikannya.')} {targets.energy ? tx('Energy uses your current estimated TDEE.', 'Energi menggunakan estimasi TDEE saat ini.') : tx('Complete adult measurements to show estimated energy remaining.', 'Lengkapi pengukuran dewasa untuk melihat estimasi sisa energi.')}</p>
        <p className="small-text">{tx('Choose foods suitable for your allergies and care plan. Do not skip meals to compensate for a reached target.', 'Pilih pangan sesuai alergi dan rencana perawatan. Jangan melewatkan waktu makan untuk mengompensasi target yang tercapai.')}</p>
        <button className="btn-secondary" onClick={() => onPlanMeal(meal)}>{tx('Choose food & review portion', 'Pilih pangan & tinjau porsi')}</button>
      </div>
      <div className="guidance-tips">{tips.map(tip => <article className="guidance-tip" key={tip.nutrient}>
        <h3>{names[tip.nutrient][ix]}</h3>
        <p>{fmt(tip.recorded, tip.nutrient)} / {fmt(tip.reference, tip.nutrient)} {unit(tip.nutrient)} {tx('recorded / AKG reference', 'tercatat / acuan AKG')}{tip.status === 'incomplete' && ` · ${tx('partial total', 'jumlah parsial')}`}</p>
        {tip.status === 'belowReference' && <p>{tx('Recorded gap', 'Selisih tercatat')}: {fmt(tip.gap, tip.nutrient)} {unit(tip.nutrient)}</p>}
        <p>{advice(tip)}</p>
        <details><summary>{tx('Why this suggestion?', 'Mengapa saran ini?')}</summary>
          <p>{tx('Reference profile', 'Profil acuan')}: {profile.age} · {profile.gender === 'male' ? tx('male', 'laki-laki') : tx('female', 'perempuan')}. {tx('Current profile applied to the selected diary date.', 'Profil saat ini diterapkan pada tanggal catatan terpilih.')}</p>
          <p>{tip.status === 'incomplete' ? tx('Comparison is withheld because at least one value is missing or invalid.', 'Perbandingan ditunda karena setidaknya satu nilai hilang atau tidak valid.') : tip.nutrient === 'sodium' ? tx('Sodium uses a separate WHO comparison of less than 2,000 mg/day; the AKG value is not an instruction to add salt.', 'Natrium menggunakan perbandingan WHO terpisah kurang dari 2.000 mg/hari; nilai AKG bukan instruksi menambah garam.') : `${tx('Gap', 'Selisih')} = max(0, ${fmt(tip.reference, tip.nutrient)} − ${fmt(tip.recorded, tip.nutrient)}) = ${fmt(tip.gap, tip.nutrient)} ${unit(tip.nutrient)}.`}</p>
          <p>{tx('Meal prompts highlight up to three of the lowest recorded-to-reference ratios. This ordering is not clinical urgency.', 'Prompt makanan menyoroti hingga tiga rasio asupan tercatat terhadap acuan terendah. Urutan ini bukan tingkat urgensi klinis.')}</p>
          <ul>{entries.map(entry => { const value = entry.nutrients?.[tip.nutrient]; return <li key={entry.id}>{entry.foodName}: {typeof value === 'number' && Number.isFinite(value) && value >= 0 ? `${fmt(value, tip.nutrient)} ${unit(tip.nutrient)}` : tx('unknown / invalid', 'tidak diketahui / tidak valid')}</li>; })}</ul>
          <Link to="/references">{tx('Sources & methods', 'Sumber & metode')}</Link>
        </details>
      </article>)}</div>
      <p className="small-text muted">{tx('Incomplete logs and uncertain food values affect guidance. Catalogue zeros can mean unreported values; vitamins are not assessed. Food examples do not guarantee that a particular portion closes a gap.', 'Catatan tidak lengkap dan nilai pangan tidak pasti memengaruhi panduan. Nilai nol dapat berarti tidak dilaporkan; vitamin tidak dinilai. Contoh pangan tidak menjamin porsi tertentu menutup selisih.')}</p>
      <p className="small-text"><a href="https://peraturan.bpk.go.id/Details/138621/permenkes-no-28-tahun-2019">AKG 2019</a> · <a href="https://www.who.int/health-topics/healthy-diet">WHO</a></p>
    </>}
  </section>;
}
