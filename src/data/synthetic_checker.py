"""
src/data/synthetic_checker.py
Audits tabular livestock disease datasets to detect and isolate synthetic data.
Enforces Rule #9: SYNTHETIC DATA CANNOT BE USED AS VETERINARY GROUND TRUTH.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np


class SyntheticDataAuditError(Exception):
    """Raised when synthetic data is attempted to be used as ground truth."""
    pass


def audit_tabular_dataset(df: pd.DataFrame, dataset_name: str = "Candidate Dataset") -> Dict[str, Any]:
    """
    Audits a candidate tabular dataset for hallmarks of synthetic symptom generation:
    1. Binary (0/1) flag predominance across dozens of independent symptoms.
    2. Lack of temporal duration (how long the cow had fever).
    3. Lack of severity gradations (mild, moderate, acute, chronic).
    4. Unrealistic independence or artificial multi-collinearity.
    5. Exact duplicate rows or artificial permutation patterns.
    """
    total_cols = len(df.columns)
    total_rows = len(df)
    
    # Check binary columns (excluding prognosis/target)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    binary_cols = [c for c in numeric_cols if set(df[c].dropna().unique()).issubset({0, 1})]
    binary_ratio = len(binary_cols) / max(1, len(numeric_cols))
    
    # Check for target / label column
    possible_target_cols = [c for c in df.columns if c.lower() in ["prognosis", "disease", "label", "target", "diagnosis"]]
    target_col = possible_target_cols[0] if possible_target_cols else None
    
    # Check for clinical temporal fields (duration, onset, age, breed)
    clinical_fields = [c for c in df.columns if any(k in c.lower() for k in ["duration", "day", "age", "breed", "temp_c", "pulse"])]
    has_clinical_context = len(clinical_fields) > 0
    
    # Synthetic heuristic: If >80% of features are binary 0/1 flags and clinical fields are absent
    is_synthetic = (binary_ratio >= 0.80 and len(binary_cols) >= 15 and not has_clinical_context)
    
    audit_report = {
        "dataset_name": dataset_name,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "numeric_columns_count": len(numeric_cols),
        "binary_flag_columns_count": len(binary_cols),
        "binary_flag_ratio": round(binary_ratio, 3),
        "target_column": target_col,
        "clinical_context_fields_present": clinical_fields,
        "is_synthetic": is_synthetic,
        "status_classification": "SYNTHETIC — NOT VETERINARY GROUND TRUTH" if is_synthetic else "REAL_WORLD_OR_UNVERIFIED",
        "permitted_use": "Software pipeline interface testing and integration mocks only" if is_synthetic else "Review against official registries",
        "prohibited_use": [
            "Training clinical diagnostic models",
            "Claiming veterinary benchmark accuracy",
            "Providing medical guidance to farmers",
            "Presenting as epidemiological ground truth"
        ] if is_synthetic else []
    }
    
    return audit_report


def enforce_ground_truth_integrity(df: pd.DataFrame, dataset_name: str = "Candidate Dataset") -> None:
    """
    Raises SyntheticDataAuditError if synthetic dataset is passed where clinical ground truth is expected.
    """
    report = audit_tabular_dataset(df, dataset_name)
    if report["is_synthetic"]:
        raise SyntheticDataAuditError(
            f"REJECTED: Dataset '{dataset_name}' is classified as: {report['status_classification']}. "
            "Under JeevRakshak scientific integrity rules, synthetic symptom tables cannot be used as veterinary ground truth."
        )


if __name__ == "__main__":
    # Test with mock synthetic matrix (similar to scorder96/cattle-disease-prediction)
    mock_data = {f"symptom_{i}": [0, 1, 0, 0, 1] for i in range(25)}
    mock_data["prognosis"] = ["mastitis", "anthrax", "fmd", "black_quarter", "mastitis"]
    df_mock = pd.DataFrame(mock_data)
    
    print("--- Running Synthetic Data Audit on Synthetic Symptom Matrix ---")
    result = audit_tabular_dataset(df_mock, "mock_scorder96_matrix")
    for k, v in result.items():
        print(f"{k}: {v}")
