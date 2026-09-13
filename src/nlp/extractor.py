"""
src/nlp/extractor.py
Bounded Clinical Observation Extractor for JeevRakshak AI.
Converts free-form farmer and field-worker narratives into structured clinical observations.
Preserves uncertainty, avoids numerical fabrication, and normalizes synonymous clinical terms.
"""

import re
from typing import Dict, List, Tuple, Optional, Any
from src.common.schema import AnimalContext, ExtractedObservations
from src.nlp.schemas import ExtractionResult

# Number word mapping for animal count and duration parsing
WORD_TO_NUM = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "fifteen": 15, "twenty": 20,
    "a": 1, "an": 1, "single": 1
}

# Species detection patterns
SPECIES_PATTERNS = {
    "cattle": [r"\bcow\b", r"\bcows\b", r"\bcattle\b", r"\bbull\b", r"\bbulls\b", r"\box\b", r"\boxen\b", r"\bcalf\b", r"\bcalves\b", r"\bgay\b", r"\bgaay\b", r"\bbail\b"],
    "buffalo": [r"\bbuffalo\b", r"\bbuffaloes\b", r"\bbuffalos\b", r"\bheifer\b", r"\bbhais\b", r"\bbhainse\b"],
    "sheep": [r"\bsheep\b", r"\bram\b", r"\bewe\b", r"\blamb\b", r"\bbhed\b"],
    "goat": [r"\bgoat\b", r"\bgoats\b", r"\bbuk\b", r"\bbakri\b", r"\bbakra\b"],
    "swine": [r"\bpig\b", r"\bpigs\b", r"\bswine\b", r"\bhog\b", r"\bsuvar\b"]
}

