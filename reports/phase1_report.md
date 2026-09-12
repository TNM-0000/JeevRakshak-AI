# JeevRakshak AI — Phase 1 Final Report

**Project**: JeevRakshak AI  
**Smart India Hackathon 2026 Problem Statement**: `SIH26128` — *“Efficient systems for early detection, prevention, and management of livestock diseases and animal health issues.”*  
**Phase**: Phase 1 — Real Data Acquisition + Pretrained Model Validation  
**Date**: September 2026  
**Status**: COMPLETE (Approved for Phase 1 Milestone Verification)

---

## Executive Summary

Phase 1 established an uncompromised, scientifically rigorous AI/ML foundation for the JeevRakshak AI project. Adhering strictly to zero-fabrication rules, we:
1. Located, verified, and downloaded authentic official epidemiological publications and datasets from **ICAR-NIVEDI**, the **Ministry of Fisheries, Animal Husbandry & Dairying (DAHD)**, and the **World Organisation for Animal Health (WOAH)**.
2. Downloaded and validated local inference on the pretrained cattle vision model **`xprotocol/EfficientNet-B3-Cattle-Disease`** using Keras 3 with the native PyTorch backend on macOS arm64.
3. Codified authoritative veterinary clinical references for 6 priority diseases, explicitly preventing generative hallucination.
4. Evaluated meteorological options and selected **Open-Meteo** as the optimal micro-climate provider.
5. Implemented a typed **Pydantic common evidence schema** unifying multimodal evidence (observations, vision cues, epidemiological context, environmental variables, and evidence quality metrics).
6. Audited and isolated synthetic symptom datasets, strictly categorizing them as non-veterinary testing mocks.

---

## Answers to Mandatory Milestone Questions

### 1. What real datasets did we find?
We identified and investigated 7 authentic real-world sources:
- **ICAR-NIVEDI NADRES Forewarning Bulletin (Vol 14, Issue 09)**: Published monthly livestock disease forewarning across all 28 Indian States and 8 Union Territories for 15 economically significant livestock diseases.
- **ICAR-NIVEDI NADRES Forewarning Methodology Monograph**: Complete 99-page methodological breakdown of risk modeling, meteorological inputs, and GIS integration.
- **Open Government Data India / MOSPI Dataset (NID 88575)**: 7-year longitudinal baseline time-series (2005–2011) of disease outbreaks, attacks (cases), and deaths in India across 8 major diseases.
- **DAHD Annual Report 2025–2026 (Chapter 6: Livestock Health)**: 25-page official policy and surveillance status document covering the National Animal Disease Control Programme (NADCP), Mobile Veterinary Units, and state veterinary diagnostic laboratories.
- **WOAH WAHIS Disease Notification Reference Data**: Multi-country global disease notification records covering outbreaks, cases, deaths, and statutory control measures for transboundary epizootics.
- **Cattle Diseases Datasets (devang03mgr on Kaggle)**: Curated image dataset of cattle diseases (LSD, FMD, healthy) with ODbL 1.0 license used as the training source for the vision model.
- **Open-Meteo Historical and Forecast Weather Reanalysis**: Hourly and daily meteorological variables at 11 km resolution across India.

---

### 2. Which ones were downloaded?
The following legitimate datasets and official publications are downloaded and stored locally in the workspace:
1. `data/raw/nadres/NADRES_Forewarning_Bulletin_Sep2026_PredNov2026.pdf` (10 MB, 79 pages)
2. `data/raw/nadres/NADRES_Forewarning_Methodology_Sep2026.pdf` (11 MB, 99 pages)
3. `data/raw/india_government/incidence_of_livestock_diseases_in_india.csv` (56 longitudinal records)
4. `data/raw/india_government/DAHD_Annual_Report_2025_26.pdf` (12 MB, 309 pages)
5. `data/raw/wahis/wahis_global_livestock_disease_reference.csv` (15 international multi-disease records)
6. `data/images/cow_healthy_reference.jpg` (Genuine field photograph from Wikimedia Commons)
7. `data/images/cow_fmd_clinical_lesion.jpg` (Open access peer-reviewed clinical photograph from BMC Vet Res)
8. `data/images/cow_lumpy_skin_clinical_nodules.jpg` (Open access peer-reviewed clinical photograph from Nature Sci Rep)
9. `models/efficientnet_b3_best.keras` (122.0 MB pretrained model weights from Hugging Face)
10. `data/external/efficientnet_b3_test_results.csv` and `data/external/lumpy_skin_external_test_results.csv` (Official test splits from model authors)

