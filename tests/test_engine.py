"""
tests/test_engine.py
End-to-End Integration Tests for JeevRakshak AI (Phase 2).
Covers all mandatory clinical test cases, Anthrax safety rule, cluster detection,
and safe degradation under missing/incomplete data.
"""

import pytest
from src.assessment.engine import run_full_assessment


def test_case_1_healthy_cattle():
    """
    Test 1 — Healthy cattle image:
    Verify vision model returns healthy-oriented result and system does NOT invent disease.
    """
    assessment = run_full_assessment(
        text="Cow is healthy and grazing normally with good appetite.",
        image_path="data/images/cow_healthy_reference.jpg",
        state="Karnataka"
    )
    assert assessment.visual_analysis.available is True
    assert assessment.visual_analysis.predicted_class == "healthy"
    assert assessment.risk_assessment.overall_risk == "low"
    assert assessment.escalation.required is False
    assert len(assessment.possible_conditions) >= 1
    assert "Healthy" in assessment.possible_conditions[0].disease


def test_case_2_lumpy_skin_case():
    """
    Test 2 — Lumpy Skin Disease clinical case:
    Verify LSD is supported with high evidence without claiming confirmation.
    """
    assessment = run_full_assessment(
        text="Two cows have high fever, stopped eating, and have round hard lumps on their neck for three days.",
        image_path="data/images/cow_lumpy_skin_clinical_nodules.jpg",
        state="Karnataka",
        district="Bengaluru Rural",
        affected_count_override=2
    )
    # LSD should be top differential
    top_diff = assessment.possible_conditions[0]
    assert top_diff.disease == "Lumpy Skin Disease"
    assert top_diff.support_level == "high"
    # Never claim confirmed medical diagnosis in disclaimer
    assert "not constitute a confirmed veterinary diagnosis" in assessment.disclaimer.lower()
    # Actions should advise vector control and quarantine
    action_texts = " ".join(assessment.recommended_actions.immediate_actions).lower()
    assert "isolate" in action_texts
    assert "ectoparasiticides" in action_texts or "deltamethrin" in action_texts


def test_case_3_fmd_clinical_case():
    """
    Test 3 — Foot-and-Mouth Disease clinical case:
    Verify FMD becomes a supported differential with salivation and footbath guidance.
    """
    assessment = run_full_assessment(
        text="Cattle presenting with severe blisters in mouth, stringy drooling saliva, and limping with foot sores for 4 days.",
        image_path="data/images/cow_fmd_clinical_lesion.jpg",
        state="Punjab",
        district="Ludhiana",
        affected_count_override=3
    )
    # FMD should be top differential
    top_diff = assessment.possible_conditions[0]
    assert top_diff.disease == "Foot-and-Mouth Disease"
    assert top_diff.support_level == "high"
    # Footbath and NADCP mention
    containment_text = " ".join(assessment.recommended_actions.immediate_actions).lower()
    assert "footbath" in containment_text or "sodium carbonate" in containment_text or "isolate" in containment_text


def test_case_4_anthrax_critical_safety_fixture():
    """
    Test 4 — High-Consequence Anthrax Scenario:
    SYNTHETIC TEST FIXTURE: Ruminant found dead with dark unclotted blood from nostrils and no rigor mortis.
    Verifies CRITICAL risk, emergency escalation, and STRICT PROHIBITION against post-mortem necropsy.
    """
    assessment = run_full_assessment(
        text="[SYNTHETIC TEST FIXTURE] Cow collapsed and died suddenly this morning with dark unclotted blood oozing from nostrils and absence of rigor mortis.",
        state="Odisha",
        district="Cuttack"
    )
    assert assessment.risk_assessment.overall_risk == "critical"
    assert assessment.escalation.required is True
    assert assessment.escalation.urgency == "emergency"

    # Strict Anthrax Safety Rule check: MUST prohibit post-mortem
    immediate_actions = " ".join(assessment.recommended_actions.immediate_actions).upper()
    assert "DO NOT CUT, OPEN, OR PERFORM POST-MORTEM" in immediate_actions
    assert "DEEP BURIAL" in " ".join(assessment.recommended_actions.containment_precautions).upper()


def test_case_5_multi_animal_cluster():
    """
    Test 5 — Multi-animal Cluster:
    Multiple animals in same locality showing compatible symptoms.
    Verify output produces 'possible_cluster_signal' or 'suspected_local_cluster_requiring_veterinary_investigation'
    rather than confirmed outbreak.
    """
    assessment = run_full_assessment(
        text="Five cattle in our village shed have fever, mouth blisters, and severe drooling.",
        state="Gujarat",
        district="Anand"
    )
    # Must report cluster signal
    cluster_status = assessment.risk_assessment.cluster_signal
    assert cluster_status in [
        "possible_cluster_signal",
        "suspected_local_cluster_requiring_veterinary_investigation"
    ]
    # Never report 'confirmed_outbreak'
    assert cluster_status != "confirmed_outbreak"
    assert assessment.escalation.required is True


def test_case_6_minimal_missing_data():
    """
    Test 6 — Missing Data:
    Provide minimal text without location or image.
    Verify system does not hallucinate, records data gaps, and still returns a valid assessment contract.
    """
    assessment = run_full_assessment(
        text="Cow seems unwell."
    )
    assert assessment.assessment_id is not None
    assert assessment.input_summary.image_provided is False
    assert assessment.input_summary.location_provided is False
    assert len(assessment.data_gaps) >= 2
    assert "No visual image was provided" in " ".join(assessment.data_gaps)
    # Does not crash, returns valid contract
    assert assessment.risk_assessment.overall_risk in ["low", "moderate"]


def test_case_7_safe_degradation():
    """
    Test 7 — Safe Degradation:
    Provide invalid image path and unsupported state.
    Verifies graceful error capture without pipeline crash.
    """
    assessment = run_full_assessment(
        text="Cow has fever.",
        image_path="corrupted_or_missing_path.jpg",
        state="NonExistentState"
    )
    assert assessment.visual_analysis.available is False
    assert "failed" in assessment.visual_analysis.disclaimer.lower()
    assert assessment.epidemiological_context.nadres.get("available") is False
    assert assessment.assessment_id is not None