# Canonical symptom synonyms vocabulary
# Maps vernacular agricultural and clinical phrasing to standardized tags
SYMPTOM_VOCABULARY: Dict[str, List[str]] = {
    "fever": [
        r"\bfever\b", r"\bhigh fever\b", r"\bhigh temp\b", r"\btemperature\b", r"\bbukhar\b", r"\bpyrexia\b", r"\bhot body\b", r"\bwarm to touch\b",
        r"बुखार", r"ताप", r"ज्वर", r"गरम अंग"
    ],
    "skin_nodules": [
        r"\bskin lumps\b", r"\blumps?\b", r"\bhard lumps?\b", r"\bnodules?\b", r"\bskin nodules?\b", r"\bbumps?\b",
        r"\bgathaan\b", r"\bgathe\b", r"\bcircular nodules?\b", r"\bcutaneous nodules?\b", r"\bsit-fasts?\b",
        r"\bskin lesions?\b", r"\blesions?\b", r"\bskin eruptions?\b", r"\bcutaneous lesions?\b", r"\brash\b", r"\bskin rash\b",
        r"गांठे?", r"गाठी?", r"फोड", r"गुठली", r"लम्पी", r"त्वचेवर गाठी"
    ],
    "oral_vesicles": [
        r"\bblisters?\b", r"\bblisters? in mouth\b", r"\boral blisters?\b", r"\bvesicles?\b", r"\bmouth sores?\b",
        r"\bulcers? in mouth\b", r"\bchhale\b", r"\btongue lesions?\b", r"\bmouth ulcers?\b", r"\berosions?\b",
        r"\bmouth blisters?\b", r"\boral sores?\b", r"\btongue blisters?\b",
        r"छाले", r"मुंह के छाले", r"तोंडातील फोड", r"तोंडात फोड", r"व्रण"
    ],
    "excessive_salivation": [
        r"\bsalivat\w*\b", r"\bdrool\w*\b", r"\blaar\b", r"\bropy saliva\b", r"\bstringy saliva\b",
        r"\bfrothing\b", r"\bfrothing at mouth\b", r"\bexcessive saliva\b", r"\blip smacking\b",
        r"\bexcessive drooling\b", r"\bmouth watering\b", r"\bfoaming\b",
        r"लार", r"लाळ", r"फेन", r"झाग"
    ],
    "lameness": [
        r"\blameness\b", r"\blimp\w*\b", r"\blangda\w*\b", r"\bunwillingness to move\b", r"\breluctant to walk\b",
        r"\bleg pain\b", r"\bfoot pain\b", r"\bshaking feet\b", r"\brecumbency\b", r"\bunable to stand\b",
        r"\babnormal movement\b", r"\bunsteady\b", r"\bstaggering\b", r"\bwobbly\b", r"\blurching\b",
        r"लंगड़ा\w*", r"लंगड\w*", r"चालण्यात अडचण"
    ],
    "hoof_lesions": [
        r"\bfoot sores?\b", r"\bhoof lesions?\b", r"\bblisters? on feet\b", r"\bblisters? on foot\b",
        r"\bcoronary band\b", r"\binterdigital\b", r"\bhoof sores?\b", r"\bfoot lesions?\b", r"\bkhur\b",
        r"खुर", r"पायातील फोड"
    ],
    "anorexia": [
        r"\bstopped eating\b", r"\bnot eating\b", r"\banorexia\b", r"\bloss of appetite\b", r"\boff feed\b",
        r"\bchara nahi kha rahi\b", r"\bdana nahi kha\w*\b", r"\breduced feed intake\b", r"\bdull\b",
        r"\bweakness\b", r"\bkamzori\b", r"\bletharg\w*\b", r"\bdullness\b", r"\bsust\b",
        r"चारा न खाणे", r"खाना नहीं खा\w*", r"भूख कम", r"अशक्तपणा", r"कमजोरी", r"चारा बंद"
    ],
    "drop_in_milk_yield": [
        r"\bdrop in milk\b", r"\bmilk yield decreased\b", r"\bmilk reduction\b", r"\bdoodh kam\b",
        r"\bmilk fell\b", r"\bdecreased milk\b", r"\bloss of milk\b", r"\breduced milk production\b", r"\breduced milk\b",
        r"दूध कम", r"दूध घटले", r"दूध उत्पादनात घट"
    ],
    "enlarged_lymph_nodes": [
        r"\blymph node\b", r"\benlarged lymph\b", r"\bswollen glands?\b", r"\bprescapular\b",
        r"\bgland swelling\b", r"\bgilthi\b",
        r"गाठ", r"गिलटी"
    ],
    "limb_edema": [
        r"\bswollen legs?\b", r"\bleg swelling\b", r"\blimb edema\b", r"\boedema\b", r"\bswollen feet\b",
        r"\bswelling\b", r"\bswollen\b", r"\bsoojan\b",
        r"सूजन", r"सूज", r"पायांना सूज"
    ],
    "throat_swelling": [
        r"\bswollen throat\b", r"\bbrisket swelling\b", r"\bgala ghotu\b", r"\bthroat swelling\b",
        r"\bneck swelling\b", r"\bsubmandibular edema\b", r"\bbrisket edema\b", r"\bswollen neck\b", r"\bswelling in throat\b",
        r"गले में सूजन", r"गळ्याला सूज", r"गला घोटू", r"गळसुज"
    ],
    "dyspnea": [
        r"\bdifficulty breathing\b", r"\brespiratory distress\b", r"\bpanting\b", r"\bstridor\b",
        r"\bheavy breathing\b", r"\bbreathing hard\b", r"\bopen mouth breathing\b",
        r"\bcough\w*\b", r"\bkhansi\b", r"\bdhasle\b", r"\bnasal discharge\b", r"\brunny nose\b", r"\bnose discharge\b", r"\bnak se pani\b",
        r"खांसी", r"खोकला", r"सांस लेने में", r"श्वास घेण्यास", r"नाकातून स्राव"
    ],
    "crepitating_swelling": [
        r"\bcrackling\b", r"\bcrackling sound\b", r"\bcrepitation\b", r"\bcrepitating\b",
        r"\bgas in muscle\b", r"\bswelling on thigh\b", r"\bswelling on rump\b", r"\bswelling on shoulder\b",
        r"\bblack quarter swelling\b", r"\bcrackling swelling\b", r"\bcrackling muscle\b",
        r"चरचराहट", r"कुरकूर"
    ],
    "sudden_death": [
        r"\bsudden death\b", r"\bdied suddenly\b", r"\bfound dead\b", r"\bperacute death\b",
        r"\bcollapsed and died\b", r"\bmar gayi achanak\b", r"\bachanak maut\b",
        r"अचानक मौत", r"अचानक मृत्यू", r"मरी हुई", r"मेली"
    ],
    "unclotted_orifice_bleeding": [
        r"\bdark unclotted blood\b", r"\bunclotted blood\b", r"\bbleeding from nose\b", r"\bbleeding from nostrils\b",
        r"\bblood from anus\b", r"\bblood from rectum\b", r"\bblood oozing\b", r"\btarry blood\b", r"\bblack blood\b",
        r"\bdark blood\b", r"\bblood from nostrils?\b", r"\bblood from nose\b",
        r"\bbleeding from orifices?\b", r"\bblood from orifices?\b", r"\bkala khoon\b", r"\bbleeding\b",
        r"काला खून", r"काळे रक्त", r"रक्तस्राव"
    ],
    "absence_of_rigor_mortis": [
        r"\bno rigor mortis\b", r"\babsence of rigor mortis\b", r"\bbody did not stiffen\b", r"\bnot stiff\b", r"\bsoft carcass\b"
    ],
    "late_term_abortion": [
        r"\babortion\b", r"\baborted\b", r"\bgarbhpat\b", r"\b7th month\b", r"\b8th month\b",
        r"\blate term abortion\b", r"\bpremature calf\b", r"\bretained placenta\b", r"\blate pregnancy abortion\b",
        r"गर्भपात"
    ],
    "diarrhea": [
        r"\bdiarrhea\b", r"\bloose motions?\b", r"\bdast\b", r"\bpatla gobar\b", r"\bscours?\b", r"\bwatery dung\b",
        r"दस्त", r"जुलाब", r"हगवण"
    ]
}

