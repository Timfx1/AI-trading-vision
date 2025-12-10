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
# Dummy ML MODEL (placeholder)
# --------------------------
MODEL = None
MODEL_LOCK = threading.Lock()
TF_OK = False   # You disabled TensorFlow earlier


# --------------------------
# Simulated CNN predict
# --------------------------
# @app.post("/api/predict")
# def predict():
#     if "image" not in request.files:
#         return jsonify({"error": "Need image"}), 400

#     # Since ML is removed, generate a fake prediction
#     p = random.random()

#     return jsonify({
#         "label": "valid" if p > 0.5 else "invalid",
#         "confidence": round(p if p > 0.5 else 1 - p, 4)
#     })

@app.post("/api/predict")
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Need image"}), 400

    # Since TensorFlow is not running on Render,
    # we return a dummy prediction so the frontend works.

    import random
    conf = round(random.uniform(0.55, 0.95), 3)
    label = "valid" if random.random() > 0.5 else "invalid"

    return jsonify({
        "label": label,
        "confidence": conf,
        "note": "TensorFlow model not loaded (Render does not support TF)"
    })



# --------------------------
# LLM LABEL ENDPOINT
# --------------------------
@app.post("/api/llm/label")
def llm_label():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    img_bytes = request.files["image"].read()
    b64 = base64.b64encode(img_bytes).decode("utf-8")

    prompt = """
    You are a pro trading analyst.
    Analyze this chart and return STRICTLY this format:
    Pattern: ...
    Trend: ...
    Entry Logic: ...
    Risk: ...
    Grade: A/B/C
    """

    try:
        resp = deep_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "Chart analysis assistant"},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": f"data:image/png;base64,{b64}"}
                    ]
                }
            ]
        )

        text = resp.choices[0].message["content"].strip()
        first_line = text.split("\n")[0]

        return jsonify({
            "pattern": first_line,
            "reason": text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------
# FAKE SIMILARITY ENDPOINTS
# (your frontend requires them)
# --------------------------
@app.post("/api/similar")
def similar_simple():
    return jsonify([
        {"path": "dummy1.png", "distance": 0.12},
        {"path": "dummy2.png", "distance": 0.2}
    ])


@app.post("/api/similar_smart")
def similar_smart():
    return jsonify([
        {"path": "smart1.png", "distance": 0.08},
        {"path": "smart2.png", "distance": 0.15}
    ])


# --------------------------
# FAKE LEVEL EXTRACTION
# --------------------------
@app.post("/api/extract_levels")
def extract_levels():
    return jsonify({
        "sl": "181.200",
        "tp1": "182.450",
        "tp2": "183.900"
    })


# --------------------------
# ROOT TEST
# --------------------------
@app.get("/")
def home():
    return {"status": "backend running"}


# --------------------------
# RUN (HuggingFace uses PORT)
# --------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
