"""
Build Simple + Smart embedding indexes
"""

import os
import json
import numpy as np
from PIL import Image
import imagehash
import faiss
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

DATASET_DIR = "dataset"
IMG_SIZE = (224, 224)

def load_embeddings_model():
    return load_model("outputs/embeddings_model.h5")


def build_simple_hash_index():
    index = {}
    for folder in os.listdir(DATASET_DIR):
        path = os.path.join(DATASET_DIR, folder)
        img_file = os.path.join(path, "img.png")
        if not os.path.exists(img_file): continue

        img = Image.open(img_file)
        phash = str(imagehash.phash(img))
        index[folder] = phash

    with open("outputs/simple_hash_index.json", "w") as f:
        json.dump(index, f, indent=2)

    print("Simple hash index built.")


def build_smart_embedding_index(model):
    vectors = []
    ids = []

    for folder in os.listdir(DATASET_DIR):
        path = os.path.join(DATASET_DIR, folder)
        img_file = os.path.join(path, "img.png")
        if not os.path.exists(img_file): continue

        img = Image.open(img_file).resize(IMG_SIZE)
        arr = img_to_array(img) / 255.0
        arr = np.expand_dims(arr, 0)

        emb = model.predict(arr)[0]
        vectors.append(emb)
        ids.append(folder)

    vectors = np.array(vectors).astype("float32")

    dimension = vectors.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(vectors)

    faiss.write_index(index, "outputs/faiss.index")

    with open("outputs/dataset_map.json", "w") as f:
        json.dump(ids, f, indent=2)

    print("FAISS index built with", len(ids), "items.")


if __name__ == "__main__":
    model = load_embeddings_model()
    build_simple_hash_index()
    build_smart_embedding_index(model)
