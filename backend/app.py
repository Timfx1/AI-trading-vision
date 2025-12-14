"""
==========================================================
QuantumEdge Trading Pattern AI - Backend
Author: Timfx1
Version: 2.1 (Clean Rewrite)
==========================================================
"""

# ---------------------------------------------------------
# MUST BE FIRST
# ---------------------------------------------------------
from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()


# ---------------------------------------------------------
# Standard libs
# ---------------------------------------------------------
import os, time, json, random, queue, sqlite3, csv, pickle, threading, re

# ---------------------------------------------------------
# Flask
# ---------------------------------------------------------
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS

# ---------------------------------------------------------
# Image / ML
# ---------------------------------------------------------
import numpy as np
import cv2
from PIL import Image
import imagehash
import pytesseract
import base64
import io

import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"



# ---------------------------------------------------------
# Optional TensorFlow
# ---------------------------------------------------------
try:
    import tensorflow as tf
    TF_OK = True
except:
    TF_OK = False

# ---------------------------------------------------------
# Internal modules
# ---------------------------------------------------------
from vision.normalize import normalize_chart
from training.trainer import TRAIN_STATUS, training_thread
from auth.auth import auth_bp, init_user_db

# ---------------------------------------------------------
# OpenAI
# ---------------------------------------------------------
# from openai import OpenAI
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------------------------------------
# Flask init
# ---------------------------------------------------------
app = Flask(__name__)

from flask_cors import CORS
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization"
    )
    response.headers.add(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    )
    return response


# Attach auth routes
app.register_blueprint(auth_bp, url_prefix="/api/auth")
init_user_db()

DB_PATH = "signals.db"
SETUPS_CSV = "data/setups.csv"

# ---------------------------------------------------------
# Tesseract
# ---------------------------------------------------------
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ---------------------------------------------------------
# Load References
# ---------------------------------------------------------
REFS = []


def load_reference_setups():
    global REFS
    REFS = []

    if os.path.exists(SETUPS_CSV):
        with open(SETUPS_CSV, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row.get("label") in ("valid", "invalid"):
                    REFS.append(row)

    print(f"Loaded {len(REFS)} references.")


# ---------------------------------------------------------
# SQLite: Signals
# ---------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS signals (
            id TEXT PRIMARY KEY,
            symbol TEXT,
            timeframe TEXT,
            direction TEXT,
            confidence REAL,
            openedAt REAL
        )
    """)
    conn.commit()
    conn.close()


def save_signal_db(data):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""INSERT OR REPLACE INTO signals VALUES (?, ?, ?, ?, ?, ?)""",
              (
                  data["id"], data["symbol"], data["timeframe"],
                  data["direction"], data["confidence"], data["openedAt"]
              ))
    conn.commit()
    conn.close()


def load_signals_db(limit=100):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, symbol, timeframe, direction, confidence, openedAt "
              "FROM signals ORDER BY openedAt DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()

    return [{
        "id": r[0], "symbol": r[1], "timeframe": r[2],
        "direction": r[3], "confidence": r[4], "openedAt": r[5]
    } for r in rows]


# ---------------------------------------------------------
# SSE Alerts
# ---------------------------------------------------------
subscribers = []


def publish_alert(payload):
    dead = []
    for q in subscribers:
        try:
            q.put_nowait(payload)
        except:
            dead.append(q)

    for d in dead:
        if d in subscribers:
            subscribers.remove(d)


def sse_stream(q):
    while True:
        try:
            msg = q.get(timeout=60)
            yield f"data: {json.dumps(msg)}\n\n"
        except queue.Empty:
            yield ": keep-alive\n\n"


# ---------------------------------------------------------
# API: Summary
# ---------------------------------------------------------
@app.get("/api/summary")
def get_summary():
    return jsonify({
        "referenceCount": len(REFS),
        "datasetReady": True
    })


# ---------------------------------------------------------
# API: Signals
# ---------------------------------------------------------
@app.get("/api/signals")
def get_signals():
    return jsonify(load_signals_db())


