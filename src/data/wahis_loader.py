"""
src/data/wahis_loader.py
Loads, validates, and standardizes WOAH WAHIS global animal health reference records.
Raw source: data/raw/wahis/wahis_global_livestock_disease_reference.csv
Target processed output: data/processed/wahis/wahis_global_reference_processed.csv
"""

import os
import json
import pandas as pd
import numpy as np

RAW_CSV_PATH = "data/raw/wahis/wahis_global_livestock_disease_reference.csv"
PROCESSED_CSV_PATH = "data/processed/wahis/wahis_global_reference_processed.csv"
PROCESSED_JSON_PATH = "data/processed/wahis/wahis_global_reference_processed.json"


def load_raw_wahis_data(file_path: str = RAW_CSV_PATH) -> pd.DataFrame:
    """
    Loads raw WAHIS reference dataset and verifies schema.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Raw WAHIS file not found at: {file_path}")

    df = pd.read_csv(file_path)
    required_cols = {
        "Disease", "Species", "Country", "Region", "Reporting_Year",
        "Outbreaks_Reported", "Total_Cases", "Total_Deaths", "Control_Measures_Applied", "Data_Source"
    }
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in WAHIS dataset: {missing}")

    return df


def validate_and_enrich_wahis(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates numbers and enriches with case fatality rates and outbreak intensity.
    """
    df_clean = df.copy()

    # Validations
    assert (df_clean["Outbreaks_Reported"] >= 0).all(), "Negative outbreaks found in WAHIS"
    assert (df_clean["Total_Cases"] >= 0).all(), "Negative cases found in WAHIS"
    assert (df_clean["Total_Deaths"] >= 0).all(), "Negative deaths found in WAHIS"

    # Compute Case Fatality Rate
    df_clean["Case_Fatality_Rate_Pct"] = np.where(
        df_clean["Total_Cases"] > 0,
        np.round((df_clean["Total_Deaths"] / df_clean["Total_Cases"]) * 100.0, 2),
        0.0
    )

    # Compute Morbidity Intensity
    df_clean["Cases_Per_Outbreak"] = np.where(
        df_clean["Outbreaks_Reported"] > 0,
        np.round(df_clean["Total_Cases"] / df_clean["Outbreaks_Reported"], 1),
        0.0
    )

    df_clean["International_Authority"] = "World Organisation for Animal Health (WOAH)"
    return df_clean


def run_wahis_pipeline() -> pd.DataFrame:
    """
    Executes raw reading, validation, enrichment, and output generation.
    """
    os.makedirs(os.path.dirname(PROCESSED_CSV_PATH), exist_ok=True)

    print(f"[WAHIS Loader] Reading raw reference data from: {RAW_CSV_PATH}")
    df_raw = load_raw_wahis_data()
    print(f"[WAHIS Loader] Loaded {len(df_raw)} international epidemiological records.")

    df_processed = validate_and_enrich_wahis(df_raw)

    # Save CSV
    df_processed.to_csv(PROCESSED_CSV_PATH, index=False)
    print(f"[WAHIS Loader] Saved processed CSV to: {PROCESSED_CSV_PATH}")

    # Save JSON
    records = df_processed.to_dict(orient="records")
    with open(PROCESSED_JSON_PATH, "w") as f:
        json.dump(records, f, indent=2)
    print(f"[WAHIS Loader] Saved structured JSON to: {PROCESSED_JSON_PATH}")

    return df_processed


if __name__ == "__main__":
    df = run_wahis_pipeline()
    print("\n--- Processed WAHIS Global Reference Preview ---")
    print(df[["Disease", "Country", "Reporting_Year", "Total_Cases", "Total_Deaths", "Case_Fatality_Rate_Pct"]].head())
