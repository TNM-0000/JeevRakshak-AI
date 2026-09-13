"""
src/risk/engine.py
Risk Assessment Engine for JeevRakshak AI.
Evaluates clinical evidence, affected herd count, mortality, transboundary alerts,
and zoonotic threats into explainable risk levels: 'low' | 'moderate' | 'high' | 'critical'.
Implements strict Anthrax safety handling and cluster signal classification.
"""

from typing import List, Optional
from src.common.schema import (
    AnimalContext,
    ExtractedObservations,
    VisualAnalysis,
    ConditionDifferential,
    RiskAssessment
)


class RiskAssessmentEngine:
    """
    Deterministic clinical risk assessment engine.
    """
    def __init__(self):
        pass

    def evaluate_risk(
        self,
        animal_context: AnimalContext,
        observations: ExtractedObservations,
        visual_analysis: VisualAnalysis,
        differentials: List[ConditionDifferential],
        state: Optional[str] = None
    ) -> RiskAssessment:
        risk_factors: List[str] = []
        uncertainties: List[str] = []
        overall_risk: str = "low"

        symptoms = set(observations.symptoms)
        affected_count = animal_context.affected_count or 1
        mortality_count = animal_context.mortality_count

        # 1. Cluster Signal Classification (Section 15)
        # Never report 'confirmed_outbreak'
        if affected_count >= 3:
            cluster_signal = "suspected_local_cluster_requiring_veterinary_investigation"
            risk_factors.append(f"Multiple animals affected ({affected_count} head); indicates contagious herd-level dissemination.")
        elif affected_count == 2:
            cluster_signal = "possible_cluster_signal"
            risk_factors.append("Dual animal presentation; possible emerging local cluster signal.")
        else:
            cluster_signal = "individual_case_concern"

        # 2. Critical Safety Rule: Anthrax Detection (Section 14)
        anthrax_hallmarks = {"sudden_death", "unclotted_orifice_bleeding", "absence_of_rigor_mortis"}
        matched_anthrax = anthrax_hallmarks.intersection(symptoms)
        if matched_anthrax:
            overall_risk = "critical"
            risk_factors.append(
                f"HIGH-CONSEQUENCE ZOONOTIC THREAT: Clinical signs consistent with peracute Anthrax ({', '.join(matched_anthrax)})."
            )

        # 3. Mortality Assessment
        if mortality_count > 0:
            if overall_risk != "critical":
                overall_risk = "high"
            risk_factors.append(f"Mortality recorded ({mortality_count} animal deceased); high case severity index.")

        # 4. Top Disease Severity Evaluation
        top_diff = differentials[0] if differentials else None
        if top_diff:
            if "Healthy" in top_diff.disease or "Equine" in top_diff.disease:
                if overall_risk not in ["critical", "high"]:
                    overall_risk = "low"
                    if "Equine" in top_diff.disease:
                        risk_factors.append("Visual screening and clinical intake indicate stable equine health baseline with mild non-contagious skin irritation.")
                    else:
                        risk_factors.append("Visual evidence and clinical observations indicate normal health baseline.")
            elif top_diff.support_level == "high":
                if overall_risk != "critical":
                    overall_risk = "high"
                risk_factors.append(f"Strong evidence support for notifiable disease profile: '{top_diff.disease}'.")
                if "Lumpy Skin Disease" in top_diff.disease:
                    risk_factors.append("High-consequence viral infection: Rapid mechanical vector transmission potential requiring immediate veterinary escalation.")
            elif top_diff.support_level == "moderate":
                if overall_risk == "low":
                    overall_risk = "moderate"
                risk_factors.append(f"Moderate evidence support for '{top_diff.disease}'.")

        # 5. Check Active Epidemiological Forewarnings
        if top_diff:
            for ev in top_diff.supporting_evidence:
                if "NADRES forewarning alert" in ev:
                    risk_factors.append("Active regional ICAR-NIVEDI forewarning alert reinforces outbreak risk.")
                    if overall_risk == "low" and not ("Healthy" in top_diff.disease):
                        overall_risk = "moderate"

        # 6. Uncertainties and Data Gaps Documentation
        if animal_context.vaccination_status == "unknown":
            uncertainties.append("Vaccination history is unrecorded; immunological herd coverage cannot be verified.")
        if animal_context.affected_count is None:
            uncertainties.append("Affected animal count was unquantified; exact herd exposure scale is indeterminate.")
        if not visual_analysis.available:
            uncertainties.append("No photographic evidence provided; relying entirely on verbal/textual symptoms.")
        elif visual_analysis.confidence and visual_analysis.confidence < 0.70:
            uncertainties.append(f"Vision model confidence is modest ({round(visual_analysis.confidence*100, 1)}%); visual ambiguity present.")

        uncertainties.append("Definitive medical confirmation requires clinical palpation and laboratory confirmation (ELISA/PCR).")

        return RiskAssessment(
            overall_risk=overall_risk,
            risk_factors=risk_factors,
            uncertainties=uncertainties,
            cluster_signal=cluster_signal
        )


def assess_risk(
    animal_context: AnimalContext,
    observations: ExtractedObservations,
    visual_analysis: VisualAnalysis,
    differentials: List[ConditionDifferential],
    state: Optional[str] = None
) -> RiskAssessment:
    engine = RiskAssessmentEngine()
    return engine.evaluate_risk(animal_context, observations, visual_analysis, differentials, state)
