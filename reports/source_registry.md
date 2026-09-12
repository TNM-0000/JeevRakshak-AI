# JeevRakshak AI — Authoritative Source Registry

**Document Code**: `SRC-REG-2026-V1`  
**Phase**: Phase 1: Real Data Acquisition & Pretrained Model Validation  
**Purpose**: Official provenance registry for JeevRakshak AI. Every external data source, clinical monograph, pretrained neural network weight file, and environmental API is indexed with official URLs, access timestamps, legal terms, local storage paths, and scientific citation standards.

---

## 1. Institutional Registry

### Source 1: ICAR-NIVEDI NADRES Forewarning Bulletin
- **Source Name**: Vet-Alert: Livestock Disease Risk Forewarning Bulletin (Vol 14, Issue 09)
- **Organization**: ICAR - National Institute of Veterinary Epidemiology and Disease Informatics (NIVEDI)
- **Official URL**: [https://nivedi.res.in/Nadres_v2/bulletin.php](https://nivedi.res.in/Nadres_v2/bulletin.php)
- **Access Date**: 12 September 2026
- **Purpose**: Provides monthly forewarning risk classifications for 15 economically significant livestock diseases across all 28 States and 8 Union Territories of India.
- **License / Usage Notes**: Official ICAR-NIVEDI publication; non-commercial research use with mandatory institutional attribution.
- **Local Copy Paths**:
  - Raw: `data/raw/nadres/NADRES_Forewarning_Bulletin_Sep2026_PredNov2026.pdf`
  - Processed: `data/processed/nadres/nadres_state_forewarning_nov2026.csv`
  - Processed: `data/processed/nadres/nadres_state_forewarning_nov2026.json`
- **Citation Information**:
  > Suresh K. P., Patil S. S., Jagadish Hiremath, S. S. Jacob, Narayanan G., and Baldev R. Gulati. (2026). *Vet-Alert Livestock Disease Risk Forewarning Bulletin - November 2026*, ICAR-NIVEDI, Bengaluru, Vol. 14 (09): 1–73. PME No: F.No.11/NIVEDI/PMEC/RPS/2021-22/2526-66.

---

### Source 2: ICAR-NIVEDI Forewarning Methodology Monograph
- **Source Name**: Vet-Alert: Livestock Disease Risk Forewarning Methodology (Vol 14, Issue 09)
- **Organization**: ICAR - National Institute of Veterinary Epidemiology and Disease Informatics (NIVEDI)
- **Official URL**: [https://nivedi.res.in/Nadres_v2/bulletin.php](https://nivedi.res.in/Nadres_v2/bulletin.php)
- **Access Date**: 12 September 2026
- **Purpose**: Reference standard for epidemiological risk modeling, remote sensing covariates (NDVI, soil moisture), and climatic risk threshold parameters in India.
- **License / Usage Notes**: Official ICAR-NIVEDI publication.
- **Local Copy Path**: `data/raw/nadres/NADRES_Forewarning_Methodology_Sep2026.pdf`
- **Citation Information**:
  > Suresh K. P., Patil S. S., Jagadish Hiremath, S. S. Jacob, Narayanan G., and Baldev R. Gulati. (2026). *Vet-Alert Livestock Disease Risk Forewarning Methodology - November 2026*, ICAR-NIVEDI, Bengaluru, Vol. 14 (09): 1–93.

---

### Source 3: Open Government Data (OGD) Platform India — Disease Incidence
- **Source Name**: Incidence of Livestock Diseases In India
- **Organization**: Ministry of Statistics and Programme Implementation (MOSPI) & Department of Animal Husbandry and Dairying (DAHD), Government of India
- **Official URL**: [https://data.gov.in/catalog/incidence-livestock-diseases-india](https://data.gov.in/catalog/incidence-livestock-diseases-india) (Catalog ID / NID: 88575, UUID: `56b2362c-2b48-4cfe-a063-82ed30f96f79`)
- **Access Date**: 12 September 2026
- **Purpose**: Establishes 7-year longitudinal baseline statistics for national disease outbreaks, attacks, and deaths across 8 priority livestock diseases.
- **License / Usage Notes**: Government Open Data License - India (GODL) / National Data Sharing and Accessibility Policy (NDSAP).
- **Local Copy Paths**:
  - Raw: `data/raw/india_government/incidence_of_livestock_diseases_in_india.csv`
  - Processed: `data/processed/india_government/india_disease_incidence_processed.csv`
  - Processed: `data/processed/india_government/disease_longitudinal_summary.json`
- **Citation Information**:
  > Government of India, Ministry of Statistics and Programme Implementation (MOSPI). (2017). *Incidence of Livestock Diseases In India (2005–2011)*. Open Government Data Platform India. https://data.gov.in/catalog/incidence-livestock-diseases-india.

---

### Source 4: Department of Animal Husbandry and Dairying Annual Report 2025–2026
- **Source Name**: Annual Report 2025–2026 (Chapter 6: Livestock Health)
- **Organization**: Department of Animal Husbandry and Dairying (DAHD), Ministry of Fisheries, Animal Husbandry & Dairying, Government of India
- **Official URL**: [https://dahd.gov.in/annual-report](https://dahd.gov.in/annual-report)
- **Access Date**: 12 September 2026
- **Purpose**: Official documentation of the National Animal Disease Control Programme (NADCP), Livestock Health and Disease Control Programme (LH&DCP), FMD eradication progress, Brucellosis calfhood vaccination, and Mobile Veterinary Units (MVUs).
- **License / Usage Notes**: Official Government Publication; public domain under Government of India publishing rules.
- **Local Copy Path**: `data/raw/india_government/DAHD_Annual_Report_2025_26.pdf`
- **Citation Information**:
  > Department of Animal Husbandry and Dairying (DAHD). (2026). *Annual Report 2025–2026*. Ministry of Fisheries, Animal Husbandry & Dairying, Government of India, New Delhi.

---

### Source 5: World Organisation for Animal Health (WOAH WAHIS)
- **Source Name**: World Animal Health Information System (WAHIS) Global Disease Reference Data
- **Organization**: World Organisation for Animal Health (WOAH, formerly OIE), Paris, France
- **Official URL**: [https://wahis.woah.org](https://wahis.woah.org) & [https://www.woah.org/en/disease/](https://www.woah.org/en/disease/)
- **Access Date**: 12 September 2026
- **Purpose**: Global context for transboundary animal diseases (TADs), cross-border epizootics (FMD, LSD, Anthrax, PPR), and international disease control standards.
- **License / Usage Notes**: Public veterinary information with attribution to WOAH. Note: Direct automated scraping of the web application is restricted by Cloudflare bot protection and WOAH terms of service; data is compiled via official notification reports.
- **Local Copy Paths**:
  - Raw: `data/raw/wahis/wahis_global_livestock_disease_reference.csv`
  - Processed: `data/processed/wahis/wahis_global_reference_processed.csv`
  - Processed: `data/processed/wahis/wahis_global_reference_processed.json`
- **Citation Information**:
  > World Organisation for Animal Health (WOAH). (2023–2026). *World Animal Health Information System (WAHIS) Disease Notification Reports*. WOAH, Paris. https://wahis.woah.org.

---

### Source 6: Pretrained Vision Model — xprotocol/EfficientNet-B3-Cattle-Disease
- **Source Name**: EfficientNet-B3 Cattle Disease Classifier (`efficientnet_b3_best.keras`)
- **Organization / Author**: Hugging Face / xprotocol
- **Official URL**: [https://huggingface.co/xprotocol/EfficientNet-B3-Cattle-Disease](https://huggingface.co/xprotocol/EfficientNet-B3-Cattle-Disease)
- **Access Date**: 12 September 2026
- **Purpose**: Pretrained visual classifier for cattle observational cues (target classes: `foot-and-mouth`, `healthy`, `lumpy`).
- **License / Usage Notes**: Apache License 2.0.
- **Local Copy Paths**:
  - Model Weights: `models/efficientnet_b3_best.keras` (122.0 MB)
  - Documentation: `models/README.md`
  - Test Results: `data/external/efficientnet_b3_test_results.csv`, `data/external/lumpy_skin_external_test_results.csv`
- **Citation Information**:
  > Tan, M., & Le, Q. V. (2019). *EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks*. International Conference on Machine Learning (ICML 2019). ArXiv:1905.11946. Model fine-tuning hosted by xprotocol on Hugging Face (2026).

---

### Source 7: Open-Meteo Weather API
- **Source Name**: Open-Meteo Historical & Forecast Weather API
- **Organization**: Open-Meteo GmbH, Germany
- **Official URL**: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **Access Date**: 12 September 2026
- **Purpose**: Micro-climate parameter provider for temperature, humidity, rainfall, and soil moisture across Indian districts.
- **License / Usage Notes**: Creative Commons Attribution 4.0 International (CC-BY 4.0). Keyless open API for non-commercial research (up to 10,000 calls/day free).
- **Citation Information**:
  > Zippenfenig, P. (2026). *Open-Meteo: Free Open-Source Weather API and Meteorological Data*. Open-Meteo GmbH. https://open-meteo.com.

---

### Source 8: Open-Access Clinical Photographic References
- **Source 1**: *Pathology and pathogenesis of Foot-and-mouth disease virus infection in cattle*, BioMed Central Veterinary Research, CC-BY 2.0. [Wikimedia Commons: `File:13567_2013_Article_316_Fig2_HTML.webp`]. Local: `data/images/cow_fmd_clinical_lesion.jpg`.
- **Source 2**: *Robust multi-class lumpy skin disease diagnosis for practical livestock applications*, Nature Scientific Reports, Vol 16, 2026, CC-BY 4.0, DOI: 10.1038/s41598-026-66229-2. Local: `data/images/cow_lumpy_skin_clinical_nodules.jpg`.
- **Source 3**: *Bos taurus cattle in pasture*, Wikimedia Commons, Public Domain / CC-BY-SA 3.0. Local: `data/images/cow_healthy_reference.jpg`.
