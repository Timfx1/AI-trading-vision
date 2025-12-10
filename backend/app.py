import os
import io
import base64
import random
import threading

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import cv2
import numpy as np

# --------------------------
# DeepSeek API
# --------------------------
from deepseek import DeepSeekAPI
deep_client = DeepSeekAPI(api_key=os.getenv("DEEPSEEK_API_KEY"))

# --------------------------
# FLASK INIT
# --------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --------------------------
# Dummy ML model (TensorFlow removed)
# --------------------------
MODEL = None
MODEL_LOCK = threading.Lock()
TF_OK = False  # No TensorFlow on Render


# --------------------------
# /api/predict  (dummy)
# --------------------------
@app.post("/api/predict")
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Need image"}), 400

    # Generate a random fake prediction
    conf = round(random.uniform(0.55, 0.95), 3)
    label = "valid" if random.random() > 0.5 else "invalid"

    return jsonify({
        "label": label,
        "confidence": conf,
        "note": "TensorFlow disabled — using simulated prediction"
    })


# --------------------------
# /api/llm/label  (DeepSeek)
# --------------------------
@app.post("/api/llm/label")
def llm_label():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    img_bytes = request.files["image"].read()
    b64 = base64.b64encode(img_bytes).decode("utf-8")

    prompt = """
    You are a professional trading analyst.
    Analyze this chart. Respond EXACTLY in this format:

    Pattern: ...
    Trend: ...
    Entry Logic: ...
    Risk: ...
    Grade: A/B/C
    """

    try:
        response = deep_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Chart pattern analyst"},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url",
                         "image_url": f"data:image/png;base64,{b64}"}
                    ]
                }
            ]
        )

        text = response.choices[0].message["content"].strip()
        pattern = text.split("\n")[0]

        return jsonify({
            "pattern": pattern,
            "reason": text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.post("/api/llm/label")
def llm_label():
    # Return dummy response for now
    return jsonify({
        "pattern": "Bullish Flag Pattern",
        "reason": "Pattern: Bullish Flag\nTrend: Upward\nEntry Logic: Break above resistance\nRisk: Medium\nGrade: B"
    })


# --------------------------
# Fake /api/similar
# --------------------------
@app.post("/api/similar")
def similar_simple():
    return jsonify([
        {"path": "dummy1.png", "distance": 0.12},
        {"path": "dummy2.png", "distance": 0.20},
    ])


# --------------------------
# Fake /api/similar_smart
# --------------------------
@app.post("/api/similar_smart")
def similar_smart():
    return jsonify([
        {"path": "smart1.png", "distance": 0.08},
        {"path": "smart2.png", "distance": 0.15},
    ])


# --------------------------
# Fake /api/extract_levels
# --------------------------
@app.post("/api/extract_levels")
def extract_levels():
    return jsonify({
        "sl": "181.200",
        "tp1": "182.450",
        "tp2": "183.900"
    })


# --------------------------
# Home endpoint
# --------------------------
@app.get("/")
def home():
    return {"status": "backend running", "service": "AI Trading Vision"}


# --------------------------
# Run app (Render uses PORT)
# --------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Render uses dynamic port
    app.run(host="0.0.0.0", port=port)
