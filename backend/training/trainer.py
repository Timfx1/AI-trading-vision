import os, threading, time, json, random
import tensorflow as tf
import numpy as np
from PIL import Image
from datetime import datetime

TRAIN_STATUS = {
    "running": False,
    "progress": 0,
    "message": "idle",
    "history": []
}

DATASET_DIR = "dataset"
OUTPUT_DIR = "outputs"

def load_images(label_folder):
    files = []
    for root, dirs, fs in os.walk(label_folder):
        for f in fs:
            if f.lower().endswith((".png", ".jpg", ".jpeg")):
                files.append(os.path.join(root, f))
    return files


def preprocess_image(path):
    img = Image.open(path).convert("RGB").resize((224, 224))
    arr = np.array(img) / 255.0
    return arr


def build_model():
    base = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3), include_top=False, pooling="avg"
    )
    x = tf.keras.layers.Dense(128, activation="relu")(base.output)
    out = tf.keras.layers.Dense(1, activation="sigmoid")(x)
    model = tf.keras.Model(base.input, out)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-4),
        loss="binary_crossentropy",
        metrics=["accuracy"]
    )
    return model


def training_thread():
    TRAIN_STATUS["running"] = True
    TRAIN_STATUS["progress"] = 1
    TRAIN_STATUS["message"] = "Scanning dataset…"

    valid_paths = load_images(os.path.join(DATASET_DIR, "valid_setup"))
    invalid_paths = load_images(os.path.join(DATASET_DIR, "invalid_setup"))

    all_paths = [(p, 1) for p in valid_paths] + [(p, 0) for p in invalid_paths]

    if len(all_paths) < 20:
        TRAIN_STATUS["running"] = False
        TRAIN_STATUS["message"] = "Not enough images to train."
        return

    random.shuffle(all_paths)

    X = []
    y = []

    TRAIN_STATUS["message"] = "Loading images…"
    for i, (p, label) in enumerate(all_paths):
        TRAIN_STATUS["progress"] = int((i / len(all_paths)) * 30)
        X.append(preprocess_image(p))
        y.append(label)

    X = np.array(X, dtype="float32")
    y = np.array(y, dtype="float32")

    TRAIN_STATUS["message"] = "Building model…"
    TRAIN_STATUS["progress"] = 40
    model = build_model()

    TRAIN_STATUS["message"] = "Training model…"
    history = model.fit(
        X, y, epochs=6, batch_size=16, verbose=0,
        callbacks=[
            tf.keras.callbacks.LambdaCallback(
                on_epoch_end=lambda e, logs: TRAIN_STATUS.update({
                    "progress": 40 + int((e+1) / 6 * 50),
                    "message": f"Epoch {e+1}/6 - acc={logs['accuracy']:.2f}"
                })
            )
        ]
    )

    TRAIN_STATUS["message"] = "Saving model…"
    TRAIN_STATUS["progress"] = 95

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    save_path = os.path.join(OUTPUT_DIR, "model_v2.keras")
    model.save(save_path)

    TRAIN_STATUS["message"] = "Training completed."
    TRAIN_STATUS["progress"] = 100
    TRAIN_STATUS["running"] = False

    TRAIN_STATUS["history"].append({
        "timestamp": datetime.now().isoformat(),
        "samples": len(all_paths),
        "acc": float(history.history["accuracy"][-1]),
        "model": save_path
    })
