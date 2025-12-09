# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from auth.google_auth import verify_google_token, create_jwt
import os

auth_bp = Blueprint("auth_bp", __name__)

# auto-create user folders:
def ensure_user_dirs(user_id):
    base = os.path.join("userdata", user_id)
    os.makedirs(base, exist_ok=True)
    os.makedirs(os.path.join(base, "dataset"), exist_ok=True)
    os.makedirs(os.path.join(base, "history"), exist_ok=True)


@auth_bp.post("/api/auth/google")
def google_auth():
    data = request.json
    credential = data.get("credential")

    if not credential:
        return jsonify({"error": "missing credential"}), 400

    user = verify_google_token(credential)
    if not user:
        return jsonify({"error": "invalid token"}), 401

    ensure_user_dirs(user["id"])

    jwt_token = create_jwt(user)

    return jsonify({
        "ok": True,
        "jwt": jwt_token,
        "user": user
    })
