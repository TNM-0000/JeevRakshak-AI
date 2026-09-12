# Pretrained Models Directory

## Model: EfficientNet-B3 Cattle Disease Classifier

- **Hugging Face Repository**: [`xprotocol/EfficientNet-B3-Cattle-Disease`](https://huggingface.co/xprotocol/EfficientNet-B3-Cattle-Disease)
- **Base Architecture**: EfficientNet-B3 (ImageNet pre-trained backbone)
- **Input Dimensions**: 300 × 300 × 3 (RGB, normalized [0, 1] or [0, 255])
- **Classification Head**: Global Average Pooling → Batch Normalization → Dropout(0.3) → Dense(256, ReLU) → Dropout(0.2) → Dense(3, Softmax)
- **Target Classes**:
  - `0`: `foot-and-mouth`
  - `1`: `healthy`
  - `2`: `lumpy`
- **Training Strategy**: Two-phase transfer learning (frozen backbone for 50 epochs, top-3 blocks unfrozen for 30 epochs with AdamW + Cosine Annealing and Focal Loss).
- **Training Dataset**: [`devang03mgr/cattle-diseases-datasets`](https://www.kaggle.com/datasets/devang03mgr/cattle-diseases-datasets) (Kaggle, ODbL 1.0)
- **License**: Apache-2.0
- **Reported Test Metrics**:
  - Test Accuracy: 94.82%
  - Macro F1: 0.9168
  - Macro AUC-ROC: 0.9894

## How to Download Weights
Run the automated downloader:
```bash
python3 models/download_vision_model.py
```
This saves `models/efficientnet_b3_best.keras` (~122 MB).
