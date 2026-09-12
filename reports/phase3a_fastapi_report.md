# JeevRakshak AI — Phase 3A Report: FastAPI REST API Layer

**Project:** JeevRakshak AI  
**Smart India Hackathon 2026 Problem Statement:** SIH26128 — *“Efficient systems for early detection, prevention, and management of livestock diseases and animal health issues.”*  
**Phase:** Phase 3A (FastAPI API Layer Integration)  
**Date:** September 2026  
**Status:** Completed & Validated (36/36 Automated Tests Passing)  

---

## 1. Executive Summary

Phase 3A introduces the lightweight, high-performance **FastAPI REST API Layer** around the validated Phase 2 standalone evidence-fusion and veterinary assessment engine. 

The API serves as the transport and contract boundary for future integration with the Next.js web application. Crucially:
- **Zero Phase 2 Redesign**: No Phase 2 AI/ML logic, evidence weights, or veterinary models were rebuilt or duplicated.
- **Zero Frontend / Database Coupling**: The Next.js frontend, Supabase database, tables, and authentication were **NOT** touched or modified.
- **Strict Boundary**: The API layer simply performs HTTP serialization, input validation, temporary file management for image uploads, and dispatches to `src.assessment.engine.run_full_assessment`.
- **Safety Rule Preservation**: The non-bypassable **Anthrax Safety Lock** (prohibiting necropsy/post-mortem carcass incisions) and **Epidemiological Cluster vs. Outbreak** distinctions remain 100% intact.

---

## 2. Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                            NEXT.JS FRONTEND (Future)                              |
+----------------------------------------+------------------------------------------+
                                         |
                       HTTP / JSON or Multipart/Form-Data
                                         v
+-----------------------------------------------------------------------------------+
|                          FASTAPI API LAYER (api/)                                 |
|                                                                                   |
|  - GET /health               Lightweight operational probe                        |
|  - GET /docs                 Auto-generated interactive Swagger UI                |
|  - POST /api/ai/assess       Primary multimodal decision-support endpoint         |
|  - Secure Image Ingestion    Validates extensions/MIMEs, writes temp file, cleans |
|  - Development CORS          Permits localhost:3000 Next.js development origins   |
+----------------------------------------+------------------------------------------+
                                         |
                            Direct Function Invocations
                                         v
