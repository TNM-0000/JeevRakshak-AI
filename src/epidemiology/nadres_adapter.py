"""
src/epidemiology/nadres_adapter.py
NADRES Forewarning Adapter for JeevRakshak AI.
Integrates official ICAR-NIVEDI forewarning data into the evidence engine.
Strictly returns data_unavailable if requested information is not supported by local bulletin.
"""

import os
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

NADRES_PROCESSED_FILE = "data/processed/nadres/nadres_state_forewarning_nov2026.json"

DISEASE_CODE_MAP = {
    "lumpy_skin_disease": "LSD",
    "lsd": "LSD",
    "foot_and_mouth_disease": "FMD",
    "fmd": "FMD",
    "anthrax": "Anthrax",
    "haemorrhagic_septicaemia": "HS",
    "hs": "HS",
    "black_quarter": "BQ",
    "bq": "BQ",
    "enterotoxaemia": "ET",
    "et": "ET",
    "peste_des_petits_ruminants": "PPR",
    "ppr": "PPR",
    "african_swine_fever": "ASF",
    "asf": "ASF",
    "classical_swine_fever": "CSF",
    "csf": "CSF",
    "bluetongue": "BT",
    "bt": "BT",
    "sheep_goat_pox": "Sheep_Goat_Pox"
}


class NADRESResponse(BaseModel):
    """
    Standardized response contract for NADRES epidemiological queries.
    """
    source: str = "NADRES"
    available: bool = Field(..., description="True if verified forewarning data exists for query")
    disease: Optional[str] = Field(None, description="Queried disease")
    geography: Optional[str] = Field(None, description="State and district queried")
    risk_level: Optional[str] = Field(None, description="Qualitative risk classification: 'high', 'moderate', 'low', 'no_alert'")
    forecast_period: Optional[str] = Field(None, description="Forewarning target window (e.g. 'November 2026')")
    predicted_district_count: Optional[int] = Field(None, description="Number of districts in state forewarned for disease")
    evidence_type: Optional[str] = Field(None, description="Nature of evidence (e.g. 'OFFICIAL_FOREWARNING')")
    reason: Optional[str] = Field(None, description="Reason if data is unavailable")
    raw_details: Dict[str, Any] = Field(default_factory=dict)


class NADRESAdapter:
    """
    Read-only adapter for ICAR-NIVEDI forewarning records.
    """
    def __init__(self, data_path: str = NADRES_PROCESSED_FILE):
        self.data_path = data_path
        self._data_by_state: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self):
        if os.path.exists(self.data_path):
            with open(self.data_path, "r") as f:
                records = json.load(f)
                for r in records:
                    state_clean = r["state_name"].lower().strip()
                    self._data_by_state[state_clean] = r

    def query(
        self,
        state: Optional[str],
        district: Optional[str],
        disease_id: Optional[str]
    ) -> NADRESResponse:
        """
        Queries NADRES data for a state/district and disease.
        Strictly returns available=False if state or data is not found.
        """
        if not state or not state.strip():
            return NADRESResponse(
                source="NADRES",
                available=False,
                reason="State not provided in query"
            )

        state_key = state.lower().strip()
        state_record = self._data_by_state.get(state_key)

        # Partial matching if exact state not found (e.g. 'Karnataka State' -> 'karnataka')
        if not state_record:
            for k, v in self._data_by_state.items():
                if k in state_key or state_key in k:
                    state_record = v
                    state_key = k
                    break

        if not state_record:
            return NADRESResponse(
                source="NADRES",
                available=False,
                geography=f"{district or 'Unknown'}, {state}",
                reason=f"No matching supported forewarning data available for state: '{state}'"
            )

        geography_str = f"{district}, {state_record['state_name']}" if district else state_record['state_name']
        forecast_period = state_record.get("prediction_target_month", "November 2026")

        # If specific disease requested
        if disease_id:
            disease_code = DISEASE_CODE_MAP.get(disease_id.lower().strip(), disease_id)
            if disease_code in state_record:
                count = int(state_record[disease_code])
                if count > 5:
                    risk_level = "high"
                elif count > 0:
                    risk_level = "moderate"
                else:
                    risk_level = "no_alert"

                return NADRESResponse(
                    source="NADRES",
                    available=True,
                    disease=disease_code,
                    geography=geography_str,
                    risk_level=risk_level,
                    forecast_period=forecast_period,
                    predicted_district_count=count,
                    evidence_type="OFFICIAL_FOREWARNING",
                    raw_details={
                        "state": state_record["state_name"],
                        "disease_code": disease_code,
                        "districts_predicted_with_risk": count,
                        "total_state_risk_events": state_record.get("total_predicted_risk")
                    }
                )
            else:
                return NADRESResponse(
                    source="NADRES",
                    available=False,
                    disease=disease_id,
                    geography=geography_str,
                    reason=f"Disease '{disease_id}' not tracked in NADRES bulletin"
                )

        # General state forewarning summary
        total_risk = int(state_record.get("total_predicted_risk", 0))
        risk_level = "high" if total_risk >= 50 else ("moderate" if total_risk >= 10 else "low")

        return NADRESResponse(
            source="NADRES",
            available=True,
            disease="All Tracked Endemic Diseases",
            geography=geography_str,
            risk_level=risk_level,
            forecast_period=forecast_period,
            evidence_type="OFFICIAL_FOREWARNING",
            raw_details={
                "state": state_record["state_name"],
                "total_state_risk_events": total_risk
            }
        )


def query_nadres(state: Optional[str], district: Optional[str] = None, disease_id: Optional[str] = None) -> NADRESResponse:
    adapter = NADRESAdapter()
    return adapter.query(state, district, disease_id)


if __name__ == "__main__":
    resp1 = query_nadres("Karnataka", "Bengaluru Rural", "lsd")
    print("NADRES Query (Karnataka / LSD):\n", resp1.model_dump_json(indent=2))

    resp2 = query_nadres("InvalidState", "Unknown", "fmd")
    print("\nNADRES Query (Invalid):\n", resp2.model_dump_json(indent=2))
