"""
src/data/india_gov_loader.py
Loads, validates, normalizes, and computes epidemiological metrics from
the Open Government Data / DAHD livestock disease incidence dataset.
Raw source: data/raw/india_government/incidence_of_livestock_diseases_in_india.csv
Target processed output: data/processed/india_government/india_disease_incidence_processed.csv
"""

import os
import json
import pandas as pd
import numpy as np

RAW_CSV_PATH = "data/raw/india_government/incidence_of_livestock_diseases_in_india.csv"
PROCESSED_CSV_PATH = "data/processed/india_government/india_disease_incidence_processed.csv"
PROCESSED_JSON_PATH = "data/processed/india_government/india_disease_incidence_processed.json"
SUMMARY_JSON_PATH = "data/processed/india_government/disease_longitudinal_summary.json"


def load_raw_incidence_data(file_path: str = RAW_CSV_PATH) -> pd.DataFrame:
    """
    Reads the raw incidence CSV and checks basic schema integrity.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Raw government incidence file not found at: {file_path}")

    df = pd.read_csv(file_path)
    required_cols = {"Disease", "Species_Affected", "Year", "Outbreaks", "Attacks", "Deaths"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in {file_path}: {missing}")

    return df


def validate_and_enrich_incidence(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates numeric ranges, handles edge cases, and computes key epidemiological metrics:
    - Case Fatality Rate (CFR %): (Deaths / Attacks) * 100
    - Attacks per Outbreak: Attacks / Outbreaks
    """
    df_clean = df.copy()

    # Data validation
    assert (df_clean["Year"] >= 2000).all(), "Found invalid year < 2000"
    assert (df_clean["Outbreaks"] >= 0).all(), "Found negative outbreaks"
    assert (df_clean["Attacks"] >= 0).all(), "Found negative attacks/cases"
    assert (df_clean["Deaths"] >= 0).all(), "Found negative deaths"
    assert (df_clean["Deaths"] <= df_clean["Attacks"]).all(), "Found Deaths > Attacks in historical record"

    # Compute Case Fatality Rate (CFR %)
    df_clean["Case_Fatality_Rate_Pct"] = np.where(
        df_clean["Attacks"] > 0,
        np.round((df_clean["Deaths"] / df_clean["Attacks"]) * 100.0, 2),
        0.0
    )

    # Compute Attacks per Outbreak (Morbidity density per outbreak cluster)
    df_clean["Attacks_Per_Outbreak"] = np.where(
        df_clean["Outbreaks"] > 0,
        np.round(df_clean["Attacks"] / df_clean["Outbreaks"], 1),
        0.0
    )

    # Standardize Disease Taxonomy
    disease_map = {
        "Foot and Mouth Disease": "Foot-and-Mouth Disease (FMD)",
        "Haemorrhagic Septicaemia": "Haemorrhagic Septicaemia (HS)",
        "Black Quarter": "Black Quarter (BQ)",
        "Anthrax": "Anthrax",
        "Sheep and Goat Pox": "Sheep and Goat Pox (SGP)",
        "Enterotoxaemia": "Enterotoxaemia (ET)",
        "Classical Swine Fever": "Classical Swine Fever (CSF)",
        "Rabies": "Rabies"
    }
    df_clean["Standardized_Disease"] = df_clean["Disease"].map(lambda x: disease_map.get(x, x))
    df_clean["Source"] = "OGD India / MOSPI / DAHD Historical Series"
    df_clean["Temporal_Role"] = "Historical Epidemiological Baseline"

    return df_clean


def generate_longitudinal_summary(df: pd.DataFrame) -> dict:
    """
    Generates longitudinal disease benchmarks across the 2005-2011 baseline window.
    """
    summary = {}
    for disease, group in df.groupby("Standardized_Disease"):
        total_outbreaks = int(group["Outbreaks"].sum())
        total_attacks = int(group["Attacks"].sum())
        total_deaths = int(group["Deaths"].sum())
        overall_cfr = round((total_deaths / total_attacks) * 100.0, 2) if total_attacks > 0 else 0.0
        peak_year = int(group.loc[group["Outbreaks"].idxmax()]["Year"])
        
        summary[disease] = {
            "species_affected": group["Species_Affected"].iloc[0],
            "total_outbreaks_2005_2011": total_outbreaks,
            "total_cases_2005_2011": total_attacks,
            "total_deaths_2005_2011": total_deaths,
            "mean_case_fatality_rate_pct": overall_cfr,
            "peak_outbreak_year": peak_year
        }
    return summary


def run_india_gov_pipeline() -> pd.DataFrame:
    """
    Executes raw loading, validation, enrichment, and processed file output.
    """
    os.makedirs(os.path.dirname(PROCESSED_CSV_PATH), exist_ok=True)
    
    print(f"[India Gov Loader] Reading raw incidence data from: {RAW_CSV_PATH}")
    df_raw = load_raw_incidence_data()
    print(f"[India Gov Loader] Loaded {len(df_raw)} historical records.")
    
    df_processed = validate_and_enrich_incidence(df_raw)
    
    # Save processed CSV
    df_processed.to_csv(PROCESSED_CSV_PATH, index=False)
    print(f"[India Gov Loader] Saved processed CSV to: {PROCESSED_CSV_PATH}")
    
    # Save processed JSON
    records = df_processed.to_dict(orient="records")
    with open(PROCESSED_JSON_PATH, "w") as f:
        json.dump(records, f, indent=2)
    print(f"[India Gov Loader] Saved structured JSON to: {PROCESSED_JSON_PATH}")
    
    # Generate and save longitudinal summary
    summary = generate_longitudinal_summary(df_processed)
    with open(SUMMARY_JSON_PATH, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"[India Gov Loader] Saved disease summary to: {SUMMARY_JSON_PATH}")
    
    return df_processed


if __name__ == "__main__":
    df = run_india_gov_pipeline()
    print("\n--- Processed Indian Government Disease Incidence (Sample) ---")
    print(df[["Standardized_Disease", "Year", "Outbreaks", "Attacks", "Deaths", "Case_Fatality_Rate_Pct"]].head(8))
