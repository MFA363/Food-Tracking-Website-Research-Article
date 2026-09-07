# CalNut patient calculator verification

## Scope

The dashboard contains two independent areas: saved personal macronutrient targets and a transient patient/teaching calculator. The latter has no Firebase/auth imports and does not persist measurements, results, or identifiers. Its export is an explicit local text download.

## Checks performed

- Root and nested TypeScript checks and production builds pass.
- All six automated tests pass, including macronutrient remainders, invalid totals, decimal percentages, reference-intake boundaries, and food-data screening.
- Browser check on `/tools`, which mounts the same PatientCalculator component used by Dashboard: inputs 60 kg, 165 cm, age 30, female, light activity, protein 25%, fat 20% produce carbohydrate 55%. With the root activity factor 1.375: TDEE 1815 kcal, carbohydrate 249.6 g, protein 113.4 g, fat 40.3 g.
- Protein 90% plus fat 20% is rejected; previous results disappear when inputs change.
- New calculation clears all measurements, percentages and results.
- Desktop and 390px mobile screenshots inspected; calculator content fits the viewport. No page errors reported by the browser.

## Remaining limitations

- Signed-in dashboard, live Firebase persistence, admin permissions, and production deployment were not end-to-end browser tested in this pass.
- Both builds warn about a JavaScript bundle exceeding 500 kB.
- The nested project's existing activity-factor edits were preserved. Its factors differ from the root project, so the same inputs can produce different TDEE estimates. The calculator displays the actual factor used.
- The public NutriTools site was reviewed for feature context only. CalNut is not claimed to match its disease-specific or pediatric tools, or to be clinically superior.
- Food-data screening is not source verification, and estimates require professional review. No disease, pregnancy, or lactation adjustments were added.
