from flask import Blueprint, jsonify, request
import os
import json

DATASET_DIR = "dataset"

dataset_bp = Blueprint("dataset_bp", __name__)

@dataset_bp.get("/api/dataset/list")
def list_items():
    items = []

    for folder in os.listdir(DATASET_DIR):
        f = os.path.join(DATASET_DIR, folder)
        if not os.path.isdir(f): continue

        meta_path = os.path.join(f, "label.json")
        if not os.path.exists(meta_path): continue

        meta = json.load(open(meta_path))
        meta["id"] = folder
        items.append(meta)

    return jsonify({"items": items})


@dataset_bp.get("/api/dataset/tags")
def list_tags():
    all_tags = set()

    for folder in os.listdir(DATASET_DIR):
        lab = os.path.join(DATASET_DIR, folder, "label.json")
        if not os.path.exists(lab): continue

        meta = json.load(open(lab))
        tags = meta.get("recommended_tags", [])
        for t in tags:
            all_tags.add(t)

    return jsonify({"tags": sorted(list(all_tags))})


@dataset_bp.get("/api/dataset/filter")
def filter_by_tag():
    tag = request.args.get("tag")
    results = []

    for folder in os.listdir(DATASET_DIR):
        meta_path = os.path.join(DATASET_DIR, folder, "label.json")
        if not os.path.exists(meta_path): continue

        meta = json.load(open(meta_path))
        tags = meta.get("recommended_tags", [])

        if tag in tags:
            meta["id"] = folder
            results.append(meta)

    return jsonify({"items": results})
