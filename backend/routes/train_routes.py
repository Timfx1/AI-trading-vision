from flask import Blueprint, jsonify
import subprocess
import os

train_bp = Blueprint("train_bp", __name__)

@train_bp.post("/api/train")
def train_model():
    """Run training script and rebuild embedding index."""
    try:
        # run training
        subprocess.run(
            ["python", "scripts/train_cnn_model.py"],
            check=True
        )

        # rebuild embeddings
        subprocess.run(
            ["python", "scripts/build_embedding_index.py"],
            check=True
        )

        return jsonify({"status": "ok", "message": "Model retrained"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
