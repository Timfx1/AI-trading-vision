# backend/llm/metadata_saver.py
import os
import json
from datetime import datetime

DATASET_DIR = os.path.join(os.getcwd(), "dataset")

def save_labeled_item(img_bytes: bytes, metadata: dict):
    """Create dataset/<ID>/img.png + label.json folder."""
    if not os.path.exists(DATASET_DIR):
        os.makedirs(DATASET_DIR)

    # Unique ID based on timestamp
    uid = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

    folder = os.path.join(DATASET_DIR, uid)
    os.makedirs(folder)

    # Save image
    img_path = os.path.join(folder, "img.png")
    with open(img_path, "wb") as f:
        f.write(img_bytes)

    # Save metadata
    meta_path = os.path.join(folder, "label.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=4)

    return {
        "id": uid,
        "image_path": img_path,
        "metadata_path": meta_path
    }
