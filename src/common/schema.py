"""
src/common/schema.py
Canonical Assessment Contract and Pydantic Schemas for JeevRakshak AI.
Establishes ONE unified, auditable contract for multimodal evidence fusion,
risk evaluation, and veterinary decision support.
"""

from typing import List, Dict, Optional, Literal, Any
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field, field_validator


class InputSummary(BaseModel):
    """Summary of raw inputs provided by user or field worker."""
    original_text: str = Field(..., description="Raw text prompt provided by farmer/field worker")
    image_provided: bool = Field(False, description="True if an image was submitted for visual analysis")
    image_path: Optional[str] = Field(None, description="Path to image if provided")
    location_provided: bool = Field(False, description="True if administrative location was provided")
    state: Optional[str] = Field(None, description="State or Union Territory")
    district: Optional[str] = Field(None, description="District name")


class AnimalContext(BaseModel):
    """Demographic and epidemiological context of affected animal(s)."""
    species: Literal["cattle", "buffalo", "sheep", "goat", "swine", "horse", "equine", "other", "unknown"] = Field(
        "cattle", description="Host animal species"
    )
    affected_count: Optional[int] = Field(
        None, ge=1, description="Explicit count of symptomatic animals (None if unquantified)"
    )
    total_herd_size: Optional[int] = Field(
        None, ge=1, description="Total animals in herd/flock if specified"
    )
    duration_days: Optional[float] = Field(
        None, ge=0.0, description="Duration of symptoms in days (None if unspecified)"
    )
    mortality_count: int = Field(
        0, ge=0, description="Count of animals deceased from current illness"
    )
    vaccination_status: str = Field(
        "unknown", description="Vaccination history (e.g. 'vaccinated', 'unvaccinated', 'unknown')"
    )
    treatment_history: Optional[str] = Field(
        None, description="Prior treatments or remedies administered"
    )


class ExtractedObservations(BaseModel):
    """Structured clinical observations parsed from farmer narrative."""
    symptoms: List[str] = Field(
        default_factory=list, description="Normalized clinical symptoms (e.g. 'fever', 'skin_nodules')"
    )
    anatomical_locations: List[str] = Field(
        default_factory=list, description="Specific body regions affected (e.g. 'neck', 'mouth', 'feet')"
    )
    clinical_observations: List[str] = Field(
        default_factory=list, description="Detailed observational descriptors"
    )
    extraction_confidence: Optional[float] = Field(
        None, ge=0.0, le=1.0, description="Confidence of observation extraction"
    )

    @field_validator("symptoms", "anatomical_locations")
    @classmethod
    def clean_strings(cls, v: List[str]) -> List[str]:
        return [s.strip().lower() for s in v if s.strip()]


class VisualAnalysis(BaseModel):
    """Standardized visual evidence extracted from pretrained vision model."""
    available: bool = Field(False, description="True if visual analysis was executed successfully")
    model_name: Optional[str] = Field("xprotocol/EfficientNet-B3-Cattle-Disease", description="Vision model identifier")
    architecture: Optional[str] = Field("EfficientNet-B3", description="Model architecture")
    predicted_class: Optional[str] = Field(None, description="Top predicted visual class")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence of top visual class")
    class_probabilities: Dict[str, float] = Field(
        default_factory=dict, description="Softmax probabilities across target classes"
    )
    evidence_nature: Literal["VISUAL_EVIDENCE_ONLY"] = "VISUAL_EVIDENCE_ONLY"
    image_sha256: Optional[str] = Field(None, description="Cryptographic SHA-256 hash of evaluated image")
    disclaimer: str = Field(
        default="Visual classification represents visual feature evidence only; it does NOT constitute a confirmed veterinary diagnosis.",
        description="Mandatory medical boundary disclaimer"
    )

    @property
    def clinical_disclaimer(self) -> str:
        return self.disclaimer

    def __getitem__(self, item: str) -> Any:
        if item == "clinical_disclaimer":
            return self.disclaimer
        if hasattr(self, item):
            return getattr(self, item)
        raise KeyError(item)

    def __contains__(self, item: str) -> bool:
        if item == "clinical_disclaimer":
            return True
        return hasattr(self, item)


class ConditionDifferential(BaseModel):
    """Differential disease candidate with transparent evidence support."""
    disease: str = Field(..., description="Standard disease nomenclature")
    pathogen: Optional[str] = Field(None, description="Etiological agent / scientific pathogen")
    support_level: Literal["low", "moderate", "high"] = Field(
        ..., description="Qualitative degree of evidence support"
    )
    supporting_evidence: List[str] = Field(
        default_factory=list, description="Specific facts and observations supporting this condition"
    )
    contradicting_or_missing_evidence: List[str] = Field(
        default_factory=list, description="Missing hallmark signs or contradicting factors"
    )
    sources: List[str] = Field(
        default_factory=list, description="Authoritative veterinary monographs supporting this profile"
    )


class EpidemiologicalContextData(BaseModel):
    """Regional and global disease surveillance context."""
    nadres: Dict[str, Any] = Field(
        default_factory=dict, description="ICAR-NIVEDI forewarning context for state/district"
    )
    wahis: Dict[str, Any] = Field(
        default_factory=dict, description="WOAH WAHIS reference surveillance context"
    )


class EnvironmentalContextData(BaseModel):
    """Micro-climatic variables retrieved from Open-Meteo."""
    weather_available: bool = Field(False, description="True if weather data was retrieved")
    temperature_2m_c: Optional[float] = Field(None, description="Ambient air temperature in Celsius")
    relative_humidity_2m_pct: Optional[float] = Field(None, description="Relative humidity percentage")
    precipitation_mm: Optional[float] = Field(None, description="Precipitation accumulation in mm")
    relevant_observations: List[str] = Field(
        default_factory=list, description="Epidemiologically relevant weather interpretations"
    )
    source: str = Field("Open-Meteo", description="Data provider")