@app.post("/api/signals")
def add_signal():
    data = request.get_json()
    entry = {
        "id": str(time.time_ns()),
        "symbol": data["symbol"],
        "timeframe": data.get("timeframe", "15m"),
        "direction": data.get("direction", "LONG"),
        "confidence": float(data.get("confidence", 0.8)),
        "openedAt": time.time(),
    }

    save_signal_db(entry)
    publish_alert({"type": "signal", "signal": entry})
    return jsonify({"ok": True, "signal": entry})


# # ---------------------------------------------------------
# LLM PATTERN IDENTIFICATION (DeepSeek Vision)
# ---------------------------------------------------------
from deepseek import DeepSeekAPI
import base64

DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")
deep_client = DeepSeekAPI(DEEPSEEK_KEY)

@app.post("/api/llm/label")
def llm_label():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    try:
        file = request.files["image"]
        img_bytes = file.read()
        b64 = base64.b64encode(img_bytes).decode("utf-8")

        prompt = """
You are a professional market analyst.

Analyze the trading chart and provide:
1. Pattern name
2. Trend direction
3. Entry logic
4. Risk context
5. Setup quality (A / B / C)

Be concise and practical.
"""

        response = deep_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You analyze trading charts."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": f"data:image/png;base64,{b64}"
                        }
                    ],
                },
            ],
            temperature=0.4,
        )

        full_text = response.choices[0].message["content"].strip()
        pattern = full_text.split("\n")[0][:60]

        return jsonify({
            "pattern": pattern,
            "reason": full_text
        })

    except Exception as e:
        # Fail-safe: never crash frontend
        return jsonify({
            "pattern": "Unavailable",
            "reason": "LLM service temporarily unavailable."
        }), 200






@app.post("/api/vision/levels")
def vision_extract_levels():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    img_bytes = request.files["image"].read()
    b64 = base64.b64encode(img_bytes).decode("utf-8")

    prompt = """
You are a professional trading analyst.

Visually analyze the chart image and extract REAL price levels if visible.

Tasks:
1. Identify ENTRY price
2. Identify STOP LOSS
3. Identify TP1
4. Identify TP2 (if visible)
5. Identify trade direction (LONG / SHORT)

Rules:
- Use ONLY prices you can visually infer
- If a level is not visible, return null
- Return STRICT JSON ONLY
- No explanations

JSON FORMAT:
{
  "direction": "LONG" | "SHORT" | null,
  "entry": number | null,
  "sl": number | null,
  "tp1": number | null,
  "tp2": number | null
}
"""

    try:
        response = deep_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You extract trading levels from charts."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": f"data:image/png;base64,{b64}"
                        }
                    ]
                }
            ],
            temperature=0.0
        )

        raw = response.choices[0].message["content"].strip()
        data = json.loads(raw)

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "direction": None,
            "entry": None,
            "sl": None,
            "tp1": None,
            "tp2": None,
            "error": str(e)
        }), 200

# ---------------------------------------------------------
# SL/TP Extraction
# ---------------------------------------------------------
@app.post("/api/extract_levels")
def extract_levels():
    if "image" not in request.files:
        return jsonify({"error": "No file"}), 400

    img = Image.open(request.files["image"].stream).convert("RGB")
    img_np = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    img_np = normalize_chart(img_np)

    text = pytesseract.image_to_string(img_np)

    num = r"([0-9]+\.[0-9]+)"

    entry = re.search(r"Entry\s*[:\-]?\s*" + num, text)
    sl = re.search(r"(SL|Stop\s*Loss)\s*[:\-]?\s*" + num, text)
    tp = re.search(r"(TP|Take\s*Profit)\s*[:\-]?\s*" + num, text)

    def g(m): return m.group(2) if m else None

    entry = entry.group(1) if entry else None
    sl = sl.group(2) if sl else None
    tp = tp.group(2) if tp else None

    rr = None
    if entry and sl and tp:
        try:
            rr = round(abs(float(tp) - float(entry)) /
                       abs(float(entry) - float(sl)), 2)
        except:
            pass

    return jsonify({
        "entry": entry,
        "stop_loss": sl,
        "take_profit": tp,
        "risk_reward": rr,
        "ocr_raw": text
    })

