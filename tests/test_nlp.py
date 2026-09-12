"""
tests/test_nlp.py
Unit tests for bounded clinical observation extractor.
Verifies count parsing, duration extraction, symptom mapping, and zero fabrication.
"""

import pytest
from src.nlp.extractor import extract_observations


def test_extraction_explicit_counts():
    text = "My two cows have high fever and skin lumps on their neck for three days."
    res = extract_observations(text)
    assert res.animal_context.species == "cattle"
    assert res.animal_context.affected_count == 2
    assert res.animal_context.duration_days == 3.0
    assert "fever" in res.observations.symptoms
    assert "skin_nodules" in res.observations.symptoms
    assert "neck" in res.observations.anatomical_locations


def test_extraction_unquantified_no_fabrication():
    # 'some cows' should yield affected_count = None (NEVER fabricate a count)
    text = "Some cows in my shed have blisters in mouth and drooling saliva."
    res = extract_observations(text)
    assert res.animal_context.affected_count is None
    assert "oral_vesicles" in res.observations.symptoms
    assert "excessive_salivation" in res.observations.symptoms


def test_extraction_mortality():
    text = "One cow died suddenly with dark blood from nostrils."
    res = extract_observations(text)
    assert res.animal_context.mortality_count == 1
    assert "sudden_death" in res.observations.symptoms
    assert "unclotted_orifice_bleeding" in res.observations.symptoms


def test_extraction_vaccination_history():
    text = "Cattle not vaccinated against FMD presenting lameness."
    res = extract_observations(text)
    assert res.animal_context.vaccination_status == "unvaccinated"
    assert "lameness" in res.observations.symptoms

    text_unknown = "Cow has fever."
    res_unknown = extract_observations(text_unknown)
    assert res_unknown.animal_context.vaccination_status == "unknown"


def test_extraction_minimal_empty():
    res = extract_observations("")
    assert res.observations.symptoms == []
    assert res.animal_context.affected_count is None
    assert res.animal_context.duration_days is None
