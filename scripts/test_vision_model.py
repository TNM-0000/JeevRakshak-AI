#!/usr/bin/env python3
"""
scripts/test_vision_model.py
CLI test runner for local inference on pretrained EfficientNet-B3 cattle disease model.
Accepts an image path and outputs structured JSON evidence.
"""

import sys
import os
import argparse
import json

# Ensure project root is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.vision.inference import predict_cattle_image, DEFAULT_MODEL_PATH


def main():
    parser = argparse.ArgumentParser(
        description="Run local inference using pretrained EfficientNet-B3 cattle disease model."
    )
    parser.add_argument(
        "--image",
        type=str,
        default="data/images/cow_healthy_reference.jpg",
        help="Path to cattle image file (JPG, PNG, WEBP)."
    )
    parser.add_argument(
        "--model-path",
        type=str,
        default=DEFAULT_MODEL_PATH,
        help="Path to pretrained .keras model weights."
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        default=True,
        help="Print indented formatted JSON output."
    )

    args = parser.parse_args()

    if not os.path.exists(args.image):
        print(f"Error: Target image file not found: {args.image}", file=sys.stderr)
        sys.exit(1)

    try:
        result = predict_cattle_image(args.image, model_path=args.model_path)
        indent = 2 if args.pretty else None
        print(json.dumps(result, indent=indent))
    except Exception as e:
        print(f"Inference execution failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
