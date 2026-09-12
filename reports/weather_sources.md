# Weather & Environmental Data Source Evaluation

**JeevRakshak AI — Phase 1 Environmental Risk Evaluation**  
**Document Code**: `ENV-EVAL-2026-V1`  
**Purpose**: Rigorously evaluates candidate weather and climate data providers to establish micro-climatic disease risk context for Indian livestock epidemiological monitoring.

---

## 1. Role of Weather in Livestock Disease Epidemiology

In Indian agro-climatic zones, meteorological variables directly precipitate or accelerate livestock disease outbreaks:
1. **Haemorrhagic Septicaemia (HS)**: Strongly correlated with sudden drops in temperature, prolonged monsoon precipitation, and extreme relative humidity (>80%), which compromise bovine mucosal immunity.
2. **Lumpy Skin Disease (LSD)**: Mechanical vector proliferation (biting flies *Stomoxys calcitrans*, mosquitoes *Aedes*/*Culex*) peaks during post-monsoon warm, humid conditions (temperatures between 24°C–34°C and high soil/ambient moisture).
3. **Anthrax**: Spore germination and pasture contamination frequently occur after torrential rainfall followed by dry, warm spells in alkaline soils.
4. **Foot-and-Mouth Disease (FMD)**: Atmospheric transmission and aerosol plume survival depend on high relative humidity (>60%) and gentle wind dispersal under cool conditions.

---

## 2. Comparative Provider Analysis

| Evaluation Criterion | Candidate 1: Open-Meteo (Recommended) | Candidate 2: India Meteorological Dept (IMD) | Candidate 3: NASA POWER | Candidate 4: OpenWeatherMap |
| :--- | :--- | :--- | :--- | :--- |
| **Provider Organization** | Open-Meteo GmbH (Global Open Weather API) | IMD, Ministry of Earth Sciences, Govt. of India | NASA Langley Research Center (USA) | OpenWeather Ltd. (Commercial) |
| **License / Terms** | Non-commercial open access (Creative Commons Attribution 4.0) | Government Open Data / Institutional Access | Public Domain (US Federal Government) | Proprietary Commercial (Free tier with strict limits) |
| **API Key Requirement** | **None** (Keyless REST API for open-source / hackathons) | Varies; REST endpoints require developer registration / approval | **None** (Keyless REST API) | **Required** (API key registration mandatory) |
| **Rate Limits / Free Tier** | **10,000 daily API calls free** (seamless for research & pilot field apps) | No official public SLA; frequent downtime / portal CAPTCHA | 30 requests/minute (higher latency) | 1,000 calls/day (exceeded rapidly during testing) |
| **Geographic Coverage** | Global (0.1° resolution / ~11 km; includes all Indian districts and tehsils) | India only (station-specific; coverage patchy across rural areas) | Global (0.5° × 0.5° grid / ~50 km) | Global (interpolated) |
| **Historical Data** | Full historical archive (ECMWF ERA5 & ERA5-Land back to **1940**) | Limited to published annual bulletins / paid archives | 1981 to present | Paid tier only ("One Call 3.0" requires credit card) |
| **Forecast Availability** | Seamless 7 to 16-day hourly and daily forecast | District agromet advisories published as PDFs / bulletin tables | Forecasts not primary focus | 5-day / 3-hour forecast on free tier |
| **Key Parameters** | • 2m Temperature (Mean, Max, Min)<br>• Relative Humidity (2m)<br>• Precipitation / Rainfall (mm)<br>• Soil Temperature & Moisture (0–7cm)<br>• Wind Speed & Direction (10m)<br>• Solar Radiation | • Max / Min Temperature<br>• Daily Rainfall<br>• Morning / Evening Humidity | • Temperature at 2m<br>• Relative Humidity<br>• Precipitation<br>• Surface Solar Radiation | • Current Temperature<br>• Humidity<br>• Weather description |

---

## 3. Evaluation Findings & Recommendation

### Selected Primary Candidate: **Open-Meteo API**

**Why Open-Meteo is the Optimal Choice for JeevRakshak:**
1. **Zero Barrier to Integration**: Requires no private API keys, credit cards, or institutional agreements, ensuring reproducibility in open research and evaluation environments.
2. **Covers All Required Epidemiological Variables**:
   - `temperature_2m` (ambient heat stress and vector development rates)
   - `relative_humidity_2m` (vector survival and viral aerosol persistence)
   - `precipitation` (waterlogging, stagnant vector breeding pools, flooding)
   - `soil_temperature_0_to_7cm` and `soil_moisture_0_to_7cm` (bacterial spore ecology and pasture conditions)
3. **High Resolution for Rural India**: 11 km grid resolution allows pinpointing village/taluk micro-climates where district headquarters stations may be 40–80 km away.
4. **Dual Historical + Forecast Capability**: Allows retrospective correlation against past disease incidence as well as forward-looking risk forewarning in later phases.

### Phase 1 Status
In strict adherence to Phase 1 constraints:
- **No live automated API polling or engine integration is implemented in Phase 1.**
- Candidate specifications and ingestion schemas are codified for Phase 2 implementation.
