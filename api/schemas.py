"""
api/schemas.py
HTTP Request and Response schemas for the JeevRakshak AI FastAPI layer.
Maintains strict alignment with the canonical JeevRakshakAssessment contract.
"""

from typing import Optional
from pydantic import BaseModel, Field
from src.common.schema import JeevRakshakAssessment


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str = Field("ok", description="Current service operational status")
    service: str = Field("jeevrakshak-ai-api", description="Service identifier")
    version: str = Field("1.0.0", description="API version")


class AssessmentRequest(BaseModel):
    """
    JSON request schema for text-only assessment submissions.
    When an image is provided, clients submit multipart/form-data instead.
    """
    text: str = Field(
        ...,
        min_length=1,
        description="Free-form clinical narrative describing observed symptoms and case history",
        examples=["Cow has high fever, large nodular lumps all over the neck, and stopped eating for 3 days."]
    )
    state: Optional[str] = Field(
        None,
        description="Administrative State or Union Territory in India",
        examples=["Rajasthan"]
    )
    district: Optional[str] = Field(
        None,
        description="Administrative district name",
        examples=["Bikaner"]
    )
    species: Optional[str] = Field(
        None,
        description="Host animal species override (default inferred from text or 'cattle')",
        examples=["cattle"]
    )
    affected_count: Optional[int] = Field(
        None,
        ge=1,
        description="Explicit count of symptomatic animals (overrides text extraction if specified)",
        examples=[2]
    )
    total_herd_size: Optional[int] = Field(
        None,
        ge=1,
        description="Total animals in herd if known",
        examples=[12]
    )
    duration_days: Optional[float] = Field(
        None,
        ge=0.0,
        description="Duration of symptoms in days",
        examples=[3.0]
    )
    vaccination_status: Optional[str] = Field(
        None,
        description="Vaccination history (e.g. 'vaccinated', 'unvaccinated', 'unknown')",
        examples=["unvaccinated"]
    )


class ErrorDetail(BaseModel):
    """Structured error message schema."""
    detail: str = Field(..., description="Human-readable error description")
