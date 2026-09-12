# JeevRakshak AI — Dataset Inventory

**Document Code**: `DATA-INV-2026-V1`  
**Phase**: Phase 1 — Real Data Acquisition & Pretrained Model Validation  
**Last Updated**: September 2026  
**Auditor**: JeevRakshak AI Research Team

---

## 1. Inventory Summary Matrix

| Dataset / Source Name | Source Authority | Nature | Recommendation | Primary Role in JeevRakshak |
| :--- | :--- | :--- | :--- | :--- |
| **ICAR-NIVEDI NADRES Forewarning Bulletin (Vol 14, Issue 09)** | ICAR-NIVEDI | Real (Institutional) | **USE** | Current monthly disease risk context across Indian districts |
| **ICAR-NIVEDI NADRES Methodology Document** | ICAR-NIVEDI | Real (Methodological) | **REFERENCE ONLY** | Algorithmic and risk factor reference for epidemiologic modeling |
| **Incidence of Livestock Diseases In India (OGD India / MOSPI)** | MOSPI / DAHD, GoI | Real (Official Govt) | **USE WITH CAUTION** | Longitudinal epidemiological baseline; not for real-time surveillance |
| **DAHD Annual Report 2025–2026 (Chapter 6: Livestock Health)** | DAHD, GoI | Real (Official Govt) | **USE** | Policy benchmarks, national disease eradication programs (NADCP/LH&DCP) |
| **WOAH WAHIS Global Disease Reference Data** | WOAH (World Org for Animal Health) | Real (International) | **REFERENCE ONLY** | Macro transboundary disease context and global case-fatality rates |
| **Pretrained Model: xprotocol/EfficientNet-B3-Cattle-Disease** | Hugging Face / xprotocol | Real (Pretrained) | **USE WITH CAUTION** | Visual observational evidence for cattle (`fmd`, `healthy`, `lumpy`) |
| **Cattle Diseases Datasets (devang03mgr)** | Kaggle | Real (Curated) | **REFERENCE ONLY** | Training provenance and class distribution audit for vision model |
| **Cattle Disease Prediction (scorder96/roshan8312)** | Hugging Face | **Synthetic** | **DO NOT USE** | Testing mocks only; strictly barred from clinical ground truth |
| **Open-Meteo Weather Archive & API** | Open-Meteo GmbH | Real (Meteorological) | **USE** | Micro-climate risk variables (temperature, humidity, precipitation) |
| **Authentic Cattle Clinical Validation Images** | Wikimedia / Springer Nature | Real (Photographic) | **USE** | Local vision inference verification across 3 target classes |

---

## 2. Detailed Dataset Profiles

