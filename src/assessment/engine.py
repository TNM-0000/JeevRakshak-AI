"""
src/assessment/engine.py
Central Orchestrator Engine for JeevRakshak AI.
Unifies NLP observation extraction, vision evidence, NADRES forewarning context,
Open-Meteo weather variables, deterministic differential scoring, risk analysis,
and triage action escalation into the canonical JeevRakshakAssessment contract.
"""

from typing import Optional, List, Dict, Any
from src.common.schema import (
    InputSummary,
    AnimalContext,
    ExtractedObservations,
    VisualAnalysis,
    EpidemiologicalContextData,
    EnvironmentalContextData,
    JeevRakshakAssessment
)
from src.nlp.extractor import extract_observations
from src.vision.inference import predict_cattle_image
from src.weather.adapter import get_weather_context
from src.epidemiology.nadres_adapter import query_nadres
from src.evidence.scoring import score_evidence
from src.risk.engine import assess_risk
from src.actions.engine import generate_recommended_actions


class JeevRakshakEngine:
    """
    Main entry point for standalone AI/ML assessment in JeevRakshak AI.
    """
    def __init__(self):
        pass

    def run_assessment(
        self,
        text: str,
        image_path: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        species_override: Optional[str] = None,
        affected_count_override: Optional[int] = None
    ) -> JeevRakshakAssessment:
        """
        Executes end-to-end evidence fusion and produces canonical JeevRakshakAssessment.
        """
        # 1. Input Summary
        input_summary = InputSummary(
            original_text=text or "",
            image_provided=bool(image_path),
            image_path=image_path,
            location_provided=bool(state or district),
            state=state,
            district=district
        )

        # 2. NLP Observation Extraction
        extraction = extract_observations(text, species_override)
        animal_context: AnimalContext = extraction.animal_context
        observations: ExtractedObservations = extraction.observations

        # Override affected count if user explicitly specified via CLI/parameter
        if affected_count_override is not None:
            animal_context.affected_count = affected_count_override

        # 3. Vision Model Analysis
        visual_analysis: VisualAnalysis = predict_cattle_image(image_path, species=animal_context.species)

        # 4. Environmental Weather Context (Open-Meteo)
        weather_context: EnvironmentalContextData = get_weather_context(state, district)

        # 5. Epidemiological Forewarning Context (NADRES & WAHIS)
        nadres_summary: Dict[str, Any] = {}
        if state:
            nadres_resp = query_nadres(state, district)
            nadres_summary = nadres_resp.model_dump()
        else:
            nadres_summary = {
                "source": "NADRES",
                "available": False,
                "reason": "State not specified; regional forewarning query skipped"
            }

        wahis_summary = {
            "source": "WOAH WAHIS Reference Registry",
            "available": True,
            "monitored_transboundary_diseases": ["Lumpy Skin Disease", "Foot-and-Mouth Disease", "Anthrax", "PPR", "ASF"],
            "statutory_reporting": "Mandatory international disease alert system"
        }

        epi_context = EpidemiologicalContextData(
            nadres=nadres_summary,
            wahis=wahis_summary
        )

        # 6. Deterministic Evidence Scoring
        differentials = score_evidence(
            animal_context=animal_context,
            observations=observations,
            visual_analysis=visual_analysis,
            weather_context=weather_context,
            state=state,
            district=district
        )

        # 7. Risk Assessment Engine
        risk = assess_risk(
            animal_context=animal_context,
            observations=observations,
            visual_analysis=visual_analysis,
            differentials=differentials,
            state=state
        )

        # 8. Action & Escalation Engine
        actions, escalation = generate_recommended_actions(
            animal_context=animal_context,
            observations=observations,
            differentials=differentials,
            risk_assessment=risk
        )

        # 9. Audit Data Gaps
        data_gaps: List[str] = []
        if not image_path:
            data_gaps.append("No visual image was provided for morphological feature verification.")
        if not state:
            data_gaps.append("State location was omitted; regional NADRES epidemiological forewarning could not be cross-referenced.")
        if animal_context.duration_days is None:
            data_gaps.append("Symptom onset duration is unspecified; acute vs subacute disease staging cannot be established.")
        if animal_context.vaccination_status == "unknown":
            data_gaps.append("Vaccination history is unknown; past immunization cannot be verified.")
        if not observations.symptoms and not visual_analysis.available:
            data_gaps.append("Minimal clinical data: zero clinical symptoms and zero image features provided.")

        # 10. Compile Traceable Sources
        sources_set = {
            "ICAR-NIVEDI National Animal Disease Referral Expert System (NADRES v2)",
            "Department of Animal Husbandry and Dairying (DAHD), Ministry of Fisheries, Animal Husbandry & Dairying, GoI",
            "World Organisation for Animal Health (WOAH) Terrestrial Animal Health Standards",
            "Pretrained Model: xprotocol/EfficientNet-B3-Cattle-Disease (Hugging Face / Keras 3)",
            "Open-Meteo Weather Reanalysis API"
        }
        for d in differentials:
            for s in d.sources:
                sources_set.add(s)

        # 11. Assemble Canonical Assessment
        assessment = JeevRakshakAssessment(
            input_summary=input_summary,
            animal_context=animal_context,
            observations=observations,
            visual_analysis=visual_analysis,
            possible_conditions=differentials,
            epidemiological_context=epi_context,
            environmental_context=weather_context,
            risk_assessment=risk,
            recommended_actions=actions,
            escalation=escalation,
            data_gaps=data_gaps,
            sources=sorted(list(sources_set))
        )

        return assessment


def run_full_assessment(
    text: str,
    image_path: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    species_override: Optional[str] = None,
    affected_count_override: Optional[int] = None
) -> JeevRakshakAssessment:
    engine = JeevRakshakEngine()
    return engine.run_assessment(
        text=text,
        image_path=image_path,
        state=state,
        district=district,
        species_override=species_override,
        affected_count_override=affected_count_override
    )


if __name__ == "__main__":
    res = run_full_assessment(
        text="My two cows have high fever, stopped eating, and have round hard lumps on their neck for three days.",
        image_path="data/images/cow_lumpy_skin_clinical_nodules.jpg",
        state="Karnataka",
        district="Bengaluru Rural"
    )
    print("Full Canonical Assessment JSON:\n", res.model_dump_json(indent=2))