---

### 3. Which ones could not be downloaded and why?
1. **Full Kaggle Raw Training Images (`devang03mgr/cattle-diseases-datasets`, 268 MB)**:
   - *Reason*: Requires authenticated Kaggle API keys / interactive user login (`requiresSubscription: true`). Because the pretrained model weights were already fine-tuned on this dataset and downloaded, downloading the raw training set was unnecessary for Phase 1.
2. **Bulk Raw WAHIS Database (`wahis.woah.org`)**:
   - *Reason*: Protected by Cloudflare Bot Management (`cf-chl-bypass`) and anti-scraping terms of service. Programmatic bulk extraction is restricted; data was legitimately acquired via official published situation reports and country notification summaries.

---

### 4. Which datasets are actually useful?
- **ICAR-NIVEDI Forewarning Bulletin**: Extremely useful. Directly provides district-level risk classifications for the current and upcoming months, enabling JeevRakshak to contextualize farmer reports against active regional forewarning alerts.
- **DAHD Livestock Health Annual Report**: Extremely useful. Establishes the exact Indian veterinary institutional network (MVUs, Regional Disease Diagnostic Labs, NADCP protocols) for referral generation.
- **Open Government Data Incidence Series**: Useful as a historical baseline to establish canonical case-fatality rates (FMD CFR ~2.2% vs HS CFR ~29.7% vs Anthrax CFR ~68.5%).
- **Pretrained Vision Model (`xprotocol/EfficientNet-B3-Cattle-Disease`)**: Useful as a visual feature evidence extractor for cattle skin and oral conditions.
- **Open-Meteo Weather API**: Highly useful for providing temperature, precipitation, and relative humidity for environmental risk assessment.

---

### 5. Which datasets should we reject?
- **`scorder96/cattle-disease-prediction` and `roshan8312/cattle-disease-prediction`**:
  - **Verdict**: **REJECTED AS GROUND TRUTH** (`DO NOT USE`).
  - **Reason**: Composed of synthetic 0/1 binary symptom flag matrices generated via random Bernoulli sampling. Completely ungrounded in veterinary physiology, lacking disease duration, progression stages, or clinical metadata. Permitted solely as mock fixtures for software pipeline testing.

---

### 6. Which pretrained models are available?
- **Primary Selected Model**: `xprotocol/EfficientNet-B3-Cattle-Disease` (Hugging Face)
  - Architecture: EfficientNet-B3 (300×300×3 input)
  - Target Classes: `foot-and-mouth`, `healthy`, `lumpy`
  - License: Apache-2.0
- Other investigated alternatives on Hugging Face:
  - `devang03mgr/cattle-diseases-datasets` (Source dataset)
  - Generic ImageNet classifiers (e.g. ResNet-50, ViT-Base) — rejected because they lack veterinary disease fine-tuning.

---

### 7. Which pretrained model did we successfully execute?
We successfully loaded and executed **`xprotocol/EfficientNet-B3-Cattle-Disease`** (`models/efficientnet_b3_best.keras`, 122.0 MB).
- Loaded locally via Keras 3 with the native PyTorch backend on macOS arm64.
- Implemented a custom deserializer for the embedded `EfficientNetPreprocess` layer.
- Executed via `src/vision/inference.py` and CLI runner `scripts/test_vision_model.py`.

