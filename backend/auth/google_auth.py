# backend/auth/google_auth.py

import os
import json
from jose import jwt
from google.oauth2 import id_token
from google.auth.transport import requests

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey123")
JWT_ALGO = "HS256"

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()

def verify_google_token(credential: str):
    """Verify Google One-Tap credential from frontend."""
    try:
        ticket = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
        return {
            "id": ticket["sub"],
            "email": ticket["email"],
            "name": ticket.get("name", ""),
            "picture": ticket.get("picture", "")
        }
    except Exception as e:
        print("Google token error:", e)
        return None


def create_jwt(user):
    """Return signed JWT containing user ID and email."""
    payload = {
        "user_id": user["id"],
        "email": user["email"],
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_jwt(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except Exception:
        return None
