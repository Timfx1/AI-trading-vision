# backend/routes/levels_routes.py

import os
from flask import Blueprint, request, jsonify
from llm.levels_extractor import extract_levels
from werkzeug.utils import secure_filename
import uuid

levels_bp = Blueprint("levels_bp", __name__)

TMP_DIR = "data/tmp_extract"
os.makedirs(TMP_DIR, exist_ok=True)


@levels_bp.post("/api/extract_levels")
def api_extract_levels():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    img = request.files["image"]
    filename = secure_filename(str(uuid.uuid4()) + "_" + img.filename)
    filepath = os.path.join(TMP_DIR, filename)
    img.save(filepath)

    data = extract_levels(filepath)
    return jsonify(data)
