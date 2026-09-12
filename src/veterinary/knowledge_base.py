"""
src/veterinary/knowledge_base.py
Machine-readable Veterinary Knowledge Base for JeevRakshak AI.
Ground truth codified directly from reports/veterinary_sources.md (ICAR, NIVEDI, IVRI, DAHD, WOAH).
Covers the 6 priority diseases without hallucination or numerical fabrication.
"""

from typing import Dict, List, Optional
from src.veterinary.models import DiseaseProfile

DISEASE_PROFILES: Dict[str, DiseaseProfile] = {
    "lumpy_skin_disease": DiseaseProfile(
        disease_id="lumpy_skin_disease",
        name="Lumpy Skin Disease",
        pathogen="Lumpy Skin Disease Virus (LSDV), genus Capripoxvirus, family Poxviridae",
        pathogen_type="viral",
        susceptible_species=["cattle", "buffalo"],
        hallmark_symptoms=["skin_nodules", "enlarged_lymph_nodes", "limb_edema"],
        secondary_symptoms=["fever", "anorexia", "drop_in_milk_yield", "salivation"],
        anatomical_clues=["neck", "brisket", "udder", "perineum", "head", "legs"],
        environmental_predisposing_factors=[
            "Warm and humid post-monsoon conditions favoring biting fly (Stomoxys) and mosquito vector proliferation",
            "Ambient temperature 24°C–34°C with stagnant water bodies"
        ],
        transmission_routes=[
            "Mechanical vector transmission via biting flies (Stomoxys calcitrans), mosquitoes (Aedes, Culex), and hard ticks (Rhipicephalus)",
            "Direct contact with saliva, shared feeding troughs, or infected milk"
        ],
        zoonotic_risk=False,
        zoonotic_notes="Not known to infect humans. Human consumption of milk/meat from affected animals is restricted due to secondary contamination.",
        critical_safety_warning=None,
        case_fatality_profile="Low overall mortality (1%–5%), but morbidity ranges from 10% to 50%+ causing severe production losses and emaciation.",
        containment_protocol=[
            "Isolate affected cattle immediately in insect-proof sheds or under mosquito netting.",
            "Apply approved ectoparasiticides (deltamethrin or cypermethrin) across the shed and animals.",
            "Strictly restrict cattle movement within a 10 km radius of affected sheds.",
            "Disinfect premise with 2% sodium hypochlorite, 1% formalin, or 2% Virkon S."
        ],
        statutory_program="Government of India Emergency Vaccination Advisory (Lumpi-ProVacInd / Heterologous Goat Pox Vaccine Uttarkashi strain)",
        official_sources=[
            "ICAR-NIVEDI Forewarning Bulletin Vol 14 (09), 2026",
            "ICAR-NRCE & ICAR-IVRI Lumpi-ProVacInd Advisory",
            "DAHD Advisory on Lumpy Skin Disease Control, GoI",
            "WOAH Terrestrial Manual, Chapter 3.4.12"
        ]
    ),

    "foot_and_mouth_disease": DiseaseProfile(
        disease_id="foot_and_mouth_disease",
        name="Foot-and-Mouth Disease",
        pathogen="Foot-and-Mouth Disease Virus (FMDV), genus Aphthovirus, family Picornaviridae (Endemic Serotypes in India: O, A, Asia-1)",
        pathogen_type="viral",
        susceptible_species=["cattle", "buffalo", "sheep", "goat", "swine"],
        hallmark_symptoms=["oral_vesicles", "excessive_salivation", "hoof_lesions", "lameness"],
        secondary_symptoms=["fever", "anorexia", "drop_in_milk_yield"],
        anatomical_clues=["mouth", "tongue", "dental pad", "feet", "hooves", "interdigital cleft", "teats"],
        environmental_predisposing_factors=[
            "Cool, humid weather with gentle wind favoring long-distance aerosol viral plume survival",
            "High livestock density and cattle congregation at weekly village animal markets"
        ],
        transmission_routes=[
            "Highly contagious aerosol inhalation over long distances",
            "Direct contact with vesicle fluid, saliva, milk, urine, and dung",
            "Indirect mechanical transmission via footwear, vehicles, and feed"
        ],
        zoonotic_risk=False,
        zoonotic_notes="Extremely rare transient mild lesions in humans. Not considered a significant human public health hazard.",
        critical_safety_warning=None,
        case_fatality_profile="Low adult mortality (<2%–5%), but acute myocarditis ('tiger heart') causes high calf mortality (>20%–50%). Severe permanent reduction in milk yield in crossbred cows.",
        containment_protocol=[
            "Immediate complete quarantine of the premise; halt all animal entry and exit.",
            "Install foot-baths with 4% sodium carbonate (washing soda) or 0.2% citric acid at all shed entrances.",
            "Isolate sick animals and milk them last; discard infected milk safely.",
            "Report immediately to Gram Panchayat Veterinary Assistant Surgeon under NADCP."
        ],
        statutory_program="National Animal Disease Control Programme (NADCP) for FMD (100% Centrally Sponsored Mass Vaccination)",
        official_sources=[
            "DAHD Annual Report 2025–26, Chapter 6: Livestock Health",
            "ICAR-NIVEDI NADRES Forewarning Bulletin 2026",
            "WOAH Terrestrial Manual, Chapter 3.1.8"
        ]
    ),

    "anthrax": DiseaseProfile(
        disease_id="anthrax",
        name="Anthrax",
        pathogen="Bacillus anthracis (Gram-positive spore-forming rod-shaped bacterium)",
        pathogen_type="bacterial",
        susceptible_species=["cattle", "buffalo", "sheep", "goat"],
        hallmark_symptoms=["sudden_death", "unclotted_orifice_bleeding", "absence_of_rigor_mortis"],
        secondary_symptoms=["fever", "dyspnea"],
        anatomical_clues=["nostrils", "mouth", "anus", "rectum", "vulva"],
        environmental_predisposing_factors=[
            "Prolonged dry, hot spells following heavy torrential rainfall in alkaline/calcareous soils",
            "Exposure of buried spores through excavation, soil disturbance, or flooding"
        ],
        transmission_routes=[
            "Ingestion of soil-borne bacterial spores while grazing close to pasture ground",
            "Contaminated bone meal or drinking stagnant surface runoff"
        ],
        zoonotic_risk=True,
        zoonotic_notes="HIGH-CONSEQUENCE ZOONOSIS: Causes cutaneous anthrax (malignant pustule), gastrointestinal anthrax, or fatal inhalation anthrax in humans handling infected meat, hide, or carcasses.",
        critical_safety_warning="CRITICAL BIOSAFETY LOCK: STRICTLY FORBIDDEN TO CONDUCT POST-MORTEM EXAMINATION OR OPEN THE CARCASS. Exposure to atmospheric oxygen induces lethal sporulation and permanent 50-year environmental contamination.",
        case_fatality_profile="Peracute course with rapid mortality approaching 90%–100% within 1 to 2 hours of collapse.",
        containment_protocol=[
            "DO NOT OPEN, CUT, OR SKIN THE CARCASS UNDER ANY CIRCUMSTANCES.",
            "Seal all natural body orifices with cotton plugs soaked in 5% formalin or 3% cresol.",
            "Dispose of carcass on-site via deep burial (>6 feet deep) enclosed in quicklime (calcium oxide) or complete high-temperature incineration.",
            "Immediately notify District Veterinary Officer and Public Health Medical Officer.",
            "Administer prophylactic ring vaccination (Sterne strain spore vaccine) to in-contact herd."
        ],
        statutory_program="Assistance to States for Control of Animal Diseases (ASCAD) - Priority Zoonotic Disease Surveillance",
        official_sources=[
            "DAHD Guidelines for Prevention and Control of Anthrax in Livestock",
            "ICAR-IVRI Disease Advisory on Peracute Ruminant Mortalities",
            "WHO/WOAH/FAO Guidance on Anthrax in Humans and Animals"
        ]
    ),

    "haemorrhagic_septicaemia": DiseaseProfile(
        disease_id="haemorrhagic_septicaemia",
        name="Haemorrhagic Septicaemia",
        pathogen="Pasteurella multocida subsp. multocida (Serotype B:2 in India and Asia)",
        pathogen_type="bacterial",
        susceptible_species=["buffalo", "cattle"],
        hallmark_symptoms=["throat_swelling", "dyspnea"],
        secondary_symptoms=["fever", "excessive_salivation", "anorexia"],
        anatomical_clues=["throat", "submandibular region", "brisket", "neck"],
        environmental_predisposing_factors=[
            "Onset of monsoon, persistent torrential rainfall, high relative humidity (>80%), waterlogging, and transport stress"
        ],
        transmission_routes=[
            "Ingestion or inhalation of saliva and nasal secretions from clinical cases or subclinical carriers",
            "Shared stagnant water pools and transport crowding"
        ],
        zoonotic_risk=False,
        zoonotic_notes="Rare opportunistic wound infection in humans; not a primary zoonotic disease.",
        critical_safety_warning=None,
        case_fatality_profile="Acute septicemic course with high mortality (20%–40%+, up to 70% in naive buffaloes) within 12–36 hours without prompt antimicrobial intervention.",
        containment_protocol=[
            "Isolate sick buffaloes and cattle immediately in dry, well-ventilated pens away from stagnant pools.",
            "Urgent parenteral veterinary therapy (oxytetracycline or sulfadimidine) in early febrile phase before throat edema asphyxiation.",
            "Administer annual pre-monsoon prophylactic vaccination with alum-precipitated or oil-adjuvant HS vaccine.",
            "Disinfect water troughs and contaminated pens."
        ],
        statutory_program="Livestock Health and Disease Control Programme (LH&DCP) - Pre-monsoon Vaccination Campaigns",
        official_sources=[
            "ICAR-NIVEDI NADRES Forewarning Bulletin 2026",
            "DAHD Annual Report 2025–26, ASCAD Component",
            "WOAH Terrestrial Manual, Chapter 3.4.10"
        ]
    ),

    "black_quarter": DiseaseProfile(
        disease_id="black_quarter",
        name="Black Quarter",
        pathogen="Clostridium chauvoei (Gram-positive anaerobic spore-forming bacillus)",
        pathogen_type="bacterial",
        susceptible_species=["cattle", "sheep"],
        hallmark_symptoms=["crepitating_swelling", "lameness"],
        secondary_symptoms=["fever", "anorexia"],
        anatomical_clues=["thigh", "rump", "shoulder", "neck", "muscular quarters"],
        environmental_predisposing_factors=[
            "Post-monsoon season, warm humid soil conditions, water-logged low pastures"
        ],
        transmission_routes=[
            "Ingestion of latent soil spores during close grazing which germinate in bruised muscle tissue following minor blunt trauma"
        ],
        zoonotic_risk=False,
        zoonotic_notes="Non-zoonotic.",
        critical_safety_warning=None,
        case_fatality_profile="Extremely high fatality (approaching 80%–100%) within 12–48 hours; characteristically strikes young animals in prime nutritional condition (6 months to 2 years).",
        containment_protocol=[
            "Immediate isolation of affected young cattle.",
            "Early high-dose parenteral penicillin therapy under strict veterinary direction.",
            "Annual pre-monsoon vaccination of all cattle aged 6 months to 2 years with polyvalent clostridial or BQ bacterin.",
            "Deep burial or burning of carcasses to prevent soil spore accumulation."
        ],
        statutory_program="ASCAD Pre-monsoon Vaccination Protocols",
        official_sources=[
            "ICAR-NIVEDI Forewarning Bulletin 2026",
            "DAHD Disease Surveillance Guidelines",
            "WOAH Terrestrial Manual, Chapter 3.4.1"
        ]
    ),

    "brucellosis": DiseaseProfile(
        disease_id="brucellosis",
        name="Brucellosis",
        pathogen="Brucella abortus (Gram-negative facultative intracellular coccobacillus)",
        pathogen_type="bacterial",
        susceptible_species=["cattle", "buffalo"],
        hallmark_symptoms=["late_term_abortion"],
        secondary_symptoms=["drop_in_milk_yield"],
        anatomical_clues=["uterus", "placenta", "testicles", "carpal joints (hygroma)"],
        environmental_predisposing_factors=[
            "Intensive herd crowding, unhygienic calving pens, contaminated pasture"
        ],
        transmission_routes=[
            "Ingestion of contaminated feed/water after abortion, licking infected aborted fetuses or fetal fluids, or artificial insemination with infected semen"
        ],
        zoonotic_risk=True,
        zoonotic_notes="SIGNIFICANT ZOONOSIS: Causes undulant fever (Malta fever), recurrent chills, arthralgia, and chronic fatigue in humans. Transmits via unpasteurized raw milk or direct handling of aborted fetuses/placenta without personal protective equipment (gloves, mask).",
        critical_safety_warning="BIOHAZARD PRECAUTION: Always wear impermeable rubber gloves and protective mask when handling aborted fetal membranes or aborted calves.",
        case_fatality_profile="Low direct adult mortality, but causes catastrophic reproductive and economic loss: widespread abortion storms, retained placenta, and permanent infertility.",
        containment_protocol=[
            "Incinerate or deeply bury aborted fetuses, placenta, and contaminated bedding immediately.",
            "Disinfect calving pens with 2% sodium hydroxide or 2% formalin.",
            "Isolate aborting cows for a minimum of 30 days until uterine discharge ceases.",
            "Serological screening of herd (Rose Bengal Plate Test / ELISA) and milk ring testing.",
            "Do NOT consume unpasteurized raw milk."
        ],
        statutory_program="National Animal Disease Control Programme (NADCP) for Brucellosis (Calfhood S19 Vaccination of Female Calves 4–8 months)",
        official_sources=[
            "DAHD Annual Report 2025–26, NADCP-Brucellosis Guidelines",
            "ICAR-IVRI Guidelines on Bovine Brucellosis Control",
            "WOAH Terrestrial Manual, Chapter 3.1.4"
        ]
    )
}


def get_disease_profile(disease_id: str) -> Optional[DiseaseProfile]:
    """Retrieve disease profile by ID."""
    return DISEASE_PROFILES.get(disease_id.lower().strip())


def list_all_disease_profiles() -> List[DiseaseProfile]:
    """Return all 6 priority disease profiles."""
    return list(DISEASE_PROFILES.values())
