"""
tests/test_schema.py
Unit tests for Pydantic common evidence schemas.
"""

import pytest
from pydantic import ValidationError
from src.common.schema import (
    AnimalObservation,
    VisualEvidence,
    EpidemiologicalContext,
    UnifiedEvidencePayload,
    create_sample_evidence_payload
)


def test_animal_observation_valid():
    obs = AnimalObservation(
        species="cattle",
        affected_animal_count=3,
        total_herd_size=20,
        symptoms=["FEVER", " Skin_Nodules ", ""],
        duration_days=4.0
    )
    assert obs.species == "cattle"
    assert obs.affected_animal_count == 3
    # Symptom validator cleans and lowercases
    assert obs.symptoms == ["fever", "skin_nodules"]


def test_animal_observation_invalid_count():
    with pytest.raises(ValidationError):
        # affected_animal_count must be >= 1
        AnimalObservation(
            species="cattle",
            affected_animal_count=0
        )


def test_visual_evidence_bounds():
    vis = VisualEvidence(
        model_name="test_model",
        predicted_class="healthy",
        confidence=0.95,
        class_probabilities={"foot-and-mouth": 0.02, "healthy": 0.95, "lumpy": 0.03}
    )
    assert vis.confidence == 0.95
    assert vis.evidence_nature == "VISUAL_EVIDENCE_ONLY"

    # Confidence cannot exceed 1.0
    with pytest.raises(ValidationError):
        VisualEvidence(
            model_name="test_model",
            predicted_class="healthy",
            confidence=1.5
        )


def test_sample_evidence_payload_serialization():
    payload = create_sample_evidence_payload()
    json_str = payload.model_dump_json()
    assert "case_id" in json_str
    assert "animal_observation" in json_str
    assert "visual_evidence" in json_str
    assert "epidemiological_context" in json_str
