import type { Food, Language } from "./types";

// Nutritional data sourced from TKPI (Tabel Komposisi Pangan Indonesia) 2017
// All values are per 100 grams edible portion
export const FOOD_DATABASE: Food[] = [
  // ── CEREALS & GRAINS ──────────────────────────────────────────────
  {
    id: "rice_white_cooked",
    name: { en: "White Rice (cooked)", id: "Nasi Putih", ms: "Nasi Putih", jv: "Sego Putih", ar: "أرز أبيض مطبوخ" },
    category: "grains",
    nutrients: { energy: 175, protein: 2.1, fat: 0.1, carbohydrate: 40.6, fiber: 0.2, calcium: 5, phosphorus: 22, iron: 0.5, sodium: 5, potassium: 28, copper: 0.01, zinc: 0.5 },
    defaultUnit: "porsi", defaultWeight: 150,
  },
  {
    id: "rice_brown_cooked",
    name: { en: "Brown Rice (cooked)", id: "Nasi Merah", ms: "Nasi Perang", jv: "Sego Abang", ar: "أرز بني مطبوخ" },
    category: "grains",
    nutrients: { energy: 165, protein: 3.5, fat: 1.3, carbohydrate: 34.5, fiber: 1.8, calcium: 10, phosphorus: 83, iron: 0.5, sodium: 5, potassium: 86, copper: 0.09, zinc: 0.6 },
    defaultUnit: "porsi", defaultWeight: 150,
  },
  {
    id: "bread_white",
    name: { en: "White Bread", id: "Roti Tawar", ms: "Roti Putih", jv: "Roti Tawar", ar: "خبز أبيض" },
    category: "grains",
    nutrients: { energy: 248, protein: 7.9, fat: 2.0, carbohydrate: 50.6, fiber: 1.9, calcium: 73, phosphorus: 87, iron: 1.7, sodium: 489, potassium: 91, copper: 0.11, zinc: 0.7 },
    defaultUnit: "lembar", defaultWeight: 30,
  },
  {
    id: "noodle_dry",
    name: { en: "Dried Egg Noodles", id: "Mie Telur Kering", ms: "Mi Telur Kering", jv: "Mi Telor Garing", ar: "نودلز بيض جافة" },
    category: "grains",
    nutrients: { energy: 337, protein: 10.4, fat: 4.2, carbohydrate: 63.0, fiber: 1.8, calcium: 28, phosphorus: 130, iron: 3.0, sodium: 440, potassium: 158, copper: 0.15, zinc: 1.0 },
    defaultUnit: "porsi", defaultWeight: 80,
  },
  {
    id: "corn_boiled",
    name: { en: "Boiled Corn", id: "Jagung Rebus", ms: "Jagung Rebus", jv: "Jagung Godhog", ar: "ذرة مسلوقة" },
    category: "grains",
    nutrients: { energy: 129, protein: 4.1, fat: 1.5, carbohydrate: 30.5, fiber: 2.8, calcium: 3, phosphorus: 89, iron: 0.5, sodium: 15, potassium: 270, copper: 0.05, zinc: 0.7 },
    defaultUnit: "buah", defaultWeight: 150,
  },
  {
    id: "oat",
    name: { en: "Oatmeal", id: "Oatmeal", ms: "Oatmeal", jv: "Oatmeal", ar: "شوفان" },
    category: "grains",
    nutrients: { energy: 389, protein: 16.9, fat: 6.9, carbohydrate: 66.3, fiber: 10.6, calcium: 54, phosphorus: 523, iron: 4.7, sodium: 2, potassium: 429, copper: 0.63, zinc: 4.0 },
    defaultUnit: "porsi", defaultWeight: 40,
  },

  // ── LEGUMES & BEANS ────────────────────────────────────────────────
  {
    id: "tempeh",
    name: { en: "Tempeh", id: "Tempe", ms: "Tempe", jv: "Tempe", ar: "تيمبيه" },
    category: "legumes",
    nutrients: { energy: 201, protein: 20.8, fat: 8.8, carbohydrate: 13.5, fiber: 1.4, calcium: 155, phosphorus: 326, iron: 4.0, sodium: 9, potassium: 234, copper: 0.47, zinc: 1.7 },
    defaultUnit: "potong", defaultWeight: 50,
  },
  {
    id: "tofu_white",
    name: { en: "White Tofu", id: "Tahu Putih", ms: "Tauhu Putih", jv: "Tahu Putih", ar: "توفو أبيض" },
    category: "legumes",
    nutrients: { energy: 68, protein: 7.8, fat: 4.6, carbohydrate: 1.6, fiber: 0.1, calcium: 124, phosphorus: 63, iron: 0.8, sodium: 2, potassium: 50, copper: 0.09, zinc: 0.4 },
    defaultUnit: "potong", defaultWeight: 80,
  },
  {
    id: "tofu_fried",
    name: { en: "Fried Tofu", id: "Tahu Goreng", ms: "Tauhu Goreng", jv: "Tahu Goreng", ar: "توفو مقلي" },
    category: "legumes",
    nutrients: { energy: 271, protein: 17.0, fat: 20.0, carbohydrate: 3.5, fiber: 0.2, calcium: 155, phosphorus: 85, iron: 1.5, sodium: 10, potassium: 65, copper: 0.12, zinc: 0.7 },
    defaultUnit: "potong", defaultWeight: 60,
  },
  {
    id: "mung_bean",
    name: { en: "Mung Beans (cooked)", id: "Kacang Hijau (masak)", ms: "Kacang Hijau (masak)", jv: "Kacang Ijo (mateng)", ar: "فاصوليا خضراء مطبوخة" },
    category: "legumes",
    nutrients: { energy: 105, protein: 7.0, fat: 0.4, carbohydrate: 19.0, fiber: 5.5, calcium: 27, phosphorus: 99, iron: 1.8, sodium: 4, potassium: 266, copper: 0.16, zinc: 1.0 },
    defaultUnit: "mangkok", defaultWeight: 150,
  },
  {
    id: "peanut",
    name: { en: "Peanuts (roasted)", id: "Kacang Tanah Goreng", ms: "Kacang Tanah Goreng", jv: "Kacang Goreng", ar: "فول سوداني محمص" },
    category: "legumes",
    nutrients: { energy: 589, protein: 24.4, fat: 49.2, carbohydrate: 21.0, fiber: 8.0, calcium: 92, phosphorus: 376, iron: 2.2, sodium: 2, potassium: 705, copper: 0.74, zinc: 3.3 },
    defaultUnit: "genggam", defaultWeight: 30,
  },

  // ── MEAT & POULTRY ────────────────────────────────────────────────
  {
    id: "chicken_fried",
    name: { en: "Fried Chicken", id: "Ayam Goreng", ms: "Ayam Goreng", jv: "Pitik Goreng", ar: "دجاج مقلي" },
    category: "meat",
    nutrients: { energy: 290, protein: 25.0, fat: 18.0, carbohydrate: 4.0, fiber: 0, calcium: 14, phosphorus: 174, iron: 1.5, sodium: 310, potassium: 243, copper: 0.07, zinc: 1.8 },
    defaultUnit: "potong", defaultWeight: 120,
  },
  {
    id: "chicken_boiled",
    name: { en: "Boiled Chicken", id: "Ayam Rebus", ms: "Ayam Rebus", jv: "Pitik Godhog", ar: "دجاج مسلوق" },
    category: "meat",
    nutrients: { energy: 215, protein: 25.9, fat: 12.0, carbohydrate: 0, fiber: 0, calcium: 11, phosphorus: 200, iron: 1.2, sodium: 80, potassium: 220, copper: 0.07, zinc: 1.5 },
    defaultUnit: "potong", defaultWeight: 100,
  },
  {
    id: "beef",
    name: { en: "Beef", id: "Daging Sapi", ms: "Daging Lembu", jv: "Daging Sapi", ar: "لحم بقري" },
    category: "meat",
    nutrients: { energy: 201, protein: 18.8, fat: 13.5, carbohydrate: 0, fiber: 0, calcium: 11, phosphorus: 170, iron: 2.8, sodium: 65, potassium: 270, copper: 0.09, zinc: 4.8 },
    defaultUnit: "porsi", defaultWeight: 100,
  },
  {
    id: "rendang",
    name: { en: "Rendang (Beef)", id: "Rendang Sapi", ms: "Rendang Daging", jv: "Rendang Sapi", ar: "ريندانج" },
    category: "meat",
    nutrients: { energy: 295, protein: 22.0, fat: 20.0, carbohydrate: 6.0, fiber: 0.5, calcium: 18, phosphorus: 180, iron: 3.5, sodium: 350, potassium: 310, copper: 0.12, zinc: 4.0 },
    defaultUnit: "porsi", defaultWeight: 80,
  },

  // ── FISH & SEAFOOD ────────────────────────────────────────────────
  {
    id: "milkfish_grilled",
    name: { en: "Grilled Milkfish (Bandeng)", id: "Ikan Bandeng Bakar", ms: "Ikan Bandeng Bakar", jv: "Iwak Bandeng Bakar", ar: "سمك الحليب المشوي" },
    category: "fish",
    nutrients: { energy: 189, protein: 24.0, fat: 10.0, carbohydrate: 0, fiber: 0, calcium: 20, phosphorus: 144, iron: 0.5, sodium: 75, potassium: 390, copper: 0.06, zinc: 0.8 },
    defaultUnit: "ekor", defaultWeight: 150,
  },
  {
    id: "tuna",
    name: { en: "Tuna (Tongkol)", id: "Ikan Tongkol", ms: "Ikan Tongkol", jv: "Iwak Tongkol", ar: "سمك التونة" },
    category: "fish",
    nutrients: { energy: 132, protein: 28.0, fat: 1.5, carbohydrate: 0, fiber: 0, calcium: 7, phosphorus: 233, iron: 1.5, sodium: 45, potassium: 404, copper: 0.07, zinc: 0.6 },
    defaultUnit: "porsi", defaultWeight: 100,
  },
  {
    id: "shrimp",
    name: { en: "Shrimp", id: "Udang", ms: "Udang", jv: "Udang", ar: "جمبري" },
    category: "fish",
    nutrients: { energy: 84, protein: 18.0, fat: 0.9, carbohydrate: 0.9, fiber: 0, calcium: 147, phosphorus: 226, iron: 1.9, sodium: 189, potassium: 259, copper: 0.26, zinc: 1.3 },
    defaultUnit: "porsi", defaultWeight: 80,
  },
  {
    id: "egg_fried",
    name: { en: "Fried Egg", id: "Telur Goreng", ms: "Telur Goreng", jv: "Endhog Goreng", ar: "بيض مقلي" },
    category: "eggs",
    nutrients: { energy: 199, protein: 13.6, fat: 15.9, carbohydrate: 0.9, fiber: 0, calcium: 54, phosphorus: 211, iron: 2.0, sodium: 207, potassium: 138, copper: 0.10, zinc: 1.3 },
    defaultUnit: "butir", defaultWeight: 60,
  },
  {
    id: "egg_boiled",
    name: { en: "Boiled Egg", id: "Telur Rebus", ms: "Telur Rebus", jv: "Endhog Godhog", ar: "بيض مسلوق" },
    category: "eggs",
    nutrients: { energy: 155, protein: 12.6, fat: 10.6, carbohydrate: 1.1, fiber: 0, calcium: 50, phosphorus: 172, iron: 1.2, sodium: 124, potassium: 126, copper: 0.09, zinc: 1.1 },
    defaultUnit: "butir", defaultWeight: 60,
  },

  // ── VEGETABLES ────────────────────────────────────────────────────
  {
    id: "spinach",
    name: { en: "Spinach (Bayam)", id: "Bayam", ms: "Bayam", jv: "Bayem", ar: "سبانخ" },
    category: "vegetables",
    nutrients: { energy: 36, protein: 3.5, fat: 0.5, carbohydrate: 6.5, fiber: 0.8, calcium: 267, phosphorus: 67, iron: 3.9, sodium: 65, potassium: 466, copper: 0.13, zinc: 0.76 },
    defaultUnit: "mangkok", defaultWeight: 80,
  },
  {
    id: "kangkung",
    name: { en: "Water Spinach (Kangkung)", id: "Kangkung", ms: "Kangkung", jv: "Kangkung", ar: "كانكونج" },
    category: "vegetables",
    nutrients: { energy: 29, protein: 3.0, fat: 0.3, carbohydrate: 5.4, fiber: 0.7, calcium: 73, phosphorus: 50, iron: 2.5, sodium: 33, potassium: 312, copper: 0.10, zinc: 0.3 },
    defaultUnit: "mangkok", defaultWeight: 80,
  },
  {
    id: "carrot",
    name: { en: "Carrot", id: "Wortel", ms: "Lobak Merah", jv: "Wortel", ar: "جزر" },
    category: "vegetables",
    nutrients: { energy: 41, protein: 0.9, fat: 0.2, carbohydrate: 9.6, fiber: 2.8, calcium: 33, phosphorus: 35, iron: 0.3, sodium: 69, potassium: 320, copper: 0.05, zinc: 0.2 },
    defaultUnit: "buah", defaultWeight: 80,
  },
  {
    id: "tomato",
    name: { en: "Tomato", id: "Tomat", ms: "Tomato", jv: "Tomat", ar: "طماطم" },
    category: "vegetables",
    nutrients: { energy: 20, protein: 0.9, fat: 0.2, carbohydrate: 3.9, fiber: 1.2, calcium: 10, phosphorus: 24, iron: 0.5, sodium: 5, potassium: 237, copper: 0.06, zinc: 0.2 },
    defaultUnit: "buah", defaultWeight: 80,
  },
  {
    id: "potato",
    name: { en: "Potato (boiled)", id: "Kentang Rebus", ms: "Kentang Rebus", jv: "Kentang Godhog", ar: "بطاطس مسلوقة" },
    category: "vegetables",
    nutrients: { energy: 77, protein: 2.0, fat: 0.1, carbohydrate: 17.5, fiber: 2.2, calcium: 5, phosphorus: 44, iron: 0.3, sodium: 6, potassium: 379, copper: 0.11, zinc: 0.3 },
    defaultUnit: "buah", defaultWeight: 150,
  },
  {
    id: "cassava",
    name: { en: "Cassava (boiled)", id: "Singkong Rebus", ms: "Ubi Kayu Rebus", jv: "Telo Kaspe Godhog", ar: "كسافا مسلوقة" },
    category: "vegetables",
    nutrients: { energy: 112, protein: 1.0, fat: 0.3, carbohydrate: 27.0, fiber: 1.0, calcium: 33, phosphorus: 40, iron: 0.7, sodium: 14, potassium: 271, copper: 0.10, zinc: 0.3 },
    defaultUnit: "potong", defaultWeight: 100,
  },
  {
    id: "sweet_potato",
    name: { en: "Sweet Potato", id: "Ubi Jalar", ms: "Keledek", jv: "Telo Rambat", ar: "بطاطا حلوة" },
    category: "vegetables",
    nutrients: { energy: 86, protein: 1.6, fat: 0.1, carbohydrate: 20.1, fiber: 3.0, calcium: 30, phosphorus: 47, iron: 0.6, sodium: 55, potassium: 337, copper: 0.15, zinc: 0.3 },
    defaultUnit: "buah", defaultWeight: 130,
  },
  {
    id: "cucumber",
    name: { en: "Cucumber", id: "Timun", ms: "Timun", jv: "Timun", ar: "خيار" },
    category: "vegetables",
    nutrients: { energy: 16, protein: 0.7, fat: 0.1, carbohydrate: 3.6, fiber: 0.5, calcium: 16, phosphorus: 24, iron: 0.3, sodium: 2, potassium: 147, copper: 0.04, zinc: 0.2 },
    defaultUnit: "buah", defaultWeight: 120,
  },

  // ── FRUITS ────────────────────────────────────────────────────────
  {
    id: "banana",
    name: { en: "Banana", id: "Pisang", ms: "Pisang", jv: "Gedhang", ar: "موز" },
    category: "fruits",
    nutrients: { energy: 89, protein: 1.1, fat: 0.3, carbohydrate: 22.8, fiber: 2.6, calcium: 5, phosphorus: 22, iron: 0.3, sodium: 1, potassium: 358, copper: 0.08, zinc: 0.2 },
    defaultUnit: "buah", defaultWeight: 100,
  },
  {
    id: "papaya",
    name: { en: "Papaya", id: "Pepaya", ms: "Betik", jv: "Kates", ar: "بابايا" },
    category: "fruits",
    nutrients: { energy: 43, protein: 0.5, fat: 0.3, carbohydrate: 10.8, fiber: 1.7, calcium: 23, phosphorus: 5, iron: 0.4, sodium: 8, potassium: 182, copper: 0.04, zinc: 0.1 },
    defaultUnit: "potong", defaultWeight: 150,
  },
  {
    id: "mango",
    name: { en: "Mango", id: "Mangga", ms: "Mangga", jv: "Pelem", ar: "مانجو" },
    category: "fruits",
    nutrients: { energy: 65, protein: 0.5, fat: 0.3, carbohydrate: 17.0, fiber: 1.8, calcium: 10, phosphorus: 14, iron: 0.2, sodium: 2, potassium: 156, copper: 0.11, zinc: 0.1 },
    defaultUnit: "buah", defaultWeight: 200,
  },
  {
    id: "orange",
    name: { en: "Orange", id: "Jeruk", ms: "Oren", jv: "Jeruk", ar: "برتقال" },
    category: "fruits",
    nutrients: { energy: 47, protein: 0.9, fat: 0.1, carbohydrate: 11.8, fiber: 2.4, calcium: 40, phosphorus: 14, iron: 0.1, sodium: 0, potassium: 181, copper: 0.06, zinc: 0.1 },
    defaultUnit: "buah", defaultWeight: 130,
  },
  {
    id: "watermelon",
    name: { en: "Watermelon", id: "Semangka", ms: "Tembikai", jv: "Semangka", ar: "بطيخ" },
    category: "fruits",
    nutrients: { energy: 30, protein: 0.6, fat: 0.2, carbohydrate: 7.6, fiber: 0.4, calcium: 7, phosphorus: 11, iron: 0.2, sodium: 1, potassium: 112, copper: 0.04, zinc: 0.1 },
    defaultUnit: "potong", defaultWeight: 200,
  },
  {
    id: "avocado",
    name: { en: "Avocado", id: "Alpukat", ms: "Avokado", jv: "Alpukat", ar: "أفوكادو" },
    category: "fruits",
    nutrients: { energy: 160, protein: 2.0, fat: 14.7, carbohydrate: 8.5, fiber: 6.7, calcium: 12, phosphorus: 52, iron: 0.6, sodium: 7, potassium: 485, copper: 0.19, zinc: 0.6 },
    defaultUnit: "buah", defaultWeight: 150,
  },

  // ── MILK & DAIRY ──────────────────────────────────────────────────
  {
    id: "milk_fresh",
    name: { en: "Fresh Cow's Milk", id: "Susu Sapi Segar", ms: "Susu Lembu Segar", jv: "Susu Sapi Seger", ar: "حليب بقر طازج" },
    category: "dairy",
    nutrients: { energy: 61, protein: 3.2, fat: 3.3, carbohydrate: 4.7, fiber: 0, calcium: 120, phosphorus: 93, iron: 0.1, sodium: 40, potassium: 150, copper: 0.02, zinc: 0.4 },
    defaultUnit: "gelas", defaultWeight: 200,
  },
  {
    id: "milk_uht",
    name: { en: "UHT Milk", id: "Susu UHT", ms: "Susu UHT", jv: "Susu UHT", ar: "حليب UHT" },
    category: "dairy",
    nutrients: { energy: 60, protein: 3.1, fat: 3.2, carbohydrate: 4.8, fiber: 0, calcium: 115, phosphorus: 91, iron: 0.1, sodium: 45, potassium: 140, copper: 0.02, zinc: 0.4 },
    defaultUnit: "gelas", defaultWeight: 200,
  },
  {
    id: "yogurt",
    name: { en: "Yogurt (plain)", id: "Yogurt Tawar", ms: "Yogurt Tawar", jv: "Yogurt", ar: "زبادي سادة" },
    category: "dairy",
    nutrients: { energy: 59, protein: 3.5, fat: 3.3, carbohydrate: 4.7, fiber: 0, calcium: 110, phosphorus: 88, iron: 0.1, sodium: 36, potassium: 141, copper: 0.01, zinc: 0.5 },
    defaultUnit: "gelas", defaultWeight: 200,
  },

  // ── BEVERAGES ─────────────────────────────────────────────────────
  {
    id: "water",
    name: { en: "Water", id: "Air Putih", ms: "Air Kosong", jv: "Banyu Putih", ar: "ماء" },
    category: "beverages",
    nutrients: { energy: 0, protein: 0, fat: 0, carbohydrate: 0, fiber: 0, calcium: 10, phosphorus: 0, iron: 0, sodium: 2, potassium: 0, copper: 0, zinc: 0 },
    defaultUnit: "gelas", defaultWeight: 250,
  },
  {
    id: "tea_sweet",
    name: { en: "Sweet Tea", id: "Teh Manis", ms: "Teh Manis", jv: "Teh Manis", ar: "شاي محلى" },
    category: "beverages",
    nutrients: { energy: 30, protein: 0.1, fat: 0, carbohydrate: 7.5, fiber: 0, calcium: 2, phosphorus: 1, iron: 0.1, sodium: 5, potassium: 21, copper: 0.01, zinc: 0 },
    defaultUnit: "gelas", defaultWeight: 250,
  },
  {
    id: "coffee_black",
    name: { en: "Black Coffee", id: "Kopi Hitam", ms: "Kopi Hitam", jv: "Kopi Ireng", ar: "قهوة سوداء" },
    category: "beverages",
    nutrients: { energy: 2, protein: 0.3, fat: 0, carbohydrate: 0, fiber: 0, calcium: 2, phosphorus: 7, iron: 0.1, sodium: 2, potassium: 116, copper: 0.01, zinc: 0.1 },
    defaultUnit: "gelas", defaultWeight: 200,
  },
  {
    id: "orange_juice",
    name: { en: "Orange Juice", id: "Jus Jeruk", ms: "Jus Oren", jv: "Jus Jeruk", ar: "عصير برتقال" },
    category: "beverages",
    nutrients: { energy: 45, protein: 0.7, fat: 0.2, carbohydrate: 10.4, fiber: 0.2, calcium: 11, phosphorus: 17, iron: 0.2, sodium: 1, potassium: 200, copper: 0.04, zinc: 0.1 },
    defaultUnit: "gelas", defaultWeight: 250,
  },

  // ── COOKED DISHES ─────────────────────────────────────────────────
  {
    id: "fried_rice",
    name: { en: "Fried Rice (Nasi Goreng)", id: "Nasi Goreng", ms: "Nasi Goreng", jv: "Sego Goreng", ar: "أرز مقلي" },
    category: "dishes",
    nutrients: { energy: 215, protein: 5.0, fat: 7.5, carbohydrate: 33.0, fiber: 0.5, calcium: 20, phosphorus: 75, iron: 1.2, sodium: 620, potassium: 160, copper: 0.05, zinc: 0.8 },
    defaultUnit: "piring", defaultWeight: 250,
  },
  {
    id: "fried_noodles",
    name: { en: "Fried Noodles (Mie Goreng)", id: "Mie Goreng", ms: "Mee Goreng", jv: "Mi Goreng", ar: "نودلز مقلية" },
    category: "dishes",
    nutrients: { energy: 201, protein: 5.5, fat: 8.0, carbohydrate: 28.0, fiber: 1.0, calcium: 22, phosphorus: 80, iron: 1.5, sodium: 540, potassium: 140, copper: 0.07, zinc: 0.7 },
    defaultUnit: "piring", defaultWeight: 250,
  },
  {
    id: "bakso",
    name: { en: "Bakso (Meatball Soup)", id: "Bakso", ms: "Bakso", jv: "Bakso", ar: "باكسو" },
    category: "dishes",
    nutrients: { energy: 115, protein: 7.0, fat: 5.0, carbohydrate: 10.0, fiber: 0.5, calcium: 30, phosphorus: 80, iron: 0.8, sodium: 580, potassium: 160, copper: 0.05, zinc: 0.9 },
    defaultUnit: "mangkok", defaultWeight: 300,
  },
  {
    id: "soto_ayam",
    name: { en: "Soto Ayam (Chicken Soup)", id: "Soto Ayam", ms: "Soto Ayam", jv: "Soto Pitik", ar: "سوتو أيام" },
    category: "dishes",
    nutrients: { energy: 95, protein: 8.0, fat: 4.5, carbohydrate: 6.0, fiber: 0.5, calcium: 18, phosphorus: 75, iron: 0.8, sodium: 480, potassium: 200, copper: 0.05, zinc: 0.7 },
    defaultUnit: "mangkok", defaultWeight: 300,
  },
  {
    id: "gado_gado",
    name: { en: "Gado-Gado (Peanut Salad)", id: "Gado-Gado", ms: "Gado-Gado", jv: "Gado-Gado", ar: "غادو-غادو" },
    category: "dishes",
    nutrients: { energy: 171, protein: 9.0, fat: 10.0, carbohydrate: 13.0, fiber: 2.5, calcium: 95, phosphorus: 110, iron: 1.5, sodium: 280, potassium: 250, copper: 0.20, zinc: 1.0 },
    defaultUnit: "piring", defaultWeight: 200,
  },
  {
    id: "sate_ayam",
    name: { en: "Chicken Satay (Sate Ayam)", id: "Sate Ayam", ms: "Satay Ayam", jv: "Sate Pitik", ar: "ساتيه دجاج" },
    category: "dishes",
    nutrients: { energy: 195, protein: 18.0, fat: 11.0, carbohydrate: 5.0, fiber: 0.5, calcium: 22, phosphorus: 175, iron: 1.4, sodium: 350, potassium: 230, copper: 0.08, zinc: 1.8 },
    defaultUnit: "tusuk", defaultWeight: 25,
  },
  {
    id: "opor_ayam",
    name: { en: "Opor Ayam (Coconut Chicken)", id: "Opor Ayam", ms: "Opor Ayam", jv: "Opor Pitik", ar: "أوبور أيام" },
    category: "dishes",
    nutrients: { energy: 230, protein: 17.0, fat: 16.0, carbohydrate: 4.0, fiber: 0.5, calcium: 25, phosphorus: 160, iron: 1.3, sodium: 320, potassium: 250, copper: 0.08, zinc: 1.5 },
    defaultUnit: "porsi", defaultWeight: 150,
  },

  // ── SNACKS ────────────────────────────────────────────────────────
  {
    id: "kerupuk",
    name: { en: "Kerupuk (Crackers)", id: "Kerupuk", ms: "Keropok", jv: "Krupuk", ar: "كروبوك" },
    category: "snacks",
    nutrients: { energy: 455, protein: 6.0, fat: 20.0, carbohydrate: 63.0, fiber: 0.3, calcium: 18, phosphorus: 55, iron: 0.5, sodium: 850, potassium: 70, copper: 0.03, zinc: 0.3 },
    defaultUnit: "keping", defaultWeight: 10,
  },
  {
    id: "fried_banana",
    name: { en: "Fried Banana (Pisang Goreng)", id: "Pisang Goreng", ms: "Pisang Goreng", jv: "Gedang Goreng", ar: "موز مقلي" },
    category: "snacks",
    nutrients: { energy: 195, protein: 1.5, fat: 8.0, carbohydrate: 30.0, fiber: 2.0, calcium: 10, phosphorus: 28, iron: 0.5, sodium: 50, potassium: 290, copper: 0.09, zinc: 0.2 },
    defaultUnit: "buah", defaultWeight: 80,
  },
  {
    id: "martabak_manis",
    name: { en: "Sweet Martabak", id: "Martabak Manis", ms: "Martabak Manis", jv: "Martabak Manis", ar: "مارتاباك حلو" },
    category: "snacks",
    nutrients: { energy: 312, protein: 6.5, fat: 14.0, carbohydrate: 42.0, fiber: 0.8, calcium: 65, phosphorus: 95, iron: 1.2, sodium: 280, potassium: 120, copper: 0.08, zinc: 0.6 },
    defaultUnit: "potong", defaultWeight: 100,
  },
];

