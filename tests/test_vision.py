"""
tests/test_vision.py
Tests for pretrained vision model inference and output structure.
"""

import os
import pytest
from src.vision.inference import predict_cattle_image, CLASS_NAMES, DEFAULT_MODEL_PATH


@pytest.mark.skipif(not os.path.exists(DEFAULT_MODEL_PATH), reason="Model weights not yet downloaded")
def test_vision_inference_output_contract():
    test_img = "data/images/cow_healthy_reference.jpg"
    assert os.path.exists(test_img), f"Test image {test_img} must exist"

    result = predict_cattle_image(test_img)

    # Output contract verification
    assert "model_name" in result
    assert "predicted_class" in result
    assert "confidence" in result
    assert "class_probabilities" in result
    assert result["predicted_class"] in CLASS_NAMES
    assert 0.0 <= result["confidence"] <= 1.0

    # Probabilities must sum to ~1.0
    prob_sum = sum(result["class_probabilities"].values())
    assert pytest.approx(prob_sum, abs=1e-3) == 1.0

    # Disclaimer must be present
    assert "clinical_disclaimer" in result
    assert "not constitute a confirmed veterinary diagnosis" in result["clinical_disclaimer"].lower()