+-----------------------------------------------------------------------------------+
|                 EXISTING PHASE 2 STANDALONE ASSESSMENT ENGINE                     |
|                 (src/assessment/engine.py -> run_full_assessment)                 |
|                                                                                   |
|  +---------------------------+  +-----------------------------------------------+ |
|  | Deterministic NLP Extr.   |  | Pretrained Vision Model (EfficientNet-B3)     | |
|  +-------------+-------------+  +-----------------------+-----------------------+ |
|                |                                        |                         |
|  +-------------v-------------+  +-----------------------v-----------------------+ |
|  | ICAR-NIVEDI NADRES Forew. |  | Open-Meteo Environmental Weather Adapter      | |
|  +---------------------------+  +-----------------------------------------------+ |
|                                |                                                  |
|  +-----------------------------v------------------------------------------------+ |
|  | Deterministic Veterinary KB (6 Priority Profiles: LSD, FMD, Anthrax, HS, BQ) | |
|  | Weighted Evidence Scoring (support_level: low | moderate | high)             | |
|  | Risk & Cluster Signal Engine (possible_cluster_signal, never confirmed)       | |
|  | Action & Escalation Engine (Strict Anthrax Necropsy Prohibition Lock)          | |
|  +------------------------------------------------------------------------------+ |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                    CANONICAL JEEVRAKSHAK ASSESSMENT JSON                          |
|                    (src/common/schema.py -> JeevRakshakAssessment)                |
+-----------------------------------------------------------------------------------+
```

---

## 3. What Was Added

A minimal, dedicated `api/` package was added to the repository root:

```
api/
├── __init__.py          # Package initialization
├── main.py              # FastAPI application, CORS, and endpoint handlers
└── schemas.py           # HTTP Request/Response models aligned with canonical contract
```

### 3.1 Dependencies Added to `requirements.txt`
```
# API & Web Service (Phase 3A)
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
python-multipart>=0.0.9
httpx>=0.27.0
```

---

## 4. Reused Phase 2 Modules

The API acts purely as a transport adapter and directly invokes:

1. **`src.assessment.engine.run_full_assessment`**: The master orchestrator that connects all evidence streams.
2. **`src.common.schema.JeevRakshakAssessment`**: The **ONE** canonical assessment Pydantic contract used as the response model.
3. **`src.vision.inference.ALLOWED_EXTENSIONS`**: Enforces identical image format constraints (`.jpg`, `.jpeg`, `.png`, `.webp`) at the HTTP boundary.
4. **`src.vision.inference.predict_cattle_image`**: Reused downstream for image validation, SHA-256 audit hashing, and local PyTorch/Keras 3 inference.
5. **`src.nlp.extractor`**, **`src.veterinary.knowledge_base`**, **`src.evidence.scoring`**, **`src.risk.engine`**, and **`src.actions.engine`**: All execute with zero modification.

---

## 5. API Endpoints

### 5.1 `GET /health`
- **Purpose**: Fast, lightweight liveness probe for load balancers and frontend health checks.
- **Computation**: Does **not** trigger ML models or external network queries.
- **Response Format (`application/json`)**:
  ```json
  {
    "status": "ok",
    "service": "jeevrakshak-ai-api",
    "version": "1.0.0"
  }
  ```

### 5.2 `POST /api/ai/assess`
- **Purpose**: Primary clinical assessment entry point for field workers and farmers.
- **Accepted Content-Types**:
  1. `application/json`: Used for text-only submissions.
  2. `multipart/form-data`: Used when uploading a digital photograph along with narrative and location metadata.

#### Request Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `text` | string | Optional* | Free-form clinical symptom description (English / Hinglish / vernacular). |
| `image` | binary file | Optional* | Photographic image (JPEG, PNG, WEBP). |
| `state` | string | Optional | Administrative State or UT in India (e.g. `"Rajasthan"`). |
| `district` | string | Optional | Administrative District name (e.g. `"Bikaner"`). |
| `species` | string | Optional | Host animal species override (e.g. `"cattle"`, `"buffalo"`). |
| `affected_count` | integer | Optional | Explicit count of symptomatic animals. |
| `total_herd_size` | integer | Optional | Total animals in herd/flock if known. |
| `duration_days` | float | Optional | Duration of illness in days. |
| `vaccination_status` | string | Optional | Vaccination history (e.g. `"vaccinated"`, `"unvaccinated"`). |

*\*At least one of `text` or `image` must be provided.*

#### Response Format (`application/json`)
Returns the complete canonical `JeevRakshakAssessment` object:
```json
{
  "assessment_id": "aa2b267c-8b11-42a8-9dd8-cce52a965fe5",
  "created_at": "2026-09-12T20:15:39.123456Z",
  "input_summary": { ... },
  "animal_context": { ... },
  "observations": { ... },
  "visual_analysis": { ... },
  "possible_conditions": [ ... ],
  "epidemiological_context": { ... },
  "environmental_context": { ... },
  "risk_assessment": { ... },
  "recommended_actions": { ... },
  "escalation": { ... },
  "data_gaps": [ ... ],
  "sources": [ ... ],
  "disclaimer": "This assessment is a veterinary decision-support aid and does not constitute a confirmed veterinary diagnosis. Always consult a certified veterinary officer."
}
```

### 5.3 Interactive Documentation
- **Swagger UI**: Accessible at `http://127.0.0.1:8000/docs`
- **ReDoc**: Accessible at `http://127.0.0.1:8000/redoc`
- **OpenAPI JSON**: Accessible at `http://127.0.0.1:8000/openapi.json`

---

## 6. Image Upload Handling

