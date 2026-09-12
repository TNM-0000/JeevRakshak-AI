#!/usr/bin/env python3
"""
download_vision_model.py
Downloads the pretrained EfficientNet-B3 cattle disease model from Hugging Face:
Repo: xprotocol/EfficientNet-B3-Cattle-Disease
File: efficientnet_b3_best.keras (~122 MB)
License: Apache-2.0
"""

import os
import sys
import urllib.request
import hashlib

MODEL_URL = "https://huggingface.co/xprotocol/EfficientNet-B3-Cattle-Disease/resolve/main/efficientnet_b3_best.keras"
MODELS_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODELS_DIR, "efficientnet_b3_best.keras")
EXPECTED_MIN_BYTES = 120_000_000  # ~122 MB


def download_progress_hook(block_num, block_size, total_size):
    downloaded = block_num * block_size
    if total_size > 0:
        percent = min(100.0, downloaded * 100.0 / total_size)
        mb_down = downloaded / (1024 * 1024)
        mb_total = total_size / (1024 * 1024)
        print(f"\rDownloading model weights: {percent:.1f}% ({mb_down:.1f} MB / {mb_total:.1f} MB)", end="", flush=True)
    else:
        mb_down = downloaded / (1024 * 1024)
        print(f"\rDownloading model weights: {mb_down:.1f} MB", end="", flush=True)


def download_model(force: bool = False) -> str:
    """
    Downloads efficientnet_b3_best.keras if not already present.
    Returns the absolute path to the downloaded model.
    """
    if os.path.exists(MODEL_PATH) and not force:
        size = os.path.getsize(MODEL_PATH)
        if size >= EXPECTED_MIN_BYTES:
            print(f"Pretrained vision model already exists at: {MODEL_PATH} ({size / (1024*1024):.1f} MB)")
            return MODEL_PATH
        else:
            print(f"Existing model file appears incomplete ({size} bytes). Re-downloading...")

    print(f"Fetching pretrained model from: {MODEL_URL}")
    print(f"Destination: {MODEL_PATH}")
    
    import requests
    response = requests.get(MODEL_URL, stream=True, timeout=60, headers={
        "User-Agent": "JeevRakshak-AI/1.0 (Research; Cattle Disease Detection)"
    })
    response.raise_for_status()
    total_size = int(response.headers.get("Content-Length", 0))
    block_size = 1024 * 1024  # 1 MB blocks
    downloaded = 0
    with open(MODEL_PATH, "wb") as out_file:
        for chunk in response.iter_content(chunk_size=block_size):
            if chunk:
                out_file.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = min(100.0, downloaded * 100.0 / total_size)
                    print(f"\rDownloading model weights: {percent:.1f}% ({downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB)", end="", flush=True)
                else:
                    print(f"\rDownloading: {downloaded / (1024*1024):.1f} MB", end="", flush=True)

    print("\nDownload complete.")
    final_size = os.path.getsize(MODEL_PATH)
    print(f"Saved to: {MODEL_PATH} ({final_size / (1024*1024):.1f} MB)")
    return MODEL_PATH


if __name__ == "__main__":
    force_flag = "--force" in sys.argv
    download_model(force=force_flag)
