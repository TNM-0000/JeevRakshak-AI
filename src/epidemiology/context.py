"""
src/epidemiology/context.py
Epidemiological context service that bridges processed ICAR-NIVEDI forewarning
data and historical government incidence statistics into the common evidence schema.
"""

import os
import json
from typing import Dict, Any, Optional
from src.common.schema import EpidemiologicalContext

NADRES_PROCESSED_JSON = "data/processed/nadres/nadres_state_forewarning_nov2026.json"
INCIDENCE_SUMMARY_JSON = "data/processed/india_government/disease_longitudinal_summary.json"


class EpidemiologyContextService:
    """
    Provides read-only access to processed epidemiological data for evidence enrichment.
    """
    def __init__(
        self,
        nadres_path: str = NADRES_PROCESSED_JSON,
        summary_path: str = INCIDENCE_SUMMARY_JSON
    ):
        self.nadres_path = nadres_path
        self.summary_path = summary_path
        self._nadres_records: Dict[str, Dict[str, Any]] = {}
        self._incidence_summaries: Dict[str, Dict[str, Any]] = {}
        self._load_data()

    def _load_data(self):
        if os.path.exists(self.nadres_path):
            with open(self.nadres_path, "r") as f:
                records = json.load(f)
                for r in records:
                    self._nadres_records[r["state_name"].lower()] = r

        if os.path.exists(self.summary_path):
            with open(self.summary_path, "r") as f:
                self._incidence_summaries = json.load(f)

    def get_state_forewarning(self, state: str) -> Optional[Dict[str, Any]]:
        """
        Returns forewarning record for a specific state.
        """
        return self._nadres_records.get(state.lower().strip())

    def get_disease_historical_benchmark(self, disease_query: str) -> Optional[Dict[str, Any]]:
        """
        Returns historical baseline incidence and mean CFR for a disease.
        """
        query_clean = disease_query.lower().strip()
        for k, v in self._incidence_summaries.items():
            if query_clean in k.lower():
                return v
        return None

    def build_context(
        self,
        state: str,
        district: str,
        suspected_disease: Optional[str] = None
    ) -> EpidemiologicalContext:
        """
        Constructs an EpidemiologicalContext Pydantic object for the given location.
        """
        state_record = self.get_state_forewarning(state)
        predicted_events = state_record.get("total_predicted_risk") if state_record else None
        
        status = "No State Alert Recorded"
        if state_record:
            if suspected_disease:
                # Check specific disease count in NADRES
                dis_col = suspected_disease.upper().replace("-", "_")
                dis_count = state_record.get(dis_col, 0)
                status = f"{dis_col} Forewarned in {dis_count} districts" if dis_count > 0 else f"No {dis_col} alert in state"
            else:
                status = f"High Risk: {predicted_events} disease events predicted in state"

        return EpidemiologicalContext(
            state=state,
            district=district,
            reference_period="November 2026",
            disease_forewarning_status=status,
            state_total_predicted_events=predicted_events,
            source_agency="ICAR-NIVEDI NADRES v2"
        )


if __name__ == "__main__":
    service = EpidemiologyContextService()
    ctx = service.build_context("Karnataka", "Bengaluru Rural", suspected_disease="FMD")
    print("Generated Context:\n", ctx.model_dump_json(indent=2))
