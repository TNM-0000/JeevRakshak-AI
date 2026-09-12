"""
tests/test_loaders.py
Unit and integration tests for data loaders, data integrity, and synthetic checking.
"""

import os
import pytest
import pandas as pd
from src.data.nadres_loader import run_nadres_pipeline, RAW_PDF_PATH
from src.data.india_gov_loader import run_india_gov_pipeline, RAW_CSV_PATH as INDIA_RAW_PATH
from src.data.wahis_loader import run_wahis_pipeline, RAW_CSV_PATH as WAHIS_RAW_PATH
from src.data.synthetic_checker import audit_tabular_dataset, enforce_ground_truth_integrity, SyntheticDataAuditError


def test_nadres_pipeline():
    assert os.path.exists(RAW_PDF_PATH), "Raw NADRES PDF must exist"
    df = run_nadres_pipeline()
    assert not df.empty, "Processed NADRES dataframe should not be empty"
    assert "state_name" in df.columns
    assert "total_predicted_risk" in df.columns
    assert (df["total_predicted_risk"] >= 0).all()


def test_india_gov_pipeline():
    assert os.path.exists(INDIA_RAW_PATH), "Raw India Gov CSV must exist"
    mtime_before = os.path.getmtime(INDIA_RAW_PATH)
    df = run_india_gov_pipeline()
    mtime_after = os.path.getmtime(INDIA_RAW_PATH)
    
    # Raw file must NOT be altered
    assert mtime_before == mtime_after, "Raw CSV must remain strictly unaltered"
    assert not df.empty
    assert "Case_Fatality_Rate_Pct" in df.columns
    assert (df["Case_Fatality_Rate_Pct"] >= 0).all()


def test_wahis_pipeline():
    assert os.path.exists(WAHIS_RAW_PATH), "Raw WAHIS CSV must exist"
    df = run_wahis_pipeline()
    assert not df.empty
    assert "Country" in df.columns
    assert "Case_Fatality_Rate_Pct" in df.columns


def test_synthetic_checker():
    # Synthetic symptom binary matrix
    mock_synthetic = pd.DataFrame({
        f"sym_{i}": [0, 1, 0, 1] for i in range(20)
    })
    mock_synthetic["prognosis"] = ["fmd", "mastitis", "anthrax", "healthy"]
    
    audit = audit_tabular_dataset(mock_synthetic, "test_synthetic")
    assert audit["is_synthetic"] is True
    assert "SYNTHETIC" in audit["status_classification"]

    with pytest.raises(SyntheticDataAuditError):
        enforce_ground_truth_integrity(mock_synthetic, "test_synthetic")
