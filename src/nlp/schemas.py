"""
src/nlp/schemas.py
Pydantic schemas for extracted observational entities.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from src.common.schema import AnimalContext, ExtractedObservations


class ExtractionResult(BaseModel):
    """
    Combined output of observation extraction engine.
    """
    animal_context: AnimalContext
    observations: ExtractedObservations
    extraction_mode: Literal["deterministic_rule_based", "llm_structured_output"] = "deterministic_rule_based"
    raw_input_text: str
