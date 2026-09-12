"""
src/vision/inference.py
Pretrained Vision Model Inference Wrapper for JeevRakshak AI.
Model: xprotocol/EfficientNet-B3-Cattle-Disease (Hugging Face)
Target Classes: ['foot-and-mouth', 'healthy', 'lumpy']
Role: IMAGE -> VISUAL EVIDENCE (NOT CONFIRMED MEDICAL DIAGNOSIS)
"""

import os
import hashlib
from typing import Dict, Any, Union, Optional, Tuple
import numpy as np
from PIL import Image, UnidentifiedImageError

# Ensure PyTorch backend for Keras 3
os.environ["KERAS_BACKEND"] = "torch"
import keras
from src.common.schema import VisualAnalysis

CLASS_NAMES = ["foot-and-mouth", "healthy", "lumpy"]
DEFAULT_MODEL_PATH = "models/efficientnet_b3_best.keras"
MODEL_NAME = "xprotocol/EfficientNet-B3-Cattle-Disease"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


@keras.saving.register_keras_serializable(package="Custom", name="EfficientNetPreprocess")
class EfficientNetPreprocess(keras.layers.Layer):
    """
    Custom preprocessing layer embedded in xprotocol/EfficientNet-B3-Cattle-Disease.
    Standardizes input tensors using keras.applications.efficientnet.preprocess_input.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def call(self, inputs):
        return keras.applications.efficientnet.preprocess_input(inputs)


def validate_image_input(image_path: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    Performs defensive validation of image inputs before feeding into the vision model.
    Detects missing, unsupported, corrupted, or extremely small images.
    """
    if not image_path:
        return False, "No image path provided."

    if not os.path.exists(image_path):
        return False, f"Image file not found: {image_path}"

    ext = os.path.splitext(image_path)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported image format '{ext}'. Supported: {sorted(ALLOWED_EXTENSIONS)}"

    try:
        with Image.open(image_path) as img:
            img.verify()  # Check for header corruption

        # Reopen to inspect dimensions (verify() closes file)
        with Image.open(image_path) as img:
            width, height = img.size
            if width < 64 or height < 64:
                return False, f"Image resolution too small ({width}x{height}). Minimum 64x64 required."
            if width / height > 10.0 or height / width > 10.0:
                return False, f"Extreme aspect ratio ({width}x{height}); likely not an animal field photo."

    except (UnidentifiedImageError, IOError, SyntaxError) as e:
        return False, f"Corrupted or unreadable image file: {type(e).__name__}"

    return True, None


class CattleDiseaseClassifier:
    """
    Inference manager for the pretrained EfficientNet-B3 cattle disease vision model.
    """
    _instance: Optional["CattleDiseaseClassifier"] = None
    _model = None

    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        self.model_path = model_path
        self.model = self._load_model()

    def _load_model(self):
        if CattleDiseaseClassifier._model is not None:
            return CattleDiseaseClassifier._model

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model weights not found at '{self.model_path}'. "
                "Run `python3 models/download_vision_model.py` to download weights from Hugging Face."
            )

        custom_objects = {"EfficientNetPreprocess": EfficientNetPreprocess}
        model = keras.models.load_model(self.model_path, custom_objects=custom_objects, compile=False)
        CattleDiseaseClassifier._model = model
        return model

    @classmethod
    def get_instance(cls, model_path: str = DEFAULT_MODEL_PATH) -> "CattleDiseaseClassifier":
        if cls._instance is None:
            cls._instance = cls(model_path)
        return cls._instance

    def preprocess_image(self, image_input: Union[str, Image.Image]) -> np.ndarray:
        """
        Loads and transforms image to float32 numpy array with shape [1, 300, 300, 3] in [0, 255].
        """
        if isinstance(image_input, str):
            img = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            img = image_input.convert("RGB")
        else:
            raise TypeError("image_input must be a file path string or PIL Image object.")

        img_resized = img.resize((300, 300), Image.Resampling.BILINEAR)
        arr = np.array(img_resized, dtype=np.float32)
        batch = np.expand_dims(arr, axis=0)
        return batch

    def predict(self, image_input: Optional[str]) -> VisualAnalysis:
        """
        Runs local inference and returns typed VisualAnalysis object.
        Guarantees safe failure handling without crashing the caller.
        """
        if not image_input:
            return VisualAnalysis(
                available=False,
                disclaimer="No image provided for visual analysis."
            )

        is_valid, error_msg = validate_image_input(image_input)
        if not is_valid:
            return VisualAnalysis(
                available=False,
                image_sha256=None,
                disclaimer=f"Image validation failed: {error_msg}"
            )

        try:
            # Calculate SHA256 hash for audit trail
            with open(image_input, "rb") as f:
                img_hash = hashlib.sha256(f.read()).hexdigest()

            batch = self.preprocess_image(image_input)
            raw_preds = self.model.predict(batch, verbose=0)
            probs = raw_preds[0]

            best_idx = int(np.argmax(probs))
            predicted_class = CLASS_NAMES[best_idx]
            confidence = float(probs[best_idx])

            class_probabilities = {
                CLASS_NAMES[i]: round(float(probs[i]), 5)
                for i in range(len(CLASS_NAMES))
            }

            return VisualAnalysis(
                available=True,
                model_name=MODEL_NAME,
                architecture="EfficientNet-B3",
                predicted_class=predicted_class,
                confidence=round(confidence, 5),
                class_probabilities=class_probabilities,
                evidence_nature="VISUAL_EVIDENCE_ONLY",
                image_sha256=img_hash,
                disclaimer="Visual classification represents visual feature evidence only; it does NOT constitute a confirmed veterinary diagnosis."
            )
        except Exception as e:
            return VisualAnalysis(
                available=False,
                disclaimer=f"Vision model inference failure: {type(e).__name__} ({str(e)})"
            )


def predict_cattle_image(image_path: Optional[str], model_path: str = DEFAULT_MODEL_PATH) -> VisualAnalysis:
    """
    Convenience function for image inference returning a VisualAnalysis object.
    """
    classifier = CattleDiseaseClassifier.get_instance(model_path)
    return classifier.predict(image_path)


if __name__ == "__main__":
    res = predict_cattle_image("data/images/cow_healthy_reference.jpg")
    print("Inference Result:\n", res.model_dump_json(indent=2))

    res_invalid = predict_cattle_image("non_existent_file.jpg")
    print("\nInvalid File Handling:\n", res_invalid.model_dump_json(indent=2))
