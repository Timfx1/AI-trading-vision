# scripts/import_from_spreadsheet.py
import pandas as pd, os, uuid, time

PAIR_MAP = {'GU':'GBPUSD','UZ':'USDZAR','XU':'XAUUSD','XA':'XAUUSD','AC':'AUDCAD'}

def map_symbol(abbr:str)->str:
    return PAIR_MAP.get(abbr.strip(), abbr.strip())

def main(xlsx_path: str, out_dir: str = "data"):
    os.makedirs(out_dir, exist_ok=True)
    df = pd.read_excel(xlsx_path, sheet_name=0)
    rows = []
    for _, row in df.iterrows():
        r = row.get('R')
        if pd.isna(r): 
            continue
        try:
            r_val = int(r)
        except Exception:
            continue  # ignore BE/empty/merged
        label = 'valid' if r_val == 1 else 'invalid' if r_val == -1 else None
        if not label:
            continue
        url = row.get('After') if isinstance(row.get('After'), str) and row['After'].startswith('http') else row.get('Before')
        if not isinstance(url, str) or not url.startswith('http'):
            continue
        abbr = str(row.get('Pair') or '').strip()
        rows.append({
            'id': str(uuid.uuid4()),
            'pair_abbr': abbr,
            'symbol': map_symbol(abbr),
            'label': label,
            'url': url,
            'notes': row.get('Remark', ''),
            'added_at': time.strftime('%Y-%m-%d'),
        })
    out_csv = os.path.join(out_dir, "setups.csv")
    pd.DataFrame(rows).to_csv(out_csv, index=False)
    with open(os.path.join(out_dir, "links_valid.txt"), "w") as f:
        f.write("\n".join([r['url'] for r in rows if r['label']=='valid']))
    with open(os.path.join(out_dir, "links_invalid.txt"), "w") as f:
        f.write("\n".join([r['url'] for r in rows if r['label']=='invalid']))
    print(f"✅ Wrote {len(rows)} rows → {out_csv}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: py scripts/import_from_spreadsheet.py <path_to_excel>")
        raise SystemExit(2)
    main(sys.argv[1])
