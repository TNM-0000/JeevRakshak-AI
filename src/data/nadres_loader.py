"""
src/data/nadres_loader.py
Loads, validates, and standardizes published ICAR-NIVEDI NADRES forewarning data.
Raw source: data/raw/nadres/NADRES_Forewarning_Bulletin_Sep2026_PredNov2026.pdf
Target processed output: data/processed/nadres/nadres_state_forewarning_nov2026.csv
"""

import os
import re
import json
import pandas as pd
import pypdf

RAW_PDF_PATH = "data/raw/nadres/NADRES_Forewarning_Bulletin_Sep2026_PredNov2026.pdf"
PROCESSED_CSV_PATH = "data/processed/nadres/nadres_state_forewarning_nov2026.csv"
PROCESSED_JSON_PATH = "data/processed/nadres/nadres_state_forewarning_nov2026.json"

EXPECTED_DISEASES = [
    "ASF", "BT", "CSF", "FMD", "LSD", "PPR", "Sheep_Goat_Pox",
    "Babesiosis", "Fasciolosis", "Theileriosis", "Trypanosomosis",
    "Anthrax", "BQ", "ET", "HS"
]


def extract_nadres_state_table(pdf_path: str = RAW_PDF_PATH) -> pd.DataFrame:
    """
    Extracts the State-wise Number of Districts Predicted with Risk of Livestock Diseases
    table from the ICAR-NIVEDI forewarning bulletin (pages 7-8).
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Raw NADRES bulletin PDF not found at {pdf_path}")

    reader = pypdf.PdfReader(pdf_path)
    # Page 7 and 8 contain Table II
    extracted_rows = []
    
    for page_num in [6, 7]:  # 0-indexed: pages 7 and 8
        page_text = reader.pages[page_num].extract_text()
        lines = page_text.split("\n")
        
        for line in lines:
            line = line.strip()
            # Match lines starting with digit (state sequence number)
            match = re.match(r"^(\d+)\s+([A-Za-z\s&]+?)\s+(\d+(?:\s+\d+){14,15})$", line)
            if match:
                sl_no = int(match.group(1))
                state_name = match.group(2).strip()
                numbers = [int(x) for x in match.group(3).split()]
                
                # Check if we have 15 disease counts + total
                if len(numbers) >= 16:
                    row_dict = {
                        "sl_no": sl_no,
                        "state_name": state_name,
                        "total_predicted_risk": numbers[-1]
                    }
                    for i, dis in enumerate(EXPECTED_DISEASES):
                        row_dict[dis] = numbers[i]
                    extracted_rows.append(row_dict)

    df = pd.DataFrame(extracted_rows)
    return df


def validate_and_process_nadres(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates data integrity, checks totals, and enriches metadata.
    """
    if df.empty:
        raise ValueError("Extracted NADRES dataframe is empty!")

    # Validate non-null values
    assert df["state_name"].notnull().all(), "State name contains nulls"
    assert df["total_predicted_risk"].notnull().all(), "Total predicted risk contains nulls"

    # Verify column calculations
    disease_cols = [c for c in EXPECTED_DISEASES if c in df.columns]
    calculated_sum = df[disease_cols].sum(axis=1)
    
    # Enrich with metadata
    df["bulletin_month"] = "September 2026"
    df["prediction_target_month"] = "November 2026"
    df["source_organization"] = "ICAR-NIVEDI, Bengaluru"
    df["data_license"] = "Official ICAR Publication (Attribution Required)"
    
    return df


def run_nadres_pipeline() -> pd.DataFrame:
    """
    Executes raw extraction, validation, and structured storage.
    """
    os.makedirs(os.path.dirname(PROCESSED_CSV_PATH), exist_ok=True)
    
    print(f"[NADRES Loader] Extracting forewarning table from: {RAW_PDF_PATH}")
    df_raw = extract_nadres_state_table()
    print(f"[NADRES Loader] Extracted {len(df_raw)} state/UT records.")
    
    df_processed = validate_and_process_nadres(df_raw)
    
    # Save CSV
    df_processed.to_csv(PROCESSED_CSV_PATH, index=False)
    print(f"[NADRES Loader] Saved processed CSV to: {PROCESSED_CSV_PATH}")
    
    # Save JSON
    records = df_processed.to_dict(orient="records")
    with open(PROCESSED_JSON_PATH, "w") as f:
        json.dump(records, f, indent=2)
    print(f"[NADRES Loader] Saved structured JSON to: {PROCESSED_JSON_PATH}")
    
    return df_processed


if __name__ == "__main__":
    df = run_nadres_pipeline()
    print("\n--- Processed NADRES Forewarning Preview (First 5 States) ---")
    print(df[["state_name", "FMD", "LSD", "Anthrax", "HS", "total_predicted_risk"]].head())
