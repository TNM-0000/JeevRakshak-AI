#!/usr/bin/env python3
"""
scripts/run_assessment.py
Standalone CLI Runner for JeevRakshak AI (Phase 2).
Executes end-to-end evidence fusion and generates canonical assessment JSON.
Usage:
    python scripts/run_assessment.py --text "My two cows have high fever and skin lumps on neck." \
        --image data/images/cow_lumpy_skin_clinical_nodules.jpg \
        --state "Karnataka" --district "Bengaluru Rural"
"""

import sys
import os
import argparse
import json

# Ensure project root is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.assessment.engine import run_full_assessment


def main():
    parser = argparse.ArgumentParser(
        description="JeevRakshak AI — Standalone Veterinary Decision-Support Engine."
    )
    parser.add_argument(
        "--text",
        type=str,
        required=True,
        help="Free-form clinical narrative reported by farmer or field worker."
    )
    parser.add_argument(
        "--image",
        type=str,
        default=None,
        help="Optional path to photographic cattle image (JPG, PNG, WEBP)."
    )
    parser.add_argument(
        "--state",
        type=str,
        default=None,
        help="Administrative State or Union Territory in India."
    )
    parser.add_argument(
        "--district",
        type=str,
        default=None,
        help="Administrative district name."
    )
    parser.add_argument(
        "--species",
        type=str,
        default=None,
        help="Host animal species override (default: inferred from text or 'cattle')."
    )
    parser.add_argument(
        "--affected-count",
        type=int,
        default=None,
        help="Explicit affected animal count override."
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Optional file path to save output JSON."
    )
    parser.add_argument(
        "--compact",
        action="store_true",
        help="Output minified JSON instead of indented formatted JSON."
    )

    args = parser.parse_args()

    try:
        assessment = run_full_assessment(
            text=args.text,
            image_path=args.image,
            state=args.state,
            district=args.district,
            species_override=args.species,
            affected_count_override=args.affected_count
        )

        indent = None if args.compact else 2
        json_output = assessment.model_dump_json(indent=indent)

        if args.output:
            with open(args.output, "w") as f:
                f.write(json_output)
            print(f"Assessment saved to: {args.output}", file=sys.stderr)

        print(json_output)

    except Exception as e:
        print(f"Assessment execution failed: {type(e).__name__}: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
