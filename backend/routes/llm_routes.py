# backend/routes/llm_routes.py
from flask import Blueprint, request, jsonify
from llm.vision_labeler import label_image
from llm.metadata_saver import save_labeled_item

llm_bp = Blueprint("llm_bp", __name__)

@llm_bp.post("/api/label")
def api_label_single():
    """Label one uploaded image using GPT-4o Vision."""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    img = request.files["image"].read()

    # Call LLM
    meta = label_image(img)

    return jsonify({"metadata": meta})


@llm_bp.post("/api/label/save")
def api_label_and_save():
    """Label image and save into dataset folder."""
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    img_bytes = request.files["image"].read()
    meta = label_image(img_bytes)
    saved = save_labeled_item(img_bytes, meta)

    return jsonify({
        "message": "Saved successfully",
        "saved": saved,
        "metadata": meta
    })


@llm_bp.post("/api/batch_label")
def api_batch_label():
    """Label multiple images in one request (folder upload)."""
    files = request.files.getlist("images")
    results = []

    for f in files:
        img_bytes = f.read()
        meta = label_image(img_bytes)
        saved = save_labeled_item(img_bytes, meta)
        results.append(saved)

    return jsonify({
        "count": len(results),
        "items": results
    })
