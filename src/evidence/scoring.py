"""
src/evidence/scoring.py
Deterministic Evidence Scoring and Differential Matching Engine for JeevRakshak AI.
Compares observed evidence (clinical symptoms, visual cues, NADRES forewarning, weather variables)
against authoritative disease profiles without arbitrary numerical probabilities or hallucinations.
"""

from typing import List, Dict, Any, Optional
from src.common.schema import (
    AnimalContext,
    ExtractedObservations,
    VisualAnalysis,
    ConditionDifferential,
    EnvironmentalContextData
)
from src.veterinary.models import DiseaseProfile
from src.veterinary.knowledge_base import list_all_disease_profiles
from src.epidemiology.nadres_adapter import query_nadres, NADRESResponse


class DeterministicEvidenceScorer:
    """
    Transparent, auditable evidence scoring engine.
    Matches observations against disease profiles and categorizes into:
    support_level: 'low' | 'moderate' | 'high'
    """
    def __init__(self):
        self.disease_profiles = list_all_disease_profiles()

    def evaluate(
        self,
        animal_context: AnimalContext,
        observations: ExtractedObservations,
        visual_analysis: VisualAnalysis,
        weather_context: Optional[EnvironmentalContextData] = None,
        state: Optional[str] = None,
        district: Optional[str] = None
    ) -> List[ConditionDifferential]:
        """
        Evaluates observations across all priority disease profiles and returns
        ordered list of plausible ConditionDifferential candidates.
        """
        symptoms_observed = set(observations.symptoms)
        locations_observed = set(observations.anatomical_locations)
        host_species = animal_context.species.lower()

        differentials: List[ConditionDifferential] = []

        # Special check: If no symptoms observed and vision is decisively healthy
        if not symptoms_observed and visual_analysis.available and visual_analysis.predicted_class == "healthy" and (visual_analysis.confidence or 0.0) >= 0.85:
            differentials.append(
                ConditionDifferential(
                    disease="Clinically Normal / Healthy (No Significant Disease Evidence)",
                    pathogen="None (Normal physiological baseline)",
                    support_level="high",
                    supporting_evidence=[
                        f"Vision classifier identified normal bovine features with {round((visual_analysis.confidence or 0.0)*100, 1)}% confidence.",
                        "Zero abnormal clinical symptoms reported in input narrative.",
                        "Normal appetite and activity indicated."
                    ],
                    contradicting_or_missing_evidence=[
                        "No clinical lesions or pathological signs detected."
                    ],
                    sources=["ICAR-IVRI Clinical Examination Guidelines for Ruminants"]
                )
            )
            return differentials

        for profile in self.disease_profiles:
            # 1. Species compatibility check
            if host_species != "unknown" and host_species not in [s.lower() for s in profile.susceptible_species]:
                continue  # Host species not susceptible

            supporting_evidence: List[str] = []
            missing_evidence: List[str] = []
            score_points = 0  # Explainable tracking

            # 2. Hallmark symptoms matching (Major weight: +3 each)
            matched_hallmarks = [s for s in profile.hallmark_symptoms if s in symptoms_observed]
            unmatched_hallmarks = [s for s in profile.hallmark_symptoms if s not in symptoms_observed]

            for h in matched_hallmarks:
                score_points += 3
                supporting_evidence.append(f"Hallmark pathognomonic sign observed: '{h.replace('_', ' ')}'.")

            # 3. Secondary symptoms matching (Supporting weight: +1 each)
            matched_secondary = [s for s in profile.secondary_symptoms if s in symptoms_observed]
            for s in matched_secondary:
                score_points += 1
                supporting_evidence.append(f"Secondary clinical sign observed: '{s.replace('_', ' ')}'.")

            # 4. Anatomical site matching (+1)
            matched_sites = [loc for loc in profile.anatomical_clues if loc in locations_observed]
            if matched_sites:
                score_points += 1
                supporting_evidence.append(f"Anatomical lesion location matches profile: {', '.join(matched_sites)}.")

            # 5. Visual Model Support
            if visual_analysis.available and visual_analysis.predicted_class:
                vis_class = visual_analysis.predicted_class
                vis_conf = visual_analysis.confidence or 0.0

                if profile.disease_id == "lumpy_skin_disease":
                    if vis_class == "lumpy":
                        score_points += 3 if vis_conf >= 0.70 else 2
                        supporting_evidence.append(
                            f"Vision classifier detected nodular cutaneous lesions compatible with LSD ({round(vis_conf*100, 1)}% confidence)."
                        )
                    elif vis_class == "foot-and-mouth" and vis_conf >= 0.70:
                        missing_evidence.append("Vision model classified image as Foot-and-Mouth Disease rather than LSD.")
                elif profile.disease_id == "foot_and_mouth_disease":
                    if vis_class == "foot-and-mouth":
                        score_points += 3 if vis_conf >= 0.70 else 2
                        supporting_evidence.append(
                            f"Vision classifier detected oral/podal lesions compatible with FMD ({round(vis_conf*100, 1)}% confidence)."
                        )
                    elif vis_class == "lumpy" and vis_conf >= 0.70:
                        missing_evidence.append("Vision model classified image as Lumpy Skin Disease rather than FMD.")
                else:
                    # Systemic / internal bacterial diseases cannot be diagnosed by external skin classifier
                    if vis_class in ["lumpy", "foot-and-mouth"] and vis_conf >= 0.85:
                        missing_evidence.append(
                            f"Vision model indicates superficial {vis_class.replace('-', ' ')} lesions, which are not characteristic of {profile.name}."
                        )

            # 6. NADRES Epidemiological Forewarning Support
            if state:
                nadres_resp: NADRESResponse = query_nadres(state=state, district=district, disease_id=profile.disease_id)
                if nadres_resp.available and nadres_resp.risk_level in ["high", "moderate"]:
                    score_points += 2 if nadres_resp.risk_level == "high" else 1
                    supporting_evidence.append(
                        f"Official ICAR-NIVEDI NADRES forewarning alert: '{nadres_resp.risk_level.upper()}' risk active in {nadres_resp.geography} for {nadres_resp.forecast_period}."
                    )
                elif nadres_resp.available and nadres_resp.risk_level == "no_alert":
                    missing_evidence.append(f"No active ICAR-NIVEDI NADRES forewarning alert in {state} for this disease.")

            # 7. Environmental / Weather Support
            if weather_context and weather_context.weather_available:
                rh = weather_context.relative_humidity_2m_pct
                temp = weather_context.temperature_2m_c
                precip = weather_context.precipitation_mm

                if profile.disease_id == "lumpy_skin_disease" and temp and 22 <= temp <= 36 and rh and rh >= 65:
                    score_points += 1
                    supporting_evidence.append(
                        f"Environmental conditions (Temp: {temp}°C, RH: {rh}%) favor biting fly (Stomoxys/mosquito) vector proliferation."
                    )
                elif profile.disease_id == "haemorrhagic_septicaemia" and rh and rh >= 80:
                    score_points += 1
                    supporting_evidence.append(
                        f"Elevated ambient relative humidity ({rh}%) is a documented precipitating factor for acute Pasteurella septicemia."
                    )
                elif profile.disease_id == "anthrax" and precip and precip > 10:
                    supporting_evidence.append(
                        f"Recent precipitation ({precip} mm) can disturb soil layers in historical anthrax burial grounds."
                    )

            # Record missing hallmark signs for transparency
            for um in unmatched_hallmarks:
                missing_evidence.append(f"Key hallmark sign '{um.replace('_', ' ')}' was not described or observed.")

            # Determine qualitative support level
            # HIGH: At least one hallmark + (additional hallmark OR vision support OR NADRES high alert)
            # OR score_points >= 5 with at least 1 hallmark
            if matched_hallmarks and (len(matched_hallmarks) >= 2 or score_points >= 5):
                support_level = "high"
            elif matched_hallmarks or score_points >= 3:
                support_level = "moderate"
            elif score_points >= 1:
                support_level = "low"
            else:
                continue  # No evidence support at all

            differentials.append(
                ConditionDifferential(
                    disease=profile.name,
                    pathogen=profile.pathogen,
                    support_level=support_level,
                    supporting_evidence=supporting_evidence,
                    contradicting_or_missing_evidence=missing_evidence,
                    sources=profile.official_sources
                )
            )

        # Sort differentials: 'high' first, then 'moderate', then 'low'
        order = {"high": 0, "moderate": 1, "low": 2}
        differentials.sort(key=lambda d: order.get(d.support_level, 3))

        return differentials


def score_evidence(
    animal_context: AnimalContext,
    observations: ExtractedObservations,
    visual_analysis: VisualAnalysis,
    weather_context: Optional[EnvironmentalContextData] = None,
    state: Optional[str] = None,
    district: Optional[str] = None
) -> List[ConditionDifferential]:
    scorer = DeterministicEvidenceScorer()
    return scorer.evaluate(animal_context, observations, visual_analysis, weather_context, state, district)
