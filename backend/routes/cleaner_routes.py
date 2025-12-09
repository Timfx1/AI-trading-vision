# backend/routes/cleaner_routes.py

from flask import Blueprint, jsonify, request
from llm.cleaner import analyze_image
import os, json, shutil

cleaner_bp = Blueprint("cleaner_bp", __name__)

DATASET_DIR = "dataset"
REPORT_FILE = "data/cleaner_report.json"

def load_report():
    if not os.path.exists(REPORT_FILE):
        return {"items": [], "stats": {}}
    return json.load(open(REPORT_FILE))

def save_report(rep):
    os.makedirs("data", exist_ok=True)
    json.dump(rep, open(REPORT_FILE, "w"), indent=4)


@cleaner_bp.post("/api/cleaner/scan")
def scan_dataset():
    """Scan all dataset items using GPT-4o Vision."""
    results = []
    for folder in os.listdir(DATASET_DIR):
        item_dir = os.path.join(DATASET_DIR, folder)
        img_path = os.path.join(item_dir, "img.png")
        meta_path = os.path.join(item_dir, "label.json")

        if not os.path.exists(img_path):
            continue

        analysis = analyze_image(img_path)
        entry = {
            "id": folder,
            "analysis": analysis,
            "img_path": f"/images/{folder}/img.png",
            "metadata_path": meta_path
        }
        results.append(entry)

    # Store report
    rep = {"items": results, "stats": summarize(results)}
    save_report(rep)

    return jsonify(rep)


def summarize(items):
    stats = {
        "total": len(items),
        "non_charts": 0,
        "blurry": 0,
        "recommend_delete": 0,
        "recommend_relabel": 0
    }

    for it in items:
        a = it["analysis"]
        if not a.get("is_chart", True): stats["non_charts"] += 1
        if a.get("is_blurry", False): stats["blurry"] += 1
        if a.get("recommend_delete", False): stats["recommend_delete"] += 1
        if a.get("recommend_relabel", False): stats["recommend_relabel"] += 1

    return stats


@cleaner_bp.get("/api/cleaner/report")
def get_report():
    return jsonify(load_report())


@cleaner_bp.post("/api/cleaner/delete")
def delete_item():
    data = request.json
    item_id = data.get("id")

    folder = os.path.join(DATASET_DIR, item_id)
    if os.path.exists(folder):
        shutil.rmtree(folder)

    rep = load_report()
    rep["items"] = [i for i in rep["items"] if i["id"] != item_id]
    rep["stats"] = summarize(rep["items"])
    save_report(rep)

    return jsonify({"message": f"{item_id} deleted"})


@cleaner_bp.post("/api/cleaner/relabel")
def relabel_item():
    data = request.json
    item_id = data.get("id")
    new_label = data.get("new_label", None)

    if not new_label:
        return jsonify({"error": "new_label required"}), 400

    meta_path = os.path.join(DATASET_DIR, item_id, "label.json")
    if not os.path.exists(meta_path):
        return jsonify({"error": "label.json missing"}), 404

    meta = json.load(open(meta_path))
    meta["validity"] = new_label

    json.dump(meta, open(meta_path, "w"), indent=4)

    return jsonify({"message": "Label updated", "metadata": meta})
