"""
src/veterinary/models.py
Data models for machine-readable veterinary disease profiles.
"""

from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field


class DiseaseProfile(BaseModel):
    """
    Canonical, machine-readable veterinary profile for a livestock disease.
    Strictly derived from authoritative ICAR, NIVEDI, DAHD, and WOAH standards.
    """
    disease_id: str = Field(..., description="Machine-readable disease identifier (e.g. 'lsd', 'fmd')")
    name: str = Field(..., description="Full canonical disease name")
    pathogen: str = Field(..., description="Etiological pathogen and viral/bacterial family")
    pathogen_type: Literal["viral", "bacterial", "parasitic", "other"] = Field(..., description="Pathogen category")
    susceptible_species: List[str] = Field(..., description="List of susceptible animal species")
    hallmark_symptoms: List[str] = Field(..., description="Pathognomonic or highly characteristic symptom tags")
    secondary_symptoms: List[str] = Field(..., description="Common non-specific supporting signs")
    anatomical_clues: List[str] = Field(default_factory=list, description="Target anatomical regions for lesions")
    environmental_predisposing_factors: List[str] = Field(default_factory=list, description="Climatic or vector risk triggers")
    transmission_routes: List[str] = Field(default_factory=list, description="Transmission vectors and mechanisms")
    zoonotic_risk: bool = Field(False, description="True if transmissible to humans")
    zoonotic_notes: Optional[str] = Field(None, description="Public health and human exposure precautions")
    critical_safety_warning: Optional[str] = Field(None, description="Crucial biosafety constraint (e.g. no necropsy)")
    case_fatality_profile: str = Field(..., description="Standard case fatality characteristics (e.g. low adult, high calf)")
    containment_protocol: List[str] = Field(default_factory=list, description="Standard biosecurity and isolation measures")
    statutory_program: Optional[str] = Field(None, description="Government control program (e.g. NADCP, LH&DCP)")
    official_sources: List[str] = Field(default_factory=list, description="Authoritative reference monographs and guidelines")