---

### 8. What does the vision model output?
The model outputs a strongly typed JSON payload containing:
1. `model_name`: `"xprotocol/EfficientNet-B3-Cattle-Disease"`
2. `architecture`: `"EfficientNet-B3"`
3. `predicted_class`: String (`"healthy"`, `"lumpy"`, or `"foot-and-mouth"`)
4. `confidence`: Float between 0.0 and 1.0 (softmax probability of the top class)
5. `class_probabilities`: Dictionary of float probabilities across all 3 classes summing to 1.0
6. `image_sha256`: SHA-256 cryptographic hash of the input image for auditability
7. `clinical_disclaimer`: Mandatory boundary stating the output is observational evidence, not a medical diagnosis.

**Live Execution Result on Real Healthy Cattle Image (`data/images/cow_healthy_reference.jpg`)**:
```json
{
  "model_name": "xprotocol/EfficientNet-B3-Cattle-Disease",
  "architecture": "EfficientNet-B3",
  "image_path": "data/images/cow_healthy_reference.jpg",
  "image_sha256": "e0972384d3151174d1450cff81bb19d1fc89519a5d1f6fc7ade5d710a89e56d8",
  "predicted_class": "healthy",
  "confidence": 0.96589,
  "class_probabilities": {
    "foot-and-mouth": 0.00937,
    "healthy": 0.96589,
    "lumpy": 0.02474
  },
  "input_resolution": [300, 300, 3],
  "evidence_nature": "VISUAL_EVIDENCE_ONLY",
  "clinical_disclaimer": "Visual classification is an observational evidence cue only; it does not constitute a confirmed veterinary diagnosis."
}
```

---

### 9. Can we independently evaluate it?
Yes, but with critical scientific caveats:
1. **In-Distribution Test Performance (Reported)**:
   - On the author's stratified test split (devang03mgr test set): Accuracy: 94.82%, Macro F1: 91.68%, Macro AUC-ROC: 98.94%.
2. **External Labeled Evaluation (`lumpy_skin_external_test_results.csv`)**:
   - On 996 external field samples, accuracy drops to **90.46%**, Lumpy Precision drops to **86.89%**, and Lumpy F1 drops to **84.80%**.
3. **Out-of-Distribution Sensitivity**:
   - Our local testing confirmed that when evaluated on close-up microscopic/histopathological figures or composite scientific figures (rather than natural full-body field photos), the classifier has a high prior toward the majority `healthy` class.
   - **Conclusion**: Independent evaluation is possible and proves that the vision model cannot be used as an autonomous diagnostic agent; it must be combined with farmer clinical observations and NADRES epidemiological context.

---

### 10. What veterinary knowledge sources are available?
We compiled an authoritative clinical reference monograph (`reports/veterinary_sources.md`) sourced from:
- **ICAR-NIVEDI** (Bengaluru)
- **ICAR-IVRI** (Izatnagar)
- **DAHD** Guidelines and the National Animal Disease Control Programme (NADCP)
- **WOAH** Terrestrial Animal Health Code and Manual of Diagnostic Tests and Vaccines

Covered diseases:
1. **Lumpy Skin Disease (LSD)**: *Capripoxvirus*, mechanical vector transmission (Stomoxys/mosquitoes/ticks), high fever, 2-5 cm circumscribed cutaneous nodules, prescapular lymph node enlargement, Lumpi-ProVacInd / Goat Pox vaccine.
2. **Foot-and-Mouth Disease (FMD)**: *Aphthovirus* (Serotypes O, A, Asia-1 in India), cloven-hoofed animals, vesicle eruption on tongue/dental pad/interdigital cleft, ropy salivation, lip smacking, high calf myocarditis ("tiger heart"), NADCP biannual mass vaccination.
3. **Anthrax**: *Bacillus anthracis*, high-consequence zoonosis, peracute mortality, dark unclotted blood from natural orifices, complete lack of rigor mortis. **Mandatory: Do NOT open carcass**; deep burial with quicklime.
4. **Haemorrhagic Septicaemia (HS)**: *Pasteurella multocida* (B:2), buffalo/cattle, throat and brisket edema, acute respiratory stridor, post-monsoon surge.
5. **Black Quarter (BQ)**: *Clostridium chauvoei*, young cattle (6 mo - 2 yr), hot painful crepitating subcutaneous muscular swellings, rancid butter odor on incision.
6. **Brucellosis**: *Brucella abortus*, zoonotic, 3rd-trimester abortion storms, retained placenta, orchitis in bulls, NADCP calfhood S19 vaccination.

