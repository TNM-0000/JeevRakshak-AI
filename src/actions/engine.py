"""
src/actions/engine.py
Action and Escalation Engine for JeevRakshak AI.
Translates clinical risk evaluations into structured biosecurity actions,
referral routing, containment precautions, and statutory escalation decisions.
Enforces strict Anthrax biosafety rules (PROHIBITS NECROPSY).
"""

from typing import List, Tuple
from src.common.schema import (
    AnimalContext,
    ExtractedObservations,
    ConditionDifferential,
    RiskAssessment,
    RecommendedActions,
    EscalationDecision
)
from src.veterinary.knowledge_base import get_disease_profile


class ActionEscalationEngine:
    """
    Deterministic triage and action escalation engine.
    """
    def __init__(self):
        pass

    def generate_actions(
        self,
        animal_context: AnimalContext,
        observations: ExtractedObservations,
        differentials: List[ConditionDifferential],
        risk_assessment: RiskAssessment
    ) -> Tuple[RecommendedActions, EscalationDecision]:
        symptoms = set(observations.symptoms)
        top_diff = differentials[0] if differentials else None
        top_disease_id = None
        if top_diff:
            # Match top disease ID
            for d_id, name in [
                ("anthrax", "Anthrax"),
                ("lumpy_skin_disease", "Lumpy Skin Disease"),
                ("foot_and_mouth_disease", "Foot-and-Mouth Disease"),
                ("haemorrhagic_septicaemia", "Haemorrhagic Septicaemia"),
                ("black_quarter", "Black Quarter"),
                ("brucellosis", "Brucellosis")
            ]:
                if name.lower() in top_diff.disease.lower():
                    top_disease_id = d_id
                    break

        immediate_actions: List[str] = []
        referral: List[str] = []
        containment: List[str] = []
        sampling: List[str] = []
        monitoring: List[str] = []
        escalation_reasons: List[str] = []

        # =========================================================================
        # SPECIAL SAFETY RULE: ANTHRAX HIGH-CONSEQUENCE PROTOCOL (Section 14)
        # =========================================================================
        anthrax_hallmarks = {"sudden_death", "unclotted_orifice_bleeding", "absence_of_rigor_mortis"}
        is_anthrax_suspect = (top_disease_id == "anthrax") or bool(anthrax_hallmarks.intersection(symptoms))

        if is_anthrax_suspect:
            immediate_actions.extend([
                "CRITICAL WARNING: DO NOT CUT, OPEN, OR PERFORM POST-MORTEM (NECROPSY) ON THE CARCASS UNDER ANY CIRCUMSTANCES.",
                "Cover the carcass immediately with tarpaulin or thorn bushes to prevent access by scavenging birds, dogs, and wildlife.",
                "Seal all natural body orifices (mouth, nostrils, rectum) with cotton plugs soaked in 5% formalin or 3% cresol solution.",
                "Bar all human entry to the immediate mortality zone without personal protective equipment (PPE)."
            ])
            referral.extend([
                "EMERGENCY REFERRAL: Contact the District Veterinary Officer (DVO) and nearest Veterinary Assistant Surgeon immediately.",
                "Notify the local Public Health Medical Officer regarding potential human zoonotic exposure.",
                "Do not attempt home remedies or non-certified veterinary interventions."
            ])
            containment.extend([
                "Immediate premise lockdown; prohibit all animal movement in and out of the farm.",
                "Prepare for on-site deep burial (>6 feet deep) of carcass enclosed with quicklime (calcium oxide) or complete high-temperature incineration.",
                "Isolate all in-contact animals for emergency ring vaccination (Sterne strain vaccine) by certified veterinary staff."
            ])
            sampling.extend([
                "Only certified veterinary officers with full BSL/PPE protection may collect peripheral ear-vein blood smear for Polychrome Methylene Blue (M'Fadyean) staining."
            ])
            monitoring.extend([
                "Monitor entire herd twice daily for hyperthermia (body temp > 40°C) and sudden depression.",
                "Inspect grazing pastures for contaminated standing water or soil disturbance."
            ])
            escalation_decision = EscalationDecision(
                required=True,
                urgency="emergency",
                reason=[
                    "Suspected peracute Anthrax mortality or characteristic orifice hemorrhage.",
                    "High-consequence zoonotic public health threat.",
                    "Mandatory statutory notification required under national disease control guidelines."
                ]
            )
            return RecommendedActions(
                immediate_actions=immediate_actions,
                veterinary_referral=referral,
                containment_precautions=containment,
                sample_collection=sampling,
                monitoring=monitoring
            ), escalation_decision

        # =========================================================================
        # ROUTINE HEALTHY PROFILE
        # =========================================================================
        if top_diff and "Healthy" in top_diff.disease and risk_assessment.overall_risk == "low":
            immediate_actions.append("Maintain standard balanced dietary ration, fresh clean water access, and routine shed hygiene.")
            referral.append("No emergency veterinary intervention required. Continue routine scheduled vaccinations.")
            containment.append("Normal herd management. Keep vaccination passport (INAPH ear-tag) updated.")
            monitoring.append("Daily visual inspection for normal feed intake, rumination, and milk production.")
            escalation_decision = EscalationDecision(
                required=False,
                urgency="routine",
                reason=["Normal clinical baseline; no acute disease evidence detected."]
            )
            return RecommendedActions(
                immediate_actions=immediate_actions,
                veterinary_referral=referral,
                containment_precautions=containment,
                sample_collection=sampling,
                monitoring=monitoring
            ), escalation_decision

        # =========================================================================
        # GENERAL COMMUNICABLE DISEASE TRIAGE (FMD, LSD, HS, BQ, Brucellosis)
        # =========================================================================
        profile = get_disease_profile(top_disease_id) if top_disease_id else None

        # Immediate Actions
        immediate_actions.append("Isolate symptomatic animals into a separate, dry, well-ventilated quarantine shed immediately.")
        immediate_actions.append("Provide separate feed and water containers; do NOT share grazing pastures or equipment.")

        if profile and profile.disease_id == "lumpy_skin_disease":
            immediate_actions.append("Apply approved ectoparasiticides (deltamethrin or cypermethrin) across the shed to suppress vector flies and mosquitoes.")
            immediate_actions.append("Cleanse open skin ulcers with mild antiseptic wash (1% potassium permanganate or neem oil) to prevent myiasis.")
        elif profile and profile.disease_id == "foot_and_mouth_disease":
            immediate_actions.append("Install footbaths with 4% sodium carbonate (washing soda) or 0.2% citric acid at all barn entrances.")
            immediate_actions.append("Apply boro-glycerine paste gently to oral lesions; provide soft gruel/mash diet to ease eating.")
        elif profile and profile.disease_id == "brucellosis":
            immediate_actions.append("Handle all aborted fetuses and placental tissues exclusively with impermeable rubber gloves and protective mask.")

        # Veterinary Referral
        referral.append("Present case details to the nearest Gram Panchayat Veterinary Dispensary (Pashu Chikitsalaya).")
        referral.append("Request a field visit from the local Veterinary Assistant Surgeon (VAS) or Mobile Veterinary Unit (MVU).")

        # Containment Precautions
        if profile:
            containment.extend(profile.containment_protocol[:3])
        else:
            containment.append("Halt animal movement off-farm until certified veterinary clearance is granted.")
            containment.append("Disinfect pens thoroughly with 2% sodium hypochlorite or lime powder.")

        # Diagnostic Sample Advisory for Field Veterinarians
        if profile and profile.disease_id == "lumpy_skin_disease":
            sampling.append("Advise field veterinarian to collect nodular skin scabs and EDTA blood in viral transport medium for real-time PCR.")
        elif profile and profile.disease_id == "foot_and_mouth_disease":
            sampling.append("Advise field veterinarian to collect unruptured vesicle fluid or oral epithelium in 50% buffered glycerol (pH 7.4–7.6) for ELISA typing (O/A/Asia-1).")
        elif profile and profile.disease_id == "haemorrhagic_septicaemia":
            sampling.append("Advise field veterinarian to collect peripheral blood smears and heart blood/edema swabs before antibiotic administration.")
        elif profile and profile.disease_id == "brucellosis":
            sampling.append("Advise field veterinarian to collect serum samples for Rose Bengal Plate Test (RBPT) and milk for Milk Ring Test (MRT).")
        else:
            sampling.append("Veterinarian should collect diagnostic biological specimens prior to initiating antimicrobial therapy.")

        # Monitoring
        monitoring.append("Measure rectal temperature of all in-contact herd mates twice daily (morning and evening).")
        monitoring.append("Record daily milk yield, appetite levels, and inspect for new lesion emergence.")

        # Escalation Logic
        is_high_risk = risk_assessment.overall_risk in ["high", "critical"]
        is_cluster = (animal_context.affected_count or 1) >= 2 or risk_assessment.cluster_signal != "individual_case_concern"

        if is_high_risk or is_cluster:
            urgency = "urgent" if not is_anthrax_suspect else "emergency"
            escalation_reasons.append("High disease risk category with potentially transmissible or notifiable condition.")
            if is_cluster:
                escalation_reasons.append("Multiple animals exhibiting compatible clinical signs; potential cluster event requiring investigation.")
            escalation_decision = EscalationDecision(
                required=True,
                urgency=urgency,
                reason=escalation_reasons
            )
        else:
            escalation_decision = EscalationDecision(
                required=False,
                urgency="moderate",
                reason=["Single animal presenting mild or localized symptoms; local clinic referral adequate."]
            )

        return RecommendedActions(
            immediate_actions=immediate_actions,
            veterinary_referral=referral,
            containment_precautions=containment,
            sample_collection=sampling,
            monitoring=monitoring
        ), escalation_decision


def generate_recommended_actions(
    animal_context: AnimalContext,
    observations: ExtractedObservations,
    differentials: List[ConditionDifferential],
    risk_assessment: RiskAssessment
) -> Tuple[RecommendedActions, EscalationDecision]:
    engine = ActionEscalationEngine()
    return engine.generate_actions(animal_context, observations, differentials, risk_assessment)
