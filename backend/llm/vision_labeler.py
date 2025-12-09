# backend/llm/vision_labeler.py
import base64
import json
from openai import OpenAI

client = OpenAI()

SYSTEM_PROMPT = """
You are a trading chart analyst. Your job is to analyze forex trading screenshots.
Always output a STRICT JSON object with these fields:

{
  "validity": "valid or invalid",
  "pattern": "string",
  "trend": "bullish | bearish | sideways",
  "zones": ["list of key price zones if visible"],
  "quality_score": 0–1 float,
  "llm_reason": "explanation",
  "recommended_tags": ["tags useful for dataset filtering"]
}
"""

def label_image(img_bytes: bytes) -> dict:
    """Send image to GPT-4o Vision, return structured metadata."""
    b64 = base64.b64encode(img_bytes).decode("utf8")

    response = client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": "Analyze this trading chart strictly in JSON."},
                    {"type": "input_image", "image": b64},
                ],
            },
        ],
    )

    raw = response.choices[0].message.content

    try:
        data = json.loads(raw)
    except Exception:
        data = {"error": "LLM did not provide valid JSON", "raw_output": raw}

    return data