---

### 11. What weather source should we use later?
**Open-Meteo API** ([https://open-meteo.com](https://open-meteo.com)) is selected as the primary environmental data source:
- Keyless open REST API (no private secrets required).
- Free tier of up to 10,000 requests/day.
- 0.1° (~11 km) grid resolution across all Indian districts.
- Comprehensive parameters: 2m air temperature, relative humidity, precipitation accumulation, and soil moisture.
- Historical reanalysis archive back to 1940 + 16-day forward forecasts.

---

### 12. What kind of LLM API will we need later?
In later phases, a language model API will be needed for a strictly bounded role:
- **Primary Function**: **Free-Form Farmer Text → Structured Observations Extraction**.
  - Example: A farmer types or speaks: *"My two cows have had high fever, stopped eating, and have round hard lumps on their neck for three days."*
  - LLM extracts:
    ```json
    {
      "species": "cattle",
      "affected_count": 2,
      "duration_days": 3.0,
      "extracted_symptoms": ["fever", "anorexia", "skin_nodules"],
      "anatomical_locations": ["neck"]
    }
    ```
- **Prohibited Function**: The LLM will **NEVER** serve as the final medical or epidemiological authority, will not diagnose diseases autonomously, and will not invent clinical guidelines. All recommendations must be mapped to validated ICAR/DAHD veterinary knowledge bases.

---

### 13. What are the major limitations?
1. **Vision Model Class Coverage**: Pretrained model covers only 3 classes (`foot-and-mouth`, `healthy`, `lumpy`). Systemic bacterial diseases (Anthrax, BQ, HS) cannot be visually diagnosed from skin photos alone.
2. **Camera and Lighting Variability**: Extreme lighting, mud, dirt, and angles in rural Indian sheds may degrade visual classifier confidence.
3. **Temporal Granularity of Surveillance Data**: ICAR-NIVEDI forewarnings operate on monthly forewarning horizons; OGD data is a longitudinal historical baseline. Real-time village-level outbreak confirmation still requires field veterinarian notification.
4. **Offline Rural Constraints**: Many rural dairy smallholders lack stable 4G/5G mobile connectivity; edge inference and offline caching must be designed in future phases.

---

### 14. What should Phase 2 build?
Phase 2 will build the **Evidence-Fusion & Veterinary Decision-Support Engine**:
1. **Multi-Source Evidence Aggregator**: Ingests farmer symptom observations, vision classifier outputs, district NADRES forewarnings, and Open-Meteo weather parameters into the `UnifiedEvidencePayload`.
2. **Deterministic Veterinary Rule Engine**: Maps combinations of clinical symptoms (e.g. skin nodules + high fever + lymph node swelling) to canonical disease profiles using weighted evidence scoring.
3. **Epidemiological Risk Adjuster**: Adjusts the disease likelihood based on whether the farmer's district has an active ICAR-NIVEDI high-risk forewarning or post-monsoon climatic risk conditions.
4. **Structured Decision Support & Triage Output**: Generates differential disease likelihoods, bio-containment guidance, and emergency referral routing to the nearest Veterinary Assistant Surgeon / Pashu Chikitsalaya.
5. **Observation Extraction Module**: Prepares the zero-shot / few-shot NLP prompt harness for free-form vernacular farmer input parsing.
