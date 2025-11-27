import os, pickle
from tqdm import tqdm
from PIL import Image
import imagehash

# Define paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
OUT_PATH = os.path.join(BASE_DIR, "data", "image_index.pkl")

def build_index():
    if not os.path.exists(DATASET_DIR):
        print(f"❌ Dataset folder not found: {DATASET_DIR}")
        return

    entries = []
    for label in ["valid_setup", "invalid_setup"]:
        folder = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(folder):
            print(f"⚠️ Folder not found: {folder}")
            continue

        for fname in tqdm(os.listdir(folder), desc=f"Processing {label}"):
            if not fname.lower().endswith((".png", ".jpg", ".jpeg")):
                continue
            path = os.path.join(folder, fname)
            try:
                img = Image.open(path)
                h = imagehash.phash(img)
                entries.append({
                    "path": path,
                    "label": label,
                    "hash": h
                })
            except Exception as e:
                print(f"❌ Skipped {fname}: {e}")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    pickle.dump(entries, open(OUT_PATH, "wb"))
    print(f"✅ Saved {len(entries)} image hashes → {OUT_PATH}")

if __name__ == "__main__":
    build_index()