class RiskAssessment(BaseModel):
    """Explainable risk and urgency assessment."""
    overall_risk: Literal["low", "moderate", "high", "critical"] = Field(
        ..., description="Composite case urgency category"
    )
    risk_factors: List[str] = Field(
        default_factory=list, description="Traceable factors driving the risk level"
    )
    uncertainties: List[str] = Field(
        default_factory=list, description="Unknowns or data gaps impacting assessment certainty"
    )
    cluster_signal: Optional[str] = Field(
        None, description="Cluster classification (e.g. 'possible_cluster_signal')"
    )


class RecommendedActions(BaseModel):
    """Actionable veterinary guidance and containment protocols."""
    immediate_actions: List[str] = Field(default_factory=list, description="Immediate on-farm biosecurity steps")
    veterinary_referral: List[str] = Field(default_factory=list, description="Veterinary institutional referral routing")
    containment_precautions: List[str] = Field(default_factory=list, description="Herd containment and isolation rules")
    sample_collection: List[str] = Field(default_factory=list, description="Diagnostic sampling advisory for veterinarians")
    monitoring: List[str] = Field(default_factory=list, description="Clinical monitoring parameters for remaining animals")


class EscalationDecision(BaseModel):
    """Administrative escalation and notification requirement."""
    required: bool = Field(..., description="True if immediate administrative escalation is necessary")
    urgency: Literal["routine", "moderate", "urgent", "emergency"] = Field(
        ..., description="Response urgency timeframe"
    )
    reason: List[str] = Field(default_factory=list, description="Specific triggers warranting escalation")


class JeevRakshakAssessment(BaseModel):
    """
    ONE Canonical Assessment Contract for JeevRakshak AI.
    Unifies all evidence streams, deterministic differentials, risk grading,
    and action escalation into a validated, reproducible output.
    """
    assessment_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), description="Unique assessment audit identifier"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp of assessment completion"
    )
    input_summary: InputSummary
    animal_context: AnimalContext
    observations: ExtractedObservations
    visual_analysis: VisualAnalysis
    possible_conditions: List[ConditionDifferential] = Field(default_factory=list)
    epidemiological_context: EpidemiologicalContextData = Field(default_factory=EpidemiologicalContextData)
    environmental_context: EnvironmentalContextData = Field(default_factory=EnvironmentalContextData)
    risk_assessment: RiskAssessment
    recommended_actions: RecommendedActions
    escalation: EscalationDecision
    data_gaps: List[str] = Field(default_factory=list, description="Missing critical evidence items")
    sources: List[str] = Field(default_factory=list, description="Authoritative reference sources consulted")
    disclaimer: str = Field(
        default="This assessment is a veterinary decision-support aid and does not constitute a confirmed veterinary diagnosis. Always consult a certified veterinary officer.",
        description="Statutory legal and medical boundary disclaimer"
    )


# ---------------------------------------------------------------------------
# Phase 1 Backward Compatibility Schemas
# (Maintained to ensure Phase 1 test suite and loader validations pass)
# ---------------------------------------------------------------------------

class AnimalObservation(BaseModel):
    """Phase 1 legacy observation model."""
    species: str = "cattle"
    affected_animal_count: int = Field(1, ge=1)
    total_herd_size: Optional[int] = None
    symptoms: List[str] = Field(default_factory=list)
    duration_days: Optional[float] = None

    @field_validator("symptoms")
    @classmethod
    def clean_symptoms(cls, v: List[str]) -> List[str]:
        return [s.strip().lower() for s in v if s.strip()]


class VisualEvidence(BaseModel):
    """Phase 1 legacy visual evidence model."""
    model_name: str
    predicted_class: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    class_probabilities: Dict[str, float] = Field(default_factory=dict)
    evidence_nature: Literal["VISUAL_EVIDENCE_ONLY"] = "VISUAL_EVIDENCE_ONLY"


class EpidemiologicalContext(BaseModel):
    """Phase 1 legacy epidemiological context model."""
    state: str
    district: str
    reference_period: Optional[str] = None
    disease_forewarning_status: Optional[str] = None
    state_total_predicted_events: Optional[int] = None
    source_agency: str = "ICAR-NIVEDI NADRES v2"


class UnifiedEvidencePayload(BaseModel):
    """Phase 1 legacy unified payload."""
    case_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    animal_observation: AnimalObservation
    visual_evidence: Optional[VisualEvidence] = None
    epidemiological_context: Optional[EpidemiologicalContext] = None


def create_sample_evidence_payload() -> UnifiedEvidencePayload:
    """Creates a sample payload for Phase 1 serialization validation."""
    return UnifiedEvidencePayload(
        animal_observation=AnimalObservation(
            species="cattle",
            affected_animal_count=2,
            total_herd_size=10,
            symptoms=["fever", "skin_nodules"],
            duration_days=3.0
        ),
        visual_evidence=VisualEvidence(
            model_name="xprotocol/EfficientNet-B3-Cattle-Disease",
            predicted_class="lumpy",
            confidence=0.88,
            class_probabilities={"foot-and-mouth": 0.05, "healthy": 0.07, "lumpy": 0.88}
        ),
        epidemiological_context=EpidemiologicalContext(
            state="Karnataka",
            district="Bengaluru Rural",
            reference_period="November 2026",
            disease_forewarning_status="LUMPY_SKIN_DISEASE Forewarned in 5 districts",
            state_total_predicted_events=42
        )
    )

