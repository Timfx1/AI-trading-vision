# backend/llm/levels_extractor.py

import base64
import json


SYSTEM_PROMPT = """
You are an AI trained to extract trade levels (Entry, Stop Loss, Take Profit)
from screenshots of TradingView charts.

Return JSON ONLY in this form:
{
  "entry": number or null,
  "stop_loss": number or null,
  "take_profit": number or null,
  "risk_reward": number or null
}

Rules:
- Detect the TradingView LONG/SHORT tool if present.
- Extract the numeric values exactly.
- If a value is not visible, return null.
- NEVER add explanations or text outside the JSON.
"""

def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def extract_levels(img_path):
    img_b64 = encode_image(img_path)

    res = client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": "Extract SL, TP, entry, and RR."},
                    {"type": "input_image", "image": img_b64}
                ]
            }
        ]
    )

    raw = res.choices[0].message.content

    try:
        data = json.loads(raw)
    except:
        data = {"entry": None, "stop_loss": None, "take_profit": None, "risk_reward": None}

    return data
