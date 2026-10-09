# Regional food catalogue — 9 October 2026

31 additional foods and drinks are bundled in Android/iOS source assets and the web catalogue. No Firebase upload is needed for these reference foods. Diary entries still use the existing authenticated Firebase workflow. Previously built APKs retain their bundled data until rebuilt and installed.

The 9 October update adds ten Malaysian MyFCD records reporting **all 12 nutrients tracked by CalNut**: red and white dragon fruit, baby corn, coconut bun, kaya bun, red-bean bun, green/red/yellow capsicum and honeydew. Roti jala from the earlier release also has all 12 values. This does not mean a complete vitamin/mineral panel or clinical validation. Values are copied from the source table at its displayed precision, without combining other records or replacing missing data with zero.

Source: Ministry of Health Malaysia, [MyFCD](https://myfcd.moh.gov.my/). Each record includes its source URL, code, edition and retrieval date. MyFCD 1997 records are labelled as such; they are not claimed to be new laboratory measurements. Current-edition records are identified separately. Values are per **100 g edible portion**, including drinks: enter weighed grams, not an assumed millilitre conversion.

Added foods include nasi lemak, nasi ayam, roti canai, kuah dhal, ayam kurma, beef rendang, chicken satay, sambal ikan bilis, tau fu fah, soy drinks, coconut water, guava, papaya, pisang mas, sirap bandung, ice lemon tea, fresh orange juice, putu bambu and roti jala. Similar names can represent different preparation or packaging; choose the matching record.

The Pekalongan filter includes the existing TKPI Soto Pekalongan entry (searchable as tauto) and everyday foods/drinks shared across the region. It is not a complete inventory of local cuisine. Malaysian compositions are reference values, not measurements of Pekalongan recipes. Specific dishes such as nasi megono and garang asem were not assigned invented nutrient values.

Unreported fibre/minerals are stored as null, not zero. Portion scaling preserves missing values; affected daily totals are marked incomplete and cannot be used as evidence of a shortfall. Previously imported TKPI screening remains unchanged. A reported zero remains zero.

## Demonstration

1. Open Food catalogue; select Malaysia and search `nasi lemak`.
2. Open the food and enter 200 g: energy should be 338 kcal.
3. Expand Food reference to inspect the source; copper/zinc show Not reported.
4. Select Pekalongan and search `tauto` or `air kelapa`.
5. When signed in, add a food from the Diary. Check its date, weight and nutrient summary. Missing minerals should show incomplete data, not zero or a deficiency claim.

Search and reference calculations work from bundled app assets offline. Saving/syncing to Firebase and Gemini chat require their existing setup and connectivity. This update does not change security rules, billing or AI configuration.

The import script `scripts/import-regional-foods.mjs` is a manual maintenance tool. It fetches only selected official reference pages, validates required macronutrients, excludes unavailable rows and writes matching web/mobile JSON. `--complete-only` checks only the ten additions and requires all 12 reported values. Unavailable source pages preserve existing records rather than deleting them. Review changes before rerunning it for a release.
