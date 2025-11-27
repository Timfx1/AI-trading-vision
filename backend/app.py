"""
==========================================================
Project:   QuantumEdge Trading Pattern AI
Author:    [Your Full Name or Brand]
Version:   1.0.0
Date:      2025-10-16
Description:
    AI-powered chart pattern recognition system that allows
    traders to upload setups, predict validity, and compare
    them with curated references or AI embeddings.

License:   Proprietary - All Rights Reserved
Contact:   youremail@domain.com | www.yourbrand.com
==========================================================
DISCLAIMER:
    This software is for educational purposes only.
    It does not provide financial advice or trading signals.
    Use responsibly. Past performance is not indicative of
    future results.
==========================================================
"""

from __future__ import annotations
import os, time, json, threading, queue, random, sqlite3, csv, pickle
from dataclasses import dataclass, asdict
from typing import List, Dict, Any
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import numpy as np
from PIL import Image
import imagehash

# Optional: TensorFlow for Smart Vision
try:
    import tensorflow as tf
    TF_OK = True
except Exception:
    TF_OK = False


# === Flask App Setup ===
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

DB_PATH = "signals.db"
SETUPS_CSV = os.path.join("data", "setups.csv")


# === Load Reference Setups ===
REFS: List[Dict[str, Any]] = []