export const FOOD_CATEGORIES = [
  { id: "all", en: "All Foods", id_lang: "Semua Makanan" },
  { id: "grains", en: "Grains & Cereals", id_lang: "Serealia & Umbi" },
  { id: "legumes", en: "Legumes & Tofu", id_lang: "Kacang & Tahu" },
  { id: "meat", en: "Meat & Poultry", id_lang: "Daging & Unggas" },
  { id: "fish", en: "Fish & Seafood", id_lang: "Ikan & Seafood" },
  { id: "eggs", en: "Eggs", id_lang: "Telur" },
  { id: "vegetables", en: "Vegetables", id_lang: "Sayuran" },
  { id: "fruits", en: "Fruits", id_lang: "Buah-buahan" },
  { id: "dairy", en: "Milk & Dairy", id_lang: "Susu & Olahan" },
  { id: "beverages", en: "Beverages", id_lang: "Minuman" },
  { id: "dishes", en: "Cooked Dishes", id_lang: "Masakan" },
  { id: "snacks", en: "Snacks", id_lang: "Camilan" },
];

export const FOOD_UNITS: Record<string, { label: string; grams: number }[]> = {
  default: [
    { label: "gram (g)", grams: 1 },
    { label: "porsi (100g)", grams: 100 },
    { label: "sendok makan", grams: 15 },
    { label: "sendok teh", grams: 5 },
  ],
  gelas: [
    { label: "gelas penuh", grams: 250 },
    { label: "½ gelas", grams: 125 },
    { label: "¼ gelas", grams: 62 },
  ],
  piring: [
    { label: "piring penuh", grams: 300 },
    { label: "½ piring", grams: 150 },
    { label: "piring kecil", grams: 200 },
  ],
  mangkok: [
    { label: "mangkok penuh", grams: 250 },
    { label: "½ mangkok", grams: 125 },
  ],
  potong: [
    { label: "potong besar", grams: 100 },
    { label: "potong sedang", grams: 60 },
    { label: "potong kecil", grams: 40 },
  ],
  buah: [
    { label: "buah besar", grams: 200 },
    { label: "buah sedang", grams: 130 },
    { label: "buah kecil", grams: 80 },
  ],
  porsi: [
    { label: "1 porsi", grams: 100 },
    { label: "½ porsi", grams: 50 },
    { label: "2 porsi", grams: 200 },
  ],
};

export function searchFoods(query: string, lang: Language, category = "all"): Food[] {
  const q = query.toLowerCase().trim();
  return FOOD_DATABASE.filter((f) => {
    const matchCategory = category === "all" || f.category === category;
    const matchName = !q || f.name[lang]?.toLowerCase().includes(q) || f.name.en.toLowerCase().includes(q) || f.name.id.toLowerCase().includes(q);
    return matchCategory && matchName;
  });
}

export function getFoodById(id: string): Food | undefined {
  return FOOD_DATABASE.find((f) => f.id === id);
}
