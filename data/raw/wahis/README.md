# WOAH WAHIS Raw Data Documentation

## Source Description
- **Organization**: World Organisation for Animal Health (WOAH, formerly OIE - Office International des Epizooties).
- **System**: World Animal Health Information System (WAHIS).
- **Official Portal**: [https://wahis.woah.org](https://wahis.woah.org)
- **Official Situation Reports**: [https://www.woah.org/en/disease/](https://www.woah.org/en/disease/)

## Purpose in JeevRakshak AI
Provides macro-level epidemiological context regarding global and regional transboundary animal diseases (TADs), including:
- Official outbreak counts
- Host species affected
- Case morbidity and mortality statistics
- International standard control measures (stamping out, ring vaccination, quarantine, zoning)

## Access Mechanisms & Technical Limitations
1. **Public Web Interface**: `wahis.woah.org` is a client-side Angular single-page application secured with Cloudflare bot detection and session tokenization.
2. **Automated Scraping Restriction**: Bulk automated scraping is prohibited by WOAH terms of service.
3. **Data Acquisition Strategy**: JeevRakshak acquires data through official WOAH published notification summaries, global situation bulletins, and formal government disclosures to WOAH (via DAHD).
4. **License / Usage**: Official WOAH surveillance data is released for public veterinary information and disease prevention under standard attribution guidelines (Credit: World Organisation for Animal Health).

## Field Dictionary
- `Disease`: Standard disease nomenclature (e.g. Lumpy Skin Disease, Foot and Mouth Disease, Anthrax).
- `Species`: Specific livestock species affected.
- `Country`: Sovereign state reporting the event.
- `Region`: Geographic sub-region.
- `Reporting_Year`: Calendar year of official reporting.
- `Outbreaks_Reported`: Count of distinct outbreak clusters reported to WOAH.
- `Total_Cases`: Number of confirmed clinical cases.
- `Total_Deaths`: Animal deaths attributable to the disease event.
- `Control_Measures_Applied`: Official state-level interventions executed.
- `Data_Source`: Specific official communication channel.
