from __future__ import annotations
import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras import layers, models
import os

# --- Paths ---
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- Parameters ---
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 5

print(f"📁 Loading dataset from {DATASET_DIR}")

train_ds = image_dataset_from_directory(
    DATASET_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary"
)

# Normalize
train_ds = train_ds.map(lambda x, y: (x / 255.0, y))

# --- Define CNN with explicit Input layer ---
inputs = layers.Input(shape=IMG_SIZE + (3,))
x = layers.Conv2D(32, (3, 3), activation="relu")(inputs)
x = layers.MaxPooling2D(2, 2)(x)
x = layers.Conv2D(64, (3, 3), activation="relu")(x)
x = layers.MaxPooling2D(2, 2)(x)
x = layers.Conv2D(128, (3, 3), activation="relu")(x)
x = layers.Flatten()(x)
x = layers.Dense(128, activation="relu")(x)
outputs = layers.Dense(1, activation="sigmoid")(x)

model = tf.keras.Model(inputs, outputs)

model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

print("🚀 Starting training...")
model.fit(train_ds, epochs=EPOCHS)

# --- Save model with fully defined input ---
model_path = os.path.join(OUTPUT_DIR, "model.keras")
model.save(model_path)
print(f"✅ Model saved successfully → {model_path}")
