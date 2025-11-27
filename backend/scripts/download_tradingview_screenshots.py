# scripts/download_tradingview_screenshots.py
import os, time, csv
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

DATA_CSV = "data/setups.csv"
OUT_VALID = Path("dataset/valid_setup")
OUT_INVALID = Path("dataset/invalid_setup")
OUT_VALID.mkdir(parents=True, exist_ok=True)
OUT_INVALID.mkdir(parents=True, exist_ok=True)

def shot(driver, url, path: Path, delay=4):
    driver.get(url)
    time.sleep(delay)
    driver.save_screenshot(str(path))

def main(limit=None):
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1400,900")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)
    with open(DATA_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            label = row["label"]
            url = row["url"]
            sym = row.get("symbol","UNK")
            pair = row.get("pair_abbr","XX")
            out = (OUT_VALID if label == "valid" else OUT_INVALID) / f"{pair}_{sym}_{count}.png"
            shot(driver, url, out)
            print("saved:", out)
            count += 1
            if limit and count >= limit:
                break
    driver.quit()
    print("✅ Done")

if __name__ == "__main__":
    import sys
    lim = int(sys.argv[1]) if len(sys.argv)>1 else None
    main(lim)
