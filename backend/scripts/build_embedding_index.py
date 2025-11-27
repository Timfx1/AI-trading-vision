import os, pickle, numpy as np, tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tqdm import tqdm

# --- Paths ---
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
OUT_PATH = os.path.join(BASE_DIR, "data", "embedding_index.pkl")
MODEL_PATH = os.path.join(BASE_DIR, "outputs", "model.keras")

IMG_SIZE = (224, 224)

def build_index():
    if not os.path.exists(MODEL_PATH):
        print("❌ No model.keras found. Train or copy your model to outputs/.")
        return

    print(f"📂 Loading model from {MODEL_PATH} ...")
    model = load_model(MODEL_PATH)

    # --- Ensure model is built (for Sequential models) ---
    if not hasattr(model, "inputs"):
        dummy = tf.zeros((1, 224, 224, 3))
        model(dummy, training=False)
        print("🧠 Model graph initialized with dummy input.")

    # --- Try both .input and .inputs safely ---
    model_input = getattr(model, "input", None)
    if model_input is None:
        model_input = model.inputs

    # --- Build embedder using penultimate layer ---
    try:
        embedder = tf.keras.Model(
            inputs=model_input,
            outputs=model.layers[-2].output
        )
    except Exception as e:
        print(f"⚠️ Failed to create embedder: {e}")
        return

    entries = []
    print(f"📸 Scanning dataset in {DATASET_DIR}...")

    for label in ["valid_setup", "invalid_setup"]:
        folder = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(folder):
            continue
        for fname in tqdm(os.listdir(folder), desc=label):
            if not fname.lower().endswith((".png", ".jpg", ".jpeg")):
                continue
            path = os.path.join(folder, fname)
            try:
                img = image.load_img(path, target_size=IMG_SIZE)
                arr = image.img_to_array(img) / 255.0
                arr = np.expand_dims(arr, 0)
                emb = embedder.predict(arr, verbose=0)[0]
                entries.append({
                    "path": path,
                    "embedding": emb,
                    "label": label
                })
            except Exception as e:
                print(f"⚠️ skip {fname}: {e}")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    pickle.dump(entries, open(OUT_PATH, "wb"))
    print(f"✅ Saved {len(entries)} embeddings → {OUT_PATH}")

if __name__ == "__main__":
    build_index()
