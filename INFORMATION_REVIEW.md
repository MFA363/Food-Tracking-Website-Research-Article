# CalNut information review — 8 September 2026

## Verified references

- AKG: Permenkes 28/2019, Annex I tables 1 and 3. Official status is still in force: https://peraturan.bpk.go.id/Details/138621/Permenkes-No-28-%20Tahun-2019 . Tables: https://jdih.kemkes.go.id/storage/documents/pdfs/2019permenkes028.pdf . Adult values now vary by age and sex; copper is converted from micrograms to mg. Age 80 uses the 80+ row, resolving the source's overlapping labels explicitly.
- Mifflin–St Jeor predicts resting energy expenditure: https://pubmed.ncbi.nlm.nih.gov/2305711/ . Activity multipliers are app assumptions. Targets are suppressed outside the original study's age range, 19–78 years, and for invalid measurements.
- WHO healthy-diet guidance: https://www.who.int/news-room/fact-sheets/detail/healthy-diet . The previous macro hints are identified as project examples, not a WHO or universal recommendation.
- Asian BMI interpretation: https://pubmed.ncbi.nlm.nih.gov/14726171/ . The app's pre-existing Asia-Pacific adult bands are explicitly distinguished from universal WHO classifications and Asian risk action points.
- Ministry TKPI 2020 publication record: https://repository.kemkes.go.id/book/668 . This establishes the publication's existence, not the accuracy of the supplied JSON or that no newer dataset exists.

## Data issues requiring source reconciliation

The supplied JSON contains 1,900 records, including repeated food codes. At least 312 records have water, protein, or ash above 100 g per 100 g. This indicates probable extraction/transcription errors; no replacement nutrient values have been guessed.

598 records pass checks for all 12 tracked nutrients being present, finite and nonnegative, gram values at most 100, energy at most 900 kcal/100 g, and proximate mass at most 105 g (rounding tolerance). Identical duplicate codes are collapsed; conflicting duplicates among these candidates are excluded. These checks do not validate accepted values against the printed tables. Vitamin values are not used in calculations. The raw JSON and past diary entries are preserved.

New food selection uses screened imports and administrator-added foods, not the unverified legacy built-in lists. Custom foods are not independently certified. Missing imported nutrients are excluded from new calculations rather than displayed as measured zero. Historical diary values and administrator-added foods still require review.

## Limits

No claim is made that every food value is accurate, that all information is the newest publication available, or that this is a clinically validated system. Source links and scope are available at /references. Child, pregnancy, lactation, and disease-specific targets are not implemented. Unsupported age-group comparisons are omitted. Automatic shortfall/deficiency messages were removed because incomplete diary records do not establish nutritional deficiency. Some interface content remains untranslated.

Both TypeScript projects, both production builds, and the macro/reference/data-quality tests passed. Production builds retain a bundle-size warning. Live authentication, Firestore persistence, deployment status, and a complete browser interaction audit were not verified during this review.