# Anatomical location patterns
ANATOMICAL_PATTERNS = {
    "neck": [r"\bneck\b", r"\bgardan\b"],
    "mouth": [r"\bmouth\b", r"\bmuh\b", r"\boral\b", r"\blips?\b", r"\bgums?\b"],
    "tongue": [r"\btongue\b", r"\bjeebh\b"],
    "feet": [r"\bfeet\b", r"\bfoot\b", r"\blegs?\b", r"\bhoof\b", r"\bhooves\b", r"\bkhur\b"],
    "udder": [r"\budder\b", r"\bteat\b", r"\bteats\b", r"\bthan\b"],
    "throat": [r"\bthroat\b", r"\bgala\b", r"\bbrisket\b", r"\bdewlap\b"],
    "thigh": [r"\bthigh\b", r"\brump\b", r"\bshoulder\b", r"\bhind leg\b"],
    "eyes": [r"\beyes?\b", r"\baankh\b"],
    "nose": [r"\bnose\b", r"\bnostrils?\b", r"\bmuzzle\b"]
}


class ObservationExtractor:
    """
    Deterministic rule-based clinical NLP observation extractor with pluggable design.
    """
    def __init__(self):
        pass

    def extract(self, text: str, species_override: Optional[str] = None) -> ExtractionResult:
        if not text or not text.strip():
            return ExtractionResult(
                animal_context=AnimalContext(
                    species="cattle" if species_override is None else species_override,
                    affected_count=None,
                    duration_days=None,
                    mortality_count=0,
                    vaccination_status="unknown"
                ),
                observations=ExtractedObservations(
                    symptoms=[],
                    anatomical_locations=[],
                    clinical_observations=[],
                    extraction_confidence=0.0
                ),
                extraction_mode="deterministic_rule_based",
                raw_input_text=text or ""
            )

        text_clean = text.strip()
        lower_text = text_clean.lower()

        # 1. Species extraction
        species = species_override or "cattle"
        for sp, patterns in SPECIES_PATTERNS.items():
            for p in patterns:
                if re.search(p, lower_text):
                    species = sp
                    break
            if species != "cattle" and species_override is None:
                break

        # 2. Count extraction (never invent numbers; "some cows" -> None)
        affected_count = self._parse_affected_count(lower_text)

        # 3. Duration extraction ("three days" -> 3.0)
        duration_days = self._parse_duration(lower_text)

        # 4. Mortality extraction ("one cow died" -> 1)
        mortality_count = self._parse_mortality(lower_text)

        # 5. Vaccination extraction
        vaccination_status = self._parse_vaccination(lower_text)

        # 6. Symptoms extraction
        symptoms, descriptors = self._extract_symptoms(lower_text)

        # 7. Anatomical locations extraction
        anatomical_locations = self._extract_locations(lower_text)

        # Extraction confidence
        confidence = 0.5
        if symptoms:
            confidence += 0.3
        if duration_days is not None:
            confidence += 0.1
        if affected_count is not None:
            confidence += 0.1
        confidence = min(1.0, confidence)

        animal_context = AnimalContext(
            species=species,
            affected_count=affected_count,
            duration_days=duration_days,
            mortality_count=mortality_count,
            vaccination_status=vaccination_status
        )

        observations = ExtractedObservations(
            symptoms=symptoms,
            anatomical_locations=anatomical_locations,
            clinical_observations=descriptors,
            extraction_confidence=round(confidence, 2)
        )

        return ExtractionResult(
            animal_context=animal_context,
            observations=observations,
            extraction_mode="deterministic_rule_based",
            raw_input_text=text_clean
        )

    def _parse_affected_count(self, text: str) -> Optional[int]:
        """
        Extracts explicitly stated number of affected animals.
        Returns None for vague terms like 'some', 'several', 'a few'.
        """
        # Exclude duration expressions like 'for 3 days'
        text_without_duration = re.sub(r"\b(?:for|in|within|past|last|after)\s+\d+\s+(?:days?|weeks?|months?|hours?)\b", "", text)
        text_without_duration = re.sub(r"\b\d+\s+(?:days?|weeks?|months?|hours?)\b", "", text_without_duration)

        # Match pattern: <number> <animals>
        # e.g. "two cows", "3 buffaloes", "my 4 cattle", "three animals"
        m = re.search(r"\b(?:my|the)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty)\s+(?:cows?|cattle|buffaloes?|animals?|calves|bulls?|goats?|sheep)\b", text_without_duration)
        if m:
            val_str = m.group(1).lower()
            return int(val_str) if val_str.isdigit() else WORD_TO_NUM.get(val_str, None)

        # Match pattern: <animals> ... count
        m2 = re.search(r"\b(\d+)\s+of\s+my\s+(?:cows?|cattle|buffaloes?|animals?)\b", text_without_duration)
        if m2:
            return int(m2.group(1))

        # Check for vague phrases that explicitly mean unquantified
        if any(v in text for v in ["some cows", "some cattle", "few cows", "several cows", "many cattle", "my cows"]):
            return None

        return None

    def _parse_duration(self, text: str) -> Optional[float]:
        """
        Extracts duration in days (e.g. 'for 3 days' -> 3.0, 'since 1 week' -> 7.0).
        """
        # Match 'X days' or 'for X days'
        m = re.search(r"\b(?:for|since|past|last)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+days?\b", text)
        if m:
            val = m.group(1).lower()
            return float(val) if val.isdigit() else float(WORD_TO_NUM.get(val, 1))

        # Match 'X weeks'
        m_wk = re.search(r"\b(?:for|since|past|last)?\s*(\d+|one|two|three|four)\s+weeks?\b", text)
        if m_wk:
            val = m_wk.group(1).lower()
            n = float(val) if val.isdigit() else float(WORD_TO_NUM.get(val, 1))
            return n * 7.0

        # Match 'X hours'
        m_hr = re.search(r"\b(?:for|since|past|last)?\s*(\d+|one|two|three|six|twelve|twenty four)\s+hours?\b", text)
        if m_hr:
            val = m_hr.group(1).lower()
            hrs = float(val) if val.isdigit() else float(WORD_TO_NUM.get(val, 1))
            return round(hrs / 24.0, 2)

        return None

    def _parse_mortality(self, text: str) -> int:
        """
        Detects reported deaths.
        """
        m = re.search(r"\b(\d+|one|two|three|four|five)\s+(?:cows?|cattle|buffaloes?|animals?|calves)?\s*(?:died|dead|succumbed)\b", text)
        if m:
            val = m.group(1).lower()
            return int(val) if val.isdigit() else WORD_TO_NUM.get(val, 1)

        if any(w in text for w in ["died", "found dead", "dead in morning", "mar gayi"]):
            return 1

        return 0

    def _parse_vaccination(self, text: str) -> str:
        """
        Identifies mentioned vaccination history.
        """
        if re.search(r"\bnot vaccinated\b|\bunvaccinated\b|\bno vaccine\b|\bnever vaccinated\b", text):
            return "unvaccinated"
        if re.search(r"\bvaccinated\b|\bgiven vaccine\b|\btika lagwaya\b", text):
            # Extract specific vaccine if mentioned
            if "fmd" in text:
                return "vaccinated_fmd"
            if "lsd" in text or "lumpy" in text or "goat pox" in text:
                return "vaccinated_lsd"
            return "vaccinated"
        return "unknown"

    def _extract_symptoms(self, text: str) -> Tuple[List[str], List[str]]:
        """
        Matches text against the canonical clinical synonym vocabulary.
        """
        matched_symptoms: List[str] = []
        descriptors: List[str] = []

        for canonical_tag, patterns in SYMPTOM_VOCABULARY.items():
            for pat in patterns:
                m = re.search(pat, text)
                if m:
                    if canonical_tag not in matched_symptoms:
                        matched_symptoms.append(canonical_tag)
                        descriptors.append(f"Observed {canonical_tag.replace('_', ' ')} (text match: '{m.group(0)}')")
                    break

        return matched_symptoms, descriptors

    def _extract_locations(self, text: str) -> List[str]:
        """
        Extracts anatomical body sites mentioned.
        """
        locations: List[str] = []
        for loc, patterns in ANATOMICAL_PATTERNS.items():
            for pat in patterns:
                if re.search(pat, text):
                    if loc not in locations:
                        locations.append(loc)
                    break
        return locations


def extract_observations(text: str, species_override: Optional[str] = None) -> ExtractionResult:
    """
    Convenience functional endpoint.
    """
    extractor = ObservationExtractor()
    return extractor.extract(text, species_override)


if __name__ == "__main__":
    sample = "My two cows have high fever, stopped eating, and have round hard lumps on their neck for three days."
    res = extract_observations(sample)
    print("Extracted Result:\n", res.model_dump_json(indent=2))
