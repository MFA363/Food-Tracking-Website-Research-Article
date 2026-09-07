import type { Gender, Nutrients } from "./types";

// Permenkes 28/2019, Annex I tables 1 and 3, adult non-pregnant/non-lactating rows.
// https://jdih.kemkes.go.id/storage/documents/pdfs/2019permenkes028.pdf
// Reviewed 2026-09-08. Copper converted from micrograms to milligrams.
const adultRows = {
  male: [[2650,65,75,430,37,1500], [2550,65,70,415,36,1500], [2150,65,60,340,30,1300], [1800,64,50,275,25,1100], [1600,64,45,235,22,1000]],
  female: [[2250,60,65,360,32,1500], [2150,60,60,340,30,1500], [1800,60,50,280,25,1400], [1550,58,45,230,22,1200], [1400,58,40,200,20,1000]],
};

export function adultReferenceIntakes(gender: Gender, age: number): Nutrients {
  if (!Number.isFinite(age) || age < 19 || age > 120) {
    // Zero means no supported comparison target, not zero nutritional need.
    return { energy:0, protein:0, fat:0, carbohydrate:0, fiber:0, calcium:0, phosphorus:0, iron:0, sodium:0, potassium:0, copper:0, zinc:0 };
  }
  // The source prints 65–80 and 80+; this application assigns age 80 to 80+.
  const band = age < 30 ? 0 : age < 50 ? 1 : age < 65 ? 2 : age < 80 ? 3 : 4;
  const [energy,protein,fat,carbohydrate,fiber,sodium] = adultRows[gender][band];
  return { energy,protein,fat,carbohydrate,fiber,sodium, calcium: age < 50 ? 1000 : 1200, phosphorus:700, iron: gender === "male" ? 9 : age < 50 ? 18 : 8, potassium:4700, copper:0.9, zinc:gender === "male" ? 11 : 8 };
}