### Profile 1: ICAR-NIVEDI NADRES Forewarning Bulletin (Sep 2026)
- **Name**: Vet-Alert Livestock Disease Risk Forewarning Bulletin (Prediction for November 2026)
- **Source Organization**: ICAR - National Institute of Veterinary Epidemiology and Disease Informatics (NIVEDI), Bengaluru
- **Source URL**: [https://nivedi.res.in/Nadres_v2/bulletin.php](https://nivedi.res.in/Nadres_v2/bulletin.php)
- **Local File Path**: `data/raw/nadres/NADRES_Forewarning_Bulletin_Sep2026_PredNov2026.pdf`
- **Processed File Path**: `data/processed/nadres/nadres_state_forewarning_nov2026.csv`, `.json`
- **File Format**: PDF (79 pages); processed to structured CSV / JSON
- **Number of Records**: 33 Indian States and Union Territories (covering all districts)
- **Diseases Covered**: 15 major diseases:
  - *Viral*: ASF, BT, CSF, FMD, LSD, PPR, Sheep & Goat Pox
  - *Parasitic*: Babesiosis, Fasciolosis, Theileriosis, Trypanosomosis
  - *Bacterial*: Anthrax, BQ, ET, HS
- **Host Species**: Cattle, Buffalo, Sheep, Goats, Swine
- **Geographic Coverage**: All India (National, State, and District levels)
- **Time Coverage**: Published September 2026; forewarning validity target: November 2026
- **License**: Official ICAR-NIVEDI Publication (All rights reserved; citation mandatory)
- **Real / Synthetic**: **Real** (derived from 20+ years of state surveillance data and meteorological modeling)
- **Intended Role**: Serves as the primary epidemiological context provider for JeevRakshak. Allows checking whether a farmer's district is under active alert for a suspected disease.
- **Quality Assessment**: Exceptional institutional authority; vetted by national veterinary epidemiologists.
- **Limitations**: Released as monthly PDF bulletins rather than an open machine-readable REST API. Public release covers 2-month forewarning horizon.
- **Recommendation**: **USE**

---

### Profile 2: ICAR-NIVEDI Forewarning Methodology Document
- **Name**: Vet-Alert Livestock Disease Risk Forewarning Methodology
- **Source Organization**: ICAR-NIVEDI, Bengaluru
- **Source URL**: [https://nivedi.res.in/Nadres_v2/bulletin.php](https://nivedi.res.in/Nadres_v2/bulletin.php)
- **Local File Path**: `data/raw/nadres/NADRES_Forewarning_Methodology_Sep2026.pdf`
- **File Format**: PDF (99 pages)
- **Number of Records**: N/A (Methodology monograph)
- **License**: Official ICAR Publication
- **Real / Synthetic**: **Real**
- **Intended Role**: Informs the design of JeevRakshak's environmental and epidemiological risk feature engineering in Phase 2.
- **Limitations**: Explains mathematical models (multivariate logistic regression, random forests, ARIMA, GIS spatial analysis) without releasing raw weights or district feature matrices.
- **Recommendation**: **REFERENCE ONLY**

---

### Profile 3: Incidence of Livestock Diseases In India
- **Name**: Incidence of Livestock Diseases In India (NID: 88575)
- **Source Organization**: Ministry of Statistics and Programme Implementation (MOSPI) & DAHD, Government of India
- **Source URL**: [https://data.gov.in/catalog/incidence-livestock-diseases-india](https://data.gov.in/catalog/incidence-livestock-diseases-india)
- **Local File Path**: `data/raw/india_government/incidence_of_livestock_diseases_in_india.csv`
- **Processed File Path**: `data/processed/india_government/india_disease_incidence_processed.csv`, `disease_longitudinal_summary.json`
- **File Format**: CSV (56 rows)
- **Fields**: `Disease`, `Species_Affected`, `Year`, `Outbreaks`, `Attacks`, `Deaths`
- **Derived Fields**: `Case_Fatality_Rate_Pct`, `Attacks_Per_Outbreak`, `Standardized_Disease`
- **Diseases Covered**: FMD, HS, BQ, Anthrax, Sheep & Goat Pox, Enterotoxaemia, Classical Swine Fever, Rabies
- **Time Coverage**: 2005 to 2011 (Longitudinal 7-year baseline)
- **License**: Government Open Data License - India (GODL) / NDSAP
- **Real / Synthetic**: **Real** (Official Government of India statistical records)
- **Intended Role**: Provides long-term historical baseline for disease outbreaks and canonical Case Fatality Rates (e.g. FMD CFR ~2.2% vs HS CFR ~29.7% vs Anthrax CFR ~68.5%).
- **Limitations**: Historical baseline data; cannot be used for real-time outbreak surveillance. Data is aggregated at the national level.
- **Recommendation**: **USE WITH CAUTION** (Strictly as historical baseline context; never as active surveillance).

---

### Profile 4: DAHD Annual Report 2025–2026 (Chapter 6: Livestock Health)
- **Name**: Annual Report 2025–2026, Department of Animal Husbandry and Dairying
- **Source Organization**: Department of Animal Husbandry and Dairying (DAHD), MoFAH&D, GoI
- **Source URL**: [https://dahd.gov.in/annual-report](https://dahd.gov.in/annual-report)
- **Local File Path**: `data/raw/india_government/DAHD_Annual_Report_2025_26.pdf`
- **File Format**: PDF (309 pages; Chapter 6 spans pages 111–136)
- **Time Coverage**: Fiscal Year 2025–2026
- **License**: Government of India Public Document
- **Real / Synthetic**: **Real**
- **Intended Role**: Establishes ground truth on Government disease control programs (NADCP for FMD/Brucellosis mass vaccination, Mobile Veterinary Units, Regional Disease Diagnostic Laboratories NRDDL/SRDDL/WRDDL/ERDDL/NERDDL).
- **Recommendation**: **USE**

---

### Profile 5: WOAH WAHIS Global Disease Reference Dataset
- **Name**: World Animal Health Information System (WAHIS) Global Disease Reference Data
- **Source Organization**: World Organisation for Animal Health (WOAH, Paris)
- **Source URL**: [https://wahis.woah.org](https://wahis.woah.org) / [https://www.woah.org](https://www.woah.org)
- **Local File Path**: `data/raw/wahis/wahis_global_livestock_disease_reference.csv`
- **Processed File Path**: `data/processed/wahis/wahis_global_reference_processed.csv`, `.json`
- **File Format**: CSV (15 multi-country records)
- **Diseases Covered**: Lumpy Skin Disease, Foot and Mouth Disease, Anthrax, PPR, African Swine Fever
- **Geographic Coverage**: India, Bangladesh, Pakistan, Nepal, Turkey, Indonesia
- **Time Coverage**: 2022 to 2023
- **License**: Official WOAH surveillance data (Attribution: World Organisation for Animal Health)
- **Real / Synthetic**: **Real** (Official member state notifications)
- **Intended Role**: International macro reference for transboundary animal diseases and regional control strategies.
- **Limitations**: Bulk scraping `wahis.woah.org` is barred by bot protection and terms of use; data must be obtained through published situation bulletins and official country notifications.
- **Recommendation**: **REFERENCE ONLY**

---

### Profile 6: Pretrained Vision Model — EfficientNet-B3 Cattle Disease
- **Name**: `xprotocol/EfficientNet-B3-Cattle-Disease`
- **Source Organization / Host**: Hugging Face (`xprotocol`)
- **Source URL**: [https://huggingface.co/xprotocol/EfficientNet-B3-Cattle-Disease](https://huggingface.co/xprotocol/EfficientNet-B3-Cattle-Disease)
- **Local File Path**: `models/efficientnet_b3_best.keras` (122.0 MB)
- **File Format**: Keras 3 SavedModel (.keras zip archive containing HDF5 weights)
- **Backbone**: EfficientNet-B3 (ImageNet pre-trained)
- **Target Classes**: `0: foot-and-mouth`, `1: healthy`, `2: lumpy`
- **Training Strategy**: Two-phase transfer learning (frozen backbone 50 epochs; top 3 blocks unfrozen 30 epochs with Focal Loss)
- **License**: Apache-2.0
- **Reported Test Metrics**: Accuracy: 94.82%, Macro F1: 0.9168, Macro AUC-ROC: 0.9894
- **Real-world External Test**: Evaluated on 996 external samples: Accuracy dropped to 90.46%, Lumpy F1 dropped to 84.80%.
- **Local Test Confirmation**: Executed locally in `src/vision/inference.py`. Predicted `healthy` with 96.59% confidence on genuine healthy cow reference photograph.
- **Limitations**: Trained only on 3 classes. Cannot detect Anthrax, Black Quarter, or Haemorrhagic Septicaemia (which are systemic bacterial diseases diagnosed via clinical palpation/history rather than skin lesions). Prone to majority-class healthy bias on out-of-distribution macroscopic diagrams.
- **Recommendation**: **USE WITH CAUTION** (Strictly as visual feature evidence; never as standalone diagnostic authority).

---

### Profile 7: Cattle Diseases Datasets (Training Source for Vision Model)
- **Name**: Cattle diseases datasets
- **Source Author / Host**: Devang (`devang03mgr`) on Kaggle
- **Source URL**: [https://www.kaggle.com/datasets/devang03mgr/cattle-diseases-datasets](https://www.kaggle.com/datasets/devang03mgr/cattle-diseases-datasets)
- **Size / Distribution**: 268 MB (requires Kaggle user credentials for download)
- **License**: Open Database License (ODbL 1.0)
- **Classes**: Lumpy skin disease, foot and mouth disease, healthy cattle
- **Real / Synthetic**: Real field images
- **Recommendation**: **REFERENCE ONLY** (Since the model weights are already trained and downloaded, downloading the 268 MB raw training set is unnecessary for Phase 1).

---

### Profile 8: Synthetic Symptom Prediction Datasets
- **Name**: `scorder96/cattle-disease-prediction` and `roshan8312/cattle-disease-prediction`
- **Source Host**: Hugging Face Datasets
- **Source URL**: [https://huggingface.co/datasets/scorder96/cattle-disease-prediction](https://huggingface.co/datasets/scorder96/cattle-disease-prediction)
- **File Format**: CSV (`Training.csv`, `Testing.csv`)
- **Structure**: 92 binary (0/1) independent symptom flag columns and a target `prognosis` label
- **Real / Synthetic**: **SYNTHETIC — NOT VETERINARY GROUND TRUTH**
- **Analysis**: Contains artificially generated Bernoulli rows with uniform random combinations of symptoms (e.g. fever=1, milk_clots=1, aggression=0). Completely lacks physiological constraints, duration of illness, disease staging, and veterinarian clinical documentation.
- **Prohibited Uses**: Must never be used to train disease diagnostic models, establish accuracy benchmarks, or provide advice to farmers.
- **Permitted Uses**: May only serve as mock software inputs for unit testing serialization pipelines.
- **Recommendation**: **DO NOT USE**

---

### Profile 9: Open-Meteo Weather API
- **Name**: Open-Meteo Global Weather Archive & Forecast API
- **Provider**: Open-Meteo GmbH
- **Source URL**: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **License**: Creative Commons Attribution 4.0 International (CC-BY 4.0)
- **Parameters**: 2m Temperature, Relative Humidity, Precipitation, Wind Speed, Soil Moisture
- **Geographic Resolution**: 0.1° (~11 km) across all Indian districts
- **Historical Depth**: Back to 1940 (ERA5 reanalysis)
- **API Requirements**: Keyless REST API (10,000 requests/day free tier)
- **Real / Synthetic**: Real (Numerical Weather Prediction & Satellites)
- **Intended Role**: Environmental risk context provider for Phase 2.
- **Recommendation**: **USE**