The API manages image uploads with strict security and defensive programming:
1. **MIME & Extension Validation**: Rejects unsupported non-image uploads (e.g. PDF documents, executable binaries) with an immediate `415 Unsupported Media Type` response.
2. **Secure Temporary File Storage**: Uploaded image bytes are streamed to a temporary file via Python's `tempfile.NamedTemporaryFile` with a sanitized suffix.
3. **Guaranteed Cleanup**: Temporary image files are removed within a `finally:` block immediately after inference finishes, preventing disk leaks.
4. **Audit Hash Preservation**: The existing Phase 2 SHA-256 cryptographic image hashing is executed on the temporary file and included in the output `visual_analysis.image_sha256`.
5. **Corrupted File Safe Degradation**: If an image contains corrupted headers or invalid dimensions, Phase 2's `validate_image_input` catches it safely, returning `visual_analysis.available: false` with the failure reason in `disclaimer` without crashing the server.

---

## 7. Error Handling Matrix

| HTTP Status | Trigger Condition | Example Response |
| :--- | :--- | :--- |
| **400 Bad Request** | Both `text` and `image` are missing or empty; malformed JSON body. | `{"detail": "At least one clinical evidence stream ('text' clinical narrative or 'image' file) must be provided."}` |
| **415 Unsupported Media Type** | Uploaded file extension or MIME type is not JPEG, PNG, or WEBP. | `{"detail": "Unsupported image file extension '.pdf'. Supported extensions: ['.jpeg', '.jpg', '.png', '.webp']"}` |
| **422 Unprocessable Entity** | FastAPI / Pydantic validation failure (e.g. `affected_count: -1`). | Standard structured FastAPI field validation error. |
| **500 Internal Server Error** | Unexpected unhandled engine failure; logs stack trace server-side. | `{"detail": "Internal assessment failure: <ExceptionType> (<Message>)"}` |

---

## 8. Development CORS Configuration

Configured explicitly for local Next.js frontend development in `api/main.py`:
```python
DEVELOPMENT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEVELOPMENT_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
```
*Note: Unrestricted wildcards (`"*"`) are intentionally avoided.*

---

## 9. Test Results & Regression Verification

### 9.1 Summary Matrix
- **Existing Phase 2 Tests**: **24 / 24 PASSED** (Zero regressions)
- **New Phase 3A API Tests**: **12 / 12 PASSED**
- **Total Test Suite**: **36 / 36 PASSED** (100% green)

```
============================= test session starts ==============================
platform darwin -- Python 3.14.3, pytest-9.1.1, pluggy-1.6.0
rootdir: /Users/tanvimehta/Desktop/sih-ai
plugins: anyio-4.15.1
collected 36 items

tests/test_api.py::test_health_endpoint PASSED                           [  2%]
tests/test_api.py::test_openapi_and_docs_endpoints PASSED                [  5%]
tests/test_api.py::test_assess_text_only_json PASSED                     [  8%]
tests/test_api.py::test_assess_text_only_multipart PASSED                [ 11%]
tests/test_api.py::test_assess_image_and_text PASSED                     [ 13%]
tests/test_api.py::test_assess_fmd_clinical_case PASSED                  [ 16%]
tests/test_api.py::test_assess_anthrax_critical_safety_fixture PASSED    [ 19%]
tests/test_api.py::test_assess_multi_animal_cluster_signal PASSED        [ 22%]
tests/test_api.py::test_assess_invalid_image_unsupported_type PASSED     [ 25%]
tests/test_api.py::test_assess_corrupted_image_safe_degradation PASSED   [ 27%]
tests/test_api.py::test_assess_missing_all_inputs_error PASSED           [ 30%]
tests/test_api.py::test_assess_minimal_clinical_input PASSED             [ 33%]
tests/test_engine.py::test_case_1_healthy_cattle PASSED                  [ 36%]
tests/test_engine.py::test_case_2_lumpy_skin_case PASSED                 [ 38%]
tests/test_engine.py::test_case_3_fmd_clinical_case PASSED               [ 41%]
tests/test_engine.py::test_case_4_anthrax_critical_safety_fixture PASSED [ 44%]
tests/test_engine.py::test_case_5_multi_animal_cluster PASSED            [ 47%]
tests/test_engine.py::test_case_6_minimal_missing_data PASSED            [ 50%]
tests/test_engine.py::test_case_7_safe_degradation PASSED                [ 52%]
tests/test_loaders.py::test_nadres_pipeline PASSED                       [ 55%]
tests/test_loaders.py::test_india_gov_pipeline PASSED                    [ 58%]
tests/test_loaders.py::test_wahis_pipeline PASSED                        [ 61%]
tests/test_loaders.py::test_synthetic_checker PASSED                     [ 63%]
tests/test_nlp.py::test_extraction_explicit_counts PASSED                [ 66%]
tests/test_nlp.py::test_extraction_unquantified_no_fabrication PASSED    [ 69%]
tests/test_nlp.py::test_extraction_mortality PASSED                      [ 72%]
tests/test_nlp.py::test_extraction_vaccination_history PASSED            [ 75%]
tests/test_nlp.py::test_extraction_minimal_empty PASSED                  [ 77%]
tests/test_schema.py::test_animal_observation_valid PASSED               [ 80%]
tests/test_schema.py::test_animal_observation_invalid_count PASSED       [ 83%]
tests/test_schema.py::test_visual_evidence_bounds PASSED                 [ 86%]
tests/test_schema.py::test_sample_evidence_payload_serialization PASSED  [ 88%]
tests/test_veterinary.py::test_six_priority_diseases_present PASSED      [ 91%]
tests/test_veterinary.py::test_anthrax_critical_safety_warning PASSED    [ 94%]
tests/test_veterinary.py::test_lsd_and_fmd_profiles PASSED               [ 97%]
tests/test_vision.py::test_vision_inference_output_contract PASSED       [100%]

======================= 36 passed, 12 warnings in 10.99s =======================
```

