# backend/llm/cleaner.py

import os, base64, json
from PIL import Image
import numpy as np


SYSTEM_PROMPT = """
You are a trading chart data quality inspector.
Your job is to evaluate screenshots for dataset quality issues.

STRICTLY return JSON:
{
  "is_chart": true/false,
  "is_blurry": true/false,
  "duplicate_of": "ID or null",
  "confidence_readable": float 0–1,
  "recommend_delete": true/false,
  "recommend_relabel": true/false,
  "reason": "string explanation"
}

Rules:
- Mark is_chart=false if image does NOT contain candlesticks, price, axes, or trading UI.
- Blurry = can't read candles clearly.
- recommend_delete = true ONLY if screenshot is useless for CNN training.
- recommend_relabel = true if valid/invalid label seems wrong.
- duplicate_of should name an ID if image is visually nearly identical.
"""

def encode_image(img_path):
    with open(img_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf8")

def analyze_image(img_path):
    b64 = encode_image(img_path)

    response = client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "input_text",
                     "text": "Analyze this trading chart screenshot for dataset cleaning."},
                    {"type": "input_image", "image": b64}
                ]
            }
        ]
    )

    raw = response.choices[0].message.content

    try:
        data = json.loads(raw)
    except:
        data = {"error": "Invalid JSON from LLM", "raw": raw}

    return data
