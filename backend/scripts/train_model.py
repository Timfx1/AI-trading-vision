import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

DATASET_DIR = "backend/dataset"
OUTPUT = "backend/outputs/model.keras"

def train():
    print("📘 Loading dataset...")

    datagen = ImageDataGenerator(
        rescale=1/255.0,
        validation_split=0.2,
        rotation_range=5,
        width_shift_range=0.05,
        height_shift_range=0.05,
        zoom_range=0.05,
    )

    train_gen = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(224, 224),
        batch_size=16,
        subset="training"
    )

    val_gen = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(224, 224),
        batch_size=16,
        subset="validation"
    )

    base = tf.keras.applications.EfficientNetB0(
        include_top=False,
        input_shape=(224, 224, 3),
        pooling="avg",
        weights="imagenet"
    )

    x = tf.keras.layers.Dense(128, activation="relu")(base.output)
    out = tf.keras.layers.Dense(1, activation="sigmoid")(x)

    model = tf.keras.Model(inputs=base.input, outputs=out)
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

    print("🚀 Training model...")
    model.fit(train_gen, validation_data=val_gen, epochs=5)

    model.save(OUTPUT)
    print("✅ Model saved:", OUTPUT)

if __name__ == "__main__":
    train()