@app.post("/api/normalize/preview")
def normalize_preview():
    if "image" not in request.files:
        return jsonify({"error": "No file"}), 400

    img = Image.open(request.files["image"]).convert("RGB")
    img_np = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    norm = normalize_chart(img_np)

    _, buf = cv2.imencode(".png", norm)
    b64 = base64.b64encode(buf).decode("utf-8")

    return jsonify({"normalized": b64})


# ---------------------------------------------------------
# References
# ---------------------------------------------------------
@app.get("/api/references")
def get_references():
    label = request.args.get("label", "valid")
    return jsonify([r for r in REFS if r["label"] == label][:20])


# ---------------------------------------------------------
# CNN Model Load
# ---------------------------------------------------------
MODEL = None
MODEL_LOCK = threading.Lock()


def load_model():
    for p in ["outputs/model.keras", "outputs/model.h5"]:
        if os.path.exists(p):
            return tf.keras.models.load_model(p)
    return None


# ---------------------------------------------------------
# Predict
# ---------------------------------------------------------
@app.post("/api/predict")
def predict():
    global MODEL

    if "image" not in request.files:
        return jsonify({"error": "Need image"}), 400

    img_bytes = request.files["image"].read()

    with MODEL_LOCK:
        if MODEL is None:
            MODEL = load_model()

    if MODEL is None or not TF_OK:
        rnd = random.random()
        return jsonify({
            "label": "valid" if rnd > 0.5 else "invalid",
            "confidence": round(rnd, 4),
            "note": "Model missing"
        })

    img_raw = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    np_img = cv2.cvtColor(np.array(img_raw), cv2.COLOR_RGB2BGR)

    np_img = normalize_chart(np_img)

    arr = cv2.cvtColor(np_img, cv2.COLOR_BGR2RGB)
    arr = cv2.resize(arr, (224, 224)) / 255.0
    arr = np.expand_dims(arr, 0)

    pred = MODEL.predict(arr, verbose=0)[0]
    p = float(pred[-1]) if len(pred) > 1 else float(pred)

    label = "valid" if p >= 0.5 else "invalid"
    conf = p if p >= 0.5 else 1 - p

    return jsonify({"label": label, "confidence": round(conf, 4)})


# ---------------------------------------------------------
# Simple Similarity
# ---------------------------------------------------------
@app.post("/api/similar")
def simple_similar():
    if "image" not in request.files:
        return jsonify([])

    img = Image.open(request.files["image"])
    qh = imagehash.phash(img)

    index = pickle.load(open("data/image_index.pkl", "rb"))

    out = []
    for item in index:
        dist = qh - item["hash"]
        out.append({
            "path": item["path"],
            "label": item["label"],
            "distance": float(dist),
            "mode": "simple"
        })

    return jsonify(sorted(out, key=lambda x: x["distance"])[:6])


# ---------------------------------------------------------
# Smart Similarity
# ---------------------------------------------------------
@app.post("/api/similar_smart")
def smart_similar():
    if not TF_OK or not os.path.exists("outputs/model.keras"):
        return jsonify([])

    model = tf.keras.models.load_model("outputs/model.keras")
    embedder = tf.keras.Model(inputs=model.input, outputs=model.layers[-2].output)

    index = pickle.load(open("data/embedding_index.pkl", "rb"))

    img = Image.open(request.files["image"]).convert("RGB")
    arr = np.array(img.resize((224, 224))) / 255.0
    emb = embedder.predict(np.expand_dims(arr, 0), verbose=0)[0]

    out = []
    for it in index:
        dist = np.linalg.norm(emb - it["embedding"])
        out.append({
            "path": it["path"],
            "label": it["label"],
            "distance": float(dist),
            "mode": "smart"
        })

    return jsonify(sorted(out, key=lambda x: x["distance"])[:6])


