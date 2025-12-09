import sqlite3, hashlib, os, jwt, time
from flask import request, jsonify, Blueprint

auth_bp = Blueprint("auth", __name__)

SECRET = "SUPER_SECRET_CHANGE_THIS"

DB = "users.db"

def init_user_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )
    """)
    conn.commit()
    conn.close()


def hash_pw(p):
    return hashlib.sha256(p.encode()).hexdigest()


@auth_bp.post("/register")
def register():
    data = request.get_json()
    email = data["email"].lower()
    pw = hash_pw(data["password"])

    conn = sqlite3.connect(DB)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, pw))
        conn.commit()
    except:
        return jsonify({"error": "Email already exists"}), 400

    return jsonify({"ok": True})


@auth_bp.post("/login")
def login():
    data = request.get_json()
    email = data["email"].lower()
    pw = hash_pw(data["password"])

    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE email=? AND password=?", (email, pw))
    row = c.fetchone()

    if not row:
        return jsonify({"error": "Invalid login"}), 400

    user_id = row[0]
    token = jwt.encode({"uid": user_id, "exp": time.time()+86400}, SECRET, algorithm="HS256")

    return jsonify({"token": token, "uid": user_id})