def load_reference_setups():
    global REFS
    REFS = []
    if os.path.exists(SETUPS_CSV):
        with open(SETUPS_CSV, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                if r.get("label") in ("valid", "invalid") and r.get("url", "").startswith("http"):
                    REFS.append({
                        "id": r.get("id"),
                        "pair_abbr": r.get("pair_abbr"),
                        "symbol": r.get("symbol"),
                        "label": r.get("label"),
                        "url": r.get("url"),
                        "notes": r.get("notes", ""),
                        "added_at": r.get("added_at", ""),
                    })
    print(f"Loaded {len(REFS)} references from {SETUPS_CSV}")


# === SQLite for signals ===
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS signals (
        id TEXT PRIMARY KEY, symbol TEXT, timeframe TEXT,
        direction TEXT, confidence REAL, openedAt REAL
    )""")
    conn.commit(); conn.close()


def save_signal_db(s: Dict[str, Any]):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO signals VALUES (?,?,?,?,?,?)",
              (s["id"], s["symbol"], s["timeframe"], s["direction"], s["confidence"], s["openedAt"]))
    conn.commit(); conn.close()


def load_signals_db(limit=100):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, symbol, timeframe, direction, confidence, openedAt FROM signals ORDER BY openedAt DESC LIMIT ?", (limit,))
    rows = c.fetchall(); conn.close()
    return [{"id": r[0], "symbol": r[1], "timeframe": r[2], "direction": r[3], "confidence": r[4], "openedAt": r[5]} for r in rows]


# === State ===
@dataclass
class Signal:
    id: str
    symbol: str
    timeframe: str
    direction: str
    confidence: float
    openedAt: float


STATE = {
    "summary": {"totalSetups": 24, "valid": 18, "invalid": 6, "activeSignals": 3, "signalsToday": 12, "winRate": 0.71, "recognition": 0.94},
    "signals": []  # type: List[Signal]
}

subscribers: List[queue.Queue] = []


# === SSE Alerts ===
def publish_alert(payload: Dict[str, Any]):
    dead = []
    for q in list(subscribers):
        try:
            q.put_nowait(payload)
        except Exception:
            dead.append(q)
    for d in dead:
        if d in subscribers:
            subscribers.remove(d)


def sse_stream(q: queue.Queue):
    while True:
        try:
            payload = q.get(timeout=60)
        except queue.Empty:
            yield ": keep-alive\n\n"
            continue
        yield f"data: {json.dumps(payload)}\n\n"


# === API ROUTES ===
@app.get("/api/summary")
def get_summary():
    return jsonify(STATE["summary"])


@app.get("/api/signals")
def get_signals():
    return jsonify(load_signals_db())


@app.post("/api/signals")
def add_signal():
    data = request.get_json(force=True)
    s = Signal(
        id=data.get("id") or str(time.time_ns()),
        symbol=data["symbol"],
        timeframe=data.get("timeframe", "15m"),
        direction=data.get("direction", "LONG"),
        confidence=float(data.get("confidence", 0.8)),
        openedAt=float(data.get("openedAt", time.time())),
    )
    s_dict = asdict(s)
    STATE["signals"].insert(0, s)
    save_signal_db(s_dict)
    publish_alert({"type": "signal", "signal": s_dict})
    STATE["summary"]["activeSignals"] = len(STATE["signals"])
    STATE["summary"]["signalsToday"] += 1
    return jsonify({"ok": True, "signal": s_dict})


@app.post("/api/summary")
def update_summary():
    data = request.get_json(force=True)
    STATE["summary"].update({k: v for k, v in data.items() if k in STATE["summary"]})
    return jsonify({"ok": True, "summary": STATE["summary"]})


@app.get("/api/alerts/stream")
def alerts_stream():
    q = queue.Queue()
    subscribers.append(q)
    return Response(sse_stream(q), mimetype="text/event-stream")


@app.get("/api/references")
def get_references():
    label = request.args.get("label", "valid")
    limit = int(request.args.get("limit", "20"))
    items = [r for r in REFS if r["label"] == label][:limit]
    return jsonify({"items": items, "count": len(items)})


# === Model load + predict ===
def load_model():
    paths = ["outputs/model.keras", "outputs/model.h5", "outputs/model"]
    for p in paths:
        if os.path.exists(p):
            if TF_OK:
                return tf.keras.models.load_model(p)
    return None


MODEL = None
MODEL_LOCK = threading.Lock()


@app.post("/api/predict")
def predict():
    global MODEL
    if "image" not in request.files:
        return jsonify({"error": "send multipart/form-data with field 'image'"}), 400
    f = request.files["image"]
    img_bytes = f.read()

    with MODEL_LOCK:
        if MODEL is None:
            MODEL = load_model()

    if MODEL is None or not TF_OK:
        guess = random.random()
        label = "valid" if guess >= 0.5 else "invalid"
        conf = round(guess if label == 'valid' else 1 - guess, 4)
        refs = [r for r in REFS if r["label"] == label][:10]
        return jsonify({"label": label, "confidence": conf, "note": "no model found", "references": refs})

    img = tf.io.decode_image(img_bytes, channels=3, expand_animations=False)
    img = tf.image.resize(img, (224, 224)) / 255.0
    pred = MODEL.predict(tf.expand_dims(img, 0), verbose=0)[0]
    if pred.shape == () or pred.shape == (1,):
        p = float(pred.reshape(-1)[0])
        label = "valid" if p >= 0.5 else "invalid"
        conf = p if label == "valid" else 1 - p
    else:
        p_valid = float(pred[-1])
        label = "valid" if p_valid >= 0.5 else "invalid"
        conf = p_valid if label == "valid" else 1 - p_valid
    refs = [r for r in REFS if r["label"] == label][:10]
    return jsonify({"label": label, "confidence": round(float(conf), 4), "references": refs})


# === Simple Vision ===
@app.post("/api/similar")
def find_similar():
    if "image" not in request.files:
        return jsonify({"error": "send multipart/form-data with field 'image'"}), 400
    f = request.files["image"]
    img = Image.open(f.stream)
    target_hash = imagehash.phash(img)

    index_path = os.path.join(os.path.dirname(__file__), "data", "image_index.pkl")
    if not os.path.exists(index_path):
        return jsonify({"error": "no image index found; run build_image_index.py first"}), 404

    index = pickle.load(open(index_path, "rb"))
    results = []
    for item in index:
        diff = target_hash - item["hash"]
        results.append((diff, item))
    results.sort(key=lambda x: x[0])
    top = []
    for diff, item in results[:5]:
        rel_path = os.path.relpath(item["path"], os.path.join(os.path.dirname(__file__), "dataset"))
        web_path = f"http://127.0.0.1:5000/images/{rel_path.replace(os.sep, '/')}"
        top.append({
            "path": web_path,
            "label": item["label"],
            "distance": int(diff)
        })
    return jsonify(top)


# === Smart Vision (CNN Embedding Similarity) ===
@app.post("/api/similar_smart")
def find_similar_smart():
    model_path = os.path.join("outputs", "model.keras")
    index_path = os.path.join("data", "embedding_index.pkl")

    if not os.path.exists(model_path):
        return jsonify({"error": "model.keras not found"}), 404
    if not os.path.exists(index_path):
        return jsonify({"error": "embedding_index.pkl not found"}), 404

    # --- Load model and embedder ---
    try:
        model = tf.keras.models.load_model(model_path)
        # Ensure model is built before accessing .input
        if not hasattr(model, "inputs"):
            dummy = tf.zeros((1, 224, 224, 3))
            model(dummy, training=False)
        embedder = tf.keras.Model(inputs=model.input, outputs=model.layers[-2].output)
    except Exception as e:
        return jsonify({"error": f"failed to load model: {e}"}), 500

    data = pickle.load(open(index_path, "rb"))

    if "image" not in request.files:
        return jsonify({"error": "send multipart/form-data with field 'image'"}), 400

    # --- Preprocess image (force RGB) ---
    f = request.files["image"]
    img = Image.open(f.stream).convert("RGB").resize((224, 224))
    arr = np.expand_dims(np.array(img) / 255.0, 0)
    emb = embedder.predict(arr, verbose=0)[0]

    # --- Compute distances ---
    results = []
    for item in data:
        dist = np.linalg.norm(emb - item["embedding"])
        results.append((dist, item))
    results.sort(key=lambda x: x[0])

    # --- Build clean web paths ---
    top = []
    for dist, item in results[:5]:
        rel_path = os.path.relpath(item["path"], os.path.join(os.path.dirname(__file__), "dataset"))
        web_path = f"http://127.0.0.1:5000/images/{rel_path.replace(os.sep, '/')}"
        top.append({
            "path": web_path,
            "label": item["label"].upper(),
            "distance": round(float(dist), 4)
        })

    print("✅ Top matches:")
    for t in top:
        print(f"  • {t['label']}  ({t['distance']})  →  {t['path']}")

    return jsonify(top)



# === Serve Dataset Images ===
@app.route("/images/<path:filename>")
def serve_image(filename):
    dataset_dir = os.path.join(os.path.dirname(__file__), "dataset")
    return send_from_directory(dataset_dir, filename)


# === Demo Bot ===
SYMS = ["AAPL", "TSLA", "NVDA", "MSFT", "ETH-USD", "BTC-USD", "EURUSD", "GBPUSD"]
BOT_RUNNING = False


def demo_alerts():
    global BOT_RUNNING
    while True:
        time.sleep(random.randint(10, 20))
        if not BOT_RUNNING:
            continue
        s = Signal(
            id=str(time.time_ns()),
            symbol=random.choice(SYMS),
            timeframe=random.choice(["5m", "15m", "1h", "4h", "1D"]),
            direction=random.choice(["LONG", "SHORT"]),
            confidence=random.uniform(0.65, 0.98),
            openedAt=time.time(),
        )
        STATE["signals"].insert(0, s)
        s_dict = asdict(s)
        save_signal_db(s_dict)
        publish_alert({"type": "signal", "signal": s_dict})
        STATE["summary"]["activeSignals"] = len(STATE["signals"])
        STATE["summary"]["signalsToday"] += 1


@app.post("/api/bot/start")
def start_bot():
    global BOT_RUNNING
    BOT_RUNNING = True
    return jsonify({"message": "Bot started"})


@app.post("/api/bot/stop")
def stop_bot():
    global BOT_RUNNING
    BOT_RUNNING = False
    return jsonify({"message": "Bot stopped"})


# === MAIN ===
if __name__ == "__main__":
    init_db()
    load_reference_setups()
    threading.Thread(target=demo_alerts, daemon=True).start()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