# ---------------------------------------------------------
# Training Endpoints
# ---------------------------------------------------------
@app.post("/api/train/start")
def train_start():
    if TRAIN_STATUS["running"]:
        return jsonify({"error": "already running"}), 400

    t = threading.Thread(target=training_thread, daemon=True)
    t.start()

    return jsonify({"message": "training started"})


@app.get("/api/train/status")
def train_status():
    return jsonify(TRAIN_STATUS)


@app.get("/api/train/history")
def train_history():
    return jsonify(TRAIN_STATUS["history"])

def rebuild_image_hash_index():
    print("🔄 Rebuilding simple hash index...")

    index = []
    for root, dirs, files in os.walk("dataset"):
        for f in files:
            if f.lower().endswith((".png", ".jpg", ".jpeg")):
                path = os.path.join(root, f)
                try:
                    img = Image.open(path)
                    h = imagehash.phash(img)
                    label = "valid" if "valid" in root else "invalid"
                    index.append({"path": path, "label": label, "hash": h})
                except:
                    pass

    pickle.dump(index, open("data/image_index.pkl", "wb"))
    print(f"✅ Hash index built ({len(index)} items)")


def rebuild_embedding_index():
    print("🔄 Rebuilding CNN embedding index...")

    if not TF_OK:
        print("⚠ TensorFlow unavailable — skipping embed index")
        return

    try:
        model = tf.keras.models.load_model("outputs/model.keras")
        embedder = tf.keras.Model(
            inputs=model.input,
            outputs=model.layers[-2].output
        )
    except:
        print("⚠ No model found")
        return

    items = []
    for root, dirs, files in os.walk("dataset"):
        for f in files:
            if f.lower().endswith((".png", ".jpg", ".jpeg")):
                path = os.path.join(root, f)
                img = Image.open(path).convert("RGB")
                arr = np.array(img.resize((224, 224))) / 255.0

                emb = embedder.predict(
                    np.expand_dims(arr, 0), verbose=0
                )[0]

                label = "valid" if "valid" in root else "invalid"

                items.append({
                    "path": path,
                    "embedding": emb,
                    "label": label
                })

    pickle.dump(items, open("data/embedding_index.pkl", "wb"))
    print(f"✅ Embedding index built ({len(items)} items)")

@app.post("/api/dataset/upload")
def dataset_upload():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    img = request.files["image"]
    label = request.form.get("label", "valid")

    label_folder = "valid_setup" if label == "valid" else "invalid_setup"
    save_dir = os.path.join("dataset", label_folder)
    os.makedirs(save_dir, exist_ok=True)

    # save file
    filename = f"{int(time.time())}_{img.filename}"
    save_path = os.path.join(save_dir, filename)
    img.save(save_path)

    # update REFS.csv automatically
    with open(SETUPS_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([save_path, label])

    # rebuild image hash index
    try:
        rebuild_image_hash_index()
    except:
        print("⚠ Could not rebuild hash index")

    # rebuild CNN embedding index (optional)
    try:
        rebuild_embedding_index()
    except:
        print("⚠ Could not rebuild CNN embedding index")

    load_reference_setups()  # refresh live memory

    return jsonify({
        "message": f"Uploaded to {label_folder}",
        "path": save_path
    })

# ---------------------------------------------------------
# Dataset Cleaner
# ---------------------------------------------------------
@app.post("/api/cleaner/scan")
def cleaner_scan():
    folder = "dataset"
    out = []

    for root, dirs, files in os.walk(folder):
        for f in files:
            if f.lower().endswith((".png", ".jpg", ".jpeg")):
                out.append(os.path.join(root, f))

    return jsonify({"count": len(out), "items": out})



# ---------------------------------------------------------
# Serve Dataset Images
# ---------------------------------------------------------
@app.route("/images/<path:filename>")
def serve_image(filename):
    return send_from_directory("dataset", filename)


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------
if __name__ == "__main__":
    init_db()
    load_reference_setups()
    app.run(host="0.0.0.0", port=5000, debug=True)
