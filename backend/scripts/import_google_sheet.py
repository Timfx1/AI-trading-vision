import os
import json
import uuid
import pandas as pd
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urlparse
from time import sleep

# ---------------------------------------
# CONFIG
# ---------------------------------------

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

IMPORTED_LOG = os.path.join(DATA_DIR, "imported_rows.json")


# ---------------------------------------
# Helper: Load / Save already imported row memory
# ---------------------------------------

def load_import_memory():
    if not os.path.exists(IMPORTED_LOG):
        return set()
    try:
        return set(json.load(open(IMPORTED_LOG)))
    except:
        return set()


def save_import_memory(imported_set):
    json.dump(list(imported_set), open(IMPORTED_LOG, "w"), indent=4)


# ---------------------------------------
# Helper: Generate folder ID
# ---------------------------------------

def generate_id():
    return datetime.now().strftime("%Y%m%d_%H%M%S_") + uuid.uuid4().hex[:6]


# ---------------------------------------
# Helper: Extract TradingView image URL
# ---------------------------------------

def extract_tradingview_image(url: str):
    try:
        html = requests.get(url, timeout=10).text
        soup = BeautifulSoup(html, "html.parser")
        img = soup.find("img")
        if not img:
            print(f"❌ No <img> tag found at: {url}")
            return None
        img_url = img.get("src")
        if img_url.startswith("//"):
            img_url = "https:" + img_url
        return img_url
    except Exception as e:
        print(f"⚠️ Extraction error for {url}: {e}")
        return None


# ---------------------------------------
# Helper: Download image
# ---------------------------------------

def download_image(url: str, save_path: str):
    try:
        r = requests.get(url, timeout=10)
        with open(save_path, "wb") as f:
            f.write(r.content)
        return True
    except Exception as e:
        print(f"⚠️ Could not download {url}: {e}")
        return False


# ---------------------------------------
# Helper: Map validity column
# ---------------------------------------

def map_validity(r_value):
    if pd.isna(r_value):
        return "unknown"
    v = str(r_value).strip().upper()

    if v == "1":
        return "valid"
    if v == "BE":
        return "breakeven"   # <-- Your chosen behaviour
    if v == "-1":
        return "invalid"
    return "unknown"


# ---------------------------------------
# MAIN IMPORT FUNCTION
# ---------------------------------------

def import_sheet(sheet_path):
    print("📘 Importer started — reading Excel file...")
    print(f"➡ File: {sheet_path}\n")

    df = pd.read_excel(sheet_path)
    df.columns = [c.strip().lower() for c in df.columns]

    col_before = "before"
    col_after = "after"
    col_r = "r"
    col_pair = "pair"
    col_comment = "remark"

    imported_rows = load_import_memory()
    print(f"🔄 Loaded import memory: {len(imported_rows)} previously imported rows.\n")

    imported_count = 0

    for idx, row in df.iterrows():

        # Skip already imported rows
        if idx in imported_rows:
            print(f"⏩ Row {idx} already imported — skipping.")
            continue

        print(f"\n▶ Processing row {idx}...")
        before_url = row.get(col_before)

        if not isinstance(before_url, str) or not before_url.startswith("http"):
            print("⚠️ Missing BEFORE URL — skipping row.")
            continue

        # Create folder
        folder_id = generate_id()
        folder_path = os.path.join(DATASET_DIR, folder_id)
        os.makedirs(folder_path, exist_ok=True)

        # -------------------------
        # BEFORE image
        # -------------------------

        print("🔍 Extracting BEFORE image...")
        before_img_direct = extract_tradingview_image(before_url)
        before_img_path = os.path.join(folder_path, "img.png")

        if not before_img_direct or not download_image(before_img_direct, before_img_path):
            print("❌ Cannot extract BEFORE image — deleting folder and skipping row.")
            os.rmdir(folder_path)
            continue

        print(f"✅ BEFORE saved: {before_img_path}")

        # -------------------------
        # AFTER image (optional)
        # -------------------------

        after_url = row.get(col_after)
        after_img_path = None

        if isinstance(after_url, str) and after_url.startswith("http"):
            print("📈 Extracting AFTER image...")
            after_img_direct = extract_tradingview_image(after_url)
            if after_img_direct:
                after_img_path = os.path.join(folder_path, "after.png")
                if download_image(after_img_direct, after_img_path):
                    print("📈 AFTER image saved.")
                else:
                    after_img_path = None

        # -------------------------
        # LABEL.JSON
        # -------------------------

        label = {
            "pair": row.get(col_pair),
            "validity": map_validity(row.get(col_r)),
            "comment": row.get(col_comment),
            "before_image": "img.png",
            "after_image": "after.png" if after_img_path else None,
            "source": "google_sheet_import"
        }

        json_path = os.path.join(folder_path, "label.json")
        with open(json_path, "w") as f:
            json.dump(label, f, indent=4)

        print(f"💾 label.json saved.")

        imported_rows.add(idx)
        imported_count += 1

        sleep(0.5)

    # Save memory
    save_import_memory(imported_rows)

    print("\n🎉 IMPORT FINISHED.")
    print(f"📦 New entries imported: {imported_count}")
    print(f"🧠 Total imported rows remembered: {len(imported_rows)}\n")


# ---------------------------------------
# SCRIPT ENTRY POINT
# ---------------------------------------

if __name__ == "__main__":
    sheet = os.path.join(DATA_DIR, "2025_trading_journal.xlsx")
    import_sheet(sheet)
