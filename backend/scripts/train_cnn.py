"""
Training script for Timfx1 AI Trading Vision
Uses:
- dataset/<id>/img.png
- dataset/<id>/label.json
"""

import os
import json
import numpy as np
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.layers import Dense, Dropout, Flatten, Input, Conv2D, MaxPooling2D
from tensorflow.keras.optimizers import Adam

DATASET_DIR = "dataset"
IMG_SIZE = (224, 224)

def load_dataset():
    images = []
    labels_validity = []
    labels_pattern = []

    for folder in os.listdir(DATASET_DIR):
        full = os.path.join(DATASET_DIR, folder)
        if not os.path.isdir(full): continue

        img_path = os.path.join(full, "img.png")
        label_path = os.path.join(full, "label.json")
        if not os.path.exists(img_path) or not os.path.exists(label_path):
            continue

        # load image
        img = load_img(img_path, target_size=IMG_SIZE)
        img = img_to_array(img) / 255.0
        images.append(img)

        with open(label_path, "r") as f:
            meta = json.load(f)

        labels_validity.append(meta.get("validity", "unknown"))
        labels_pattern.append(meta.get("pattern", "unknown"))

    return np.array(images), labels_validity, labels_pattern


def build_cnn():
    model = Sequential([
        Input(shape=(224, 224, 3)),
        Conv2D(32, (3,3), activation="relu"),
        MaxPooling2D(),
        Conv2D(64, (3,3), activation="relu"),
        MaxPooling2D(),
        Conv2D(128, (3,3), activation="relu"),
        MaxPooling2D(),
        Flatten(),
        Dense(256, activation="relu"),
        Dropout(0.3),
        Dense(128, activation="relu", name="embedding_layer"),  # embeddings
    ])

    return model


def train():
    X, y_validity, y_pattern = load_dataset()

    # Encode labels
    enc_valid = LabelEncoder()
    enc_pattern = LabelEncoder()

    y_valid = enc_valid.fit_transform(y_validity)
    y_pat = enc_pattern.fit_transform(y_pattern)

    # CNN backbone
    base = build_cnn()

    # final classification heads
    out_valid = Dense(len(enc_valid.classes_), activation="softmax", name="validity_output")(base.output)
    out_pat = Dense(len(enc_pattern.classes_), activation="softmax", name="pattern_output")(base.output)

    model = Model(inputs=base.input, outputs=[out_valid, out_pat])
    model.compile(
        optimizer=Adam(1e-4),
        loss={"validity_output": "sparse_categorical_crossentropy",
              "pattern_output": "sparse_categorical_crossentropy"},
        metrics={"validity_output": "accuracy", "pattern_output": "accuracy"},
    )

    model.fit(
        X,
        {"validity_output": y_valid, "pattern_output": y_pat},
        epochs=12,
        batch_size=16,
        validation_split=0.1,
    )

    os.makedirs("outputs", exist_ok=True)

    model.save("outputs/model_cnn.h5")

    # embedding model (smart vision)
    embedding_model = Model(
        inputs=model.input,
        outputs=model.get_layer("embedding_layer").output,
    )
    embedding_model.save("outputs/embeddings_model.h5")

    print("Training complete. Models saved in backend/outputs/")

if __name__ == "__main__":
    train()