---

## 10. Manual Live Server Verification

The server was executed live with Uvicorn (`uvicorn api.main:app --host 127.0.0.1 --port 8000`) and verified using real HTTP requests:

### Verification 1: Health Endpoint
```bash
$ curl -s -i http://127.0.0.1:8000/health
HTTP/1.1 200 OK
content-type: application/json

{"status":"ok","service":"jeevrakshak-ai-api","version":"1.0.0"}
```

### Verification 2: Live Multipart Assessment with Image File
```bash
$ curl -s -X POST http://127.0.0.1:8000/api/ai/assess \
    -F "text=Cow has nodular skin lesions and fever" \
    -F "image=@data/images/cow_lumpy_skin_clinical_nodules.jpg" \
    -F "state=Rajasthan" \
    -F "district=Bikaner"
```
**Live Result Verified:**
- `visual_analysis.available`: `true`
- `visual_analysis.predicted_class`: `healthy` (90.54% feature cue)
- `top_disease`: `Lumpy Skin Disease` (`support_level: moderate`)
- `overall_risk`: `moderate`

### Verification 3: Live Anthrax Emergency Safety Protocol Check
```bash
$ curl -s -X POST http://127.0.0.1:8000/api/ai/assess \
    -H "Content-Type: application/json" \
    -d '{"text": "[SYNTHETIC TEST FIXTURE] Cow collapsed and died suddenly this morning with dark unclotted blood oozing from nostrils and absence of rigor mortis.", "state": "Odisha", "district": "Cuttack"}'
```
**Live Result Verified:**
- `overall_risk`: `critical`
- `urgency`: `emergency`
- `immediate_actions`: Contains `"CRITICAL WARNING: DO NOT CUT, OPEN, OR PERFORM POST-MORTEM (NECROPSY) ON THE CARCASS UNDER ANY CIRCUMSTANCES."`

---

## 11. Command to Run the API Locally

To start the FastAPI development server:
```bash
PYTHONPATH=. .venv/bin/uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```
Then visit:
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Interactive Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 12. Known Limitations & Explicit Boundary Confirmation

1. **Standalone Scope**: The API runs as a standalone Python service. It does not contain authentication (JWT/OAuth), user management, or database storage.
2. **Next.js & Supabase Unmodified**: No frontend code or Supabase database migrations were altered or connected during this phase.
3. **No New ML Models**: The vision classifier remains the pretrained EfficientNet-B3 model running on local CPU. No fine-tuning or secondary model was introduced.
