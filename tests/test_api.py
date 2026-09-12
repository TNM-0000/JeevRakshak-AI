"""
tests/test_api.py
Integration and unit test suite for the JeevRakshak AI FastAPI layer (Phase 3A).
Validates HTTP endpoints, input formats, image uploads, Anthrax safety preservation,
cluster signals, error handling, and canonical JSON output contracts.
"""

import os
import pytest
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)

REFERENCE_HEALTHY_IMG = "data/images/cow_healthy_reference.jpg"
REFERENCE_LSD_IMG = "data/images/cow_lumpy_skin_clinical_nodules.jpg"


def test_health_endpoint():
    """Verify GET /health returns 200 with service info without running models."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "jeevrakshak-ai-api"
    assert "version" in data


def test_openapi_and_docs_endpoints():
    """Verify Swagger UI and OpenAPI schema endpoints are accessible."""
    docs_resp = client.get("/docs")
    assert docs_resp.status_code == 200

    openapi_resp = client.get("/openapi.json")
    assert openapi_resp.status_code == 200
    schema = openapi_resp.json()
    assert "/health" in schema["paths"]
    assert "/api/ai/assess" in schema["paths"]


def test_assess_text_only_json():
    """Verify POST /api/ai/assess works via JSON with canonical output."""
    payload = {
        "text": "Cow has developed high fever and has stopped eating.",
        "state": "Karnataka",
        "district": "Bengaluru Rural"
    }
    response = client.post("/api/ai/assess", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify canonical contract fields
    assert "assessment_id" in data
    assert "created_at" in data
    assert "input_summary" in data
    assert "animal_context" in data
    assert "observations" in data
    assert "visual_analysis" in data
    assert "possible_conditions" in data
    assert "risk_assessment" in data
    assert "recommended_actions" in data
    assert "escalation" in data
    assert "data_gaps" in data
    assert "sources" in data
    assert "disclaimer" in data

    # No image provided
    assert data["visual_analysis"]["available"] is False
    assert data["input_summary"]["image_provided"] is False
    assert "fever" in data["observations"]["symptoms"]


def test_assess_text_only_multipart():
    """Verify POST /api/ai/assess works via multipart/form-data without image."""
    response = client.post(
        "/api/ai/assess",
        data={
            "text": "Cow has high fever and stopped eating.",
            "state": "Rajasthan",
            "district": "Bikaner"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["visual_analysis"]["available"] is False
    assert data["input_summary"]["state"] == "Rajasthan"


def test_assess_image_and_text():
    """Verify POST /api/ai/assess with image upload and text narrative."""
    assert os.path.exists(REFERENCE_HEALTHY_IMG), f"Missing {REFERENCE_HEALTHY_IMG}"

    with open(REFERENCE_HEALTHY_IMG, "rb") as img_file:
        response = client.post(
            "/api/ai/assess",
            data={
                "text": "Cattle is grazing normally, active and alert, clear eyes and normal appetite.",
                "state": "Karnataka",
                "district": "Bengaluru Rural"
            },
            files={"image": ("cow_healthy.jpg", img_file, "image/jpeg")}
        )

    assert response.status_code == 200
    data = response.json()

    # Visual analysis must be executed
    vis = data["visual_analysis"]
    assert vis["available"] is True
    assert vis["predicted_class"] == "healthy"
    assert vis["confidence"] >= 0.90
    assert vis["evidence_nature"] == "VISUAL_EVIDENCE_ONLY"
    assert vis["image_sha256"] is not None
    assert "not constitute a confirmed veterinary diagnosis" in vis["disclaimer"].lower()

    # Risk should be low for healthy animal
    assert data["risk_assessment"]["overall_risk"] == "low"
    assert data["escalation"]["required"] is False


def test_assess_fmd_clinical_case():
    """Verify POST /api/ai/assess correctly identifies FMD and returns appropriate triage."""
    payload = {
        "text": "Cow has high fever, painful blisters on tongue and hooves, severe drooling and lameness.",
        "state": "Gujarat",
        "district": "Anand"
    }
    response = client.post("/api/ai/assess", json=payload)
    assert response.status_code == 200
    data = response.json()

    top_condition = data["possible_conditions"][0]
    assert "Foot-and-Mouth" in top_condition["disease"]
    assert top_condition["support_level"] == "high"

    # Verify containment precautions include washing soda / footbath
    containment = " ".join(data["recommended_actions"]["containment_precautions"])
    assert "foot-bath" in containment.lower() or "washing soda" in containment.lower() or "sodium carbonate" in containment.lower()


def test_assess_anthrax_critical_safety_fixture():
    """
    STRICT SAFETY TEST:
    Verify that an Anthrax emergency fixture triggers the non-bypassable
    prohibition of post-mortem (necropsy) and emergency escalation.
    """
    payload = {
        "text": "[SYNTHETIC TEST FIXTURE] Cow collapsed and died suddenly this morning with dark unclotted blood oozing from nostrils and absence of rigor mortis.",
        "state": "Odisha",
        "district": "Cuttack"
    }
    response = client.post("/api/ai/assess", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Must be critical risk and emergency escalation
    assert data["risk_assessment"]["overall_risk"] == "critical"
    assert data["escalation"]["required"] is True
    assert data["escalation"]["urgency"] == "emergency"

    # Top differential must be Anthrax
    top_diff = data["possible_conditions"][0]
    assert "Anthrax" in top_diff["disease"]

    # Strict Safety Rule: Post-mortem necropsy MUST be explicitly prohibited
    immediate_actions = " ".join(data["recommended_actions"]["immediate_actions"]).upper()
    assert "DO NOT CUT, OPEN, OR PERFORM POST-MORTEM" in immediate_actions
    assert "DEEP BURIAL" in " ".join(data["recommended_actions"]["containment_precautions"]).upper()


def test_assess_multi_animal_cluster_signal():
    """
    Verify multiple animals trigger 'possible_cluster_signal'
    or 'suspected_local_cluster_requiring_veterinary_investigation',
    and NEVER declare a 'confirmed outbreak'.
    """
    payload = {
        "text": "Four cows in our dairy unit have high fever, painful blisters on mouth and feet, and copious stringy drooling.",
        "state": "Gujarat",
        "district": "Anand"
    }
    response = client.post("/api/ai/assess", json=payload)
    assert response.status_code == 200
    data = response.json()

    cluster_signal = data["risk_assessment"]["cluster_signal"]
    assert cluster_signal in [
        "possible_cluster_signal",
        "suspected_local_cluster_requiring_veterinary_investigation"
    ]
    # Outbreak must NOT be confirmed
    assert "confirmed outbreak" not in cluster_signal.lower()


def test_assess_invalid_image_unsupported_type():
    """Verify uploading an unsupported file type returns 415 Unsupported Media Type."""
    fake_pdf = b"%PDF-1.4 fake document content"
    response = client.post(
        "/api/ai/assess",
        data={"text": "Cow is sick"},
        files={"image": ("document.pdf", fake_pdf, "application/pdf")}
    )
    assert response.status_code == 415
    assert "Unsupported image" in response.json()["detail"]


def test_assess_corrupted_image_safe_degradation():
    """Verify that uploading a corrupted image file degrades safely without crashing."""
    corrupted_bytes = b"not a real jpeg image header at all"
    response = client.post(
        "/api/ai/assess",
        data={"text": "Cow has fever and skin nodules", "state": "Rajasthan"},
        files={"image": ("corrupted.jpg", corrupted_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    # Vision analysis records validation failure safely
    assert data["visual_analysis"]["available"] is False
    assert "Image validation failed" in data["visual_analysis"]["disclaimer"]


def test_assess_missing_all_inputs_error():
    """Verify submitting neither text narrative nor image returns 400 Bad Request."""
    response = client.post("/api/ai/assess", data={})
    assert response.status_code == 400
    assert "clinical evidence stream" in response.json()["detail"].lower()


def test_assess_minimal_clinical_input():
    """Verify minimal input ('cow sick') returns safe assessment with data gaps and zero hallucinations."""
    response = client.post("/api/ai/assess", json={"text": "cow sick"})
    assert response.status_code == 200
    data = response.json()
    assert data["possible_conditions"] == []
    assert len(data["data_gaps"]) > 0
    assert data["risk_assessment"]["overall_risk"] == "low"
