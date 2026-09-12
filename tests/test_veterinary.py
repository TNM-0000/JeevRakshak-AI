"""
tests/test_veterinary.py
Unit tests for structured veterinary knowledge engine.
Verifies all 6 priority diseases and Anthrax critical biosafety warnings.
"""

import pytest
from src.veterinary.knowledge_base import get_disease_profile, list_all_disease_profiles


def test_six_priority_diseases_present():
    profiles = list_all_disease_profiles()
    assert len(profiles) == 6
    ids = {p.disease_id for p in profiles}
    expected = {
        "lumpy_skin_disease",
        "foot_and_mouth_disease",
        "anthrax",
        "haemorrhagic_septicaemia",
        "black_quarter",
        "brucellosis"
    }
    assert ids == expected


def test_anthrax_critical_safety_warning():
    anthrax = get_disease_profile("anthrax")
    assert anthrax is not None
    assert anthrax.zoonotic_risk is True
    assert anthrax.critical_safety_warning is not None
    # Must strictly forbid necropsy / opening carcass
    assert "strictly forbidden" in anthrax.critical_safety_warning.lower() or "do not open" in anthrax.critical_safety_warning.lower()


def test_lsd_and_fmd_profiles():
    lsd = get_disease_profile("lumpy_skin_disease")
    assert "skin_nodules" in lsd.hallmark_symptoms
    assert lsd.zoonotic_risk is False

    fmd = get_disease_profile("foot_and_mouth_disease")
    assert "oral_vesicles" in fmd.hallmark_symptoms
    assert "excessive_salivation" in fmd.hallmark_symptoms
