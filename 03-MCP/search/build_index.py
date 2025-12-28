import os
import requests
from pathlib import Path
import zipfile
import json

DATA_DIR = Path(__file__).resolve().parent / 'data'
DATA_DIR.mkdir(exist_ok=True)
ZIP_URL = 'https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip'
ZIP_NAME = DATA_DIR / 'fastmcp-main.zip'

# Download if not exists
if not ZIP_NAME.exists():
    print(f'Downloading {ZIP_URL} -> {ZIP_NAME}')
    resp = requests.get(ZIP_URL, stream=True, timeout=30)
    resp.raise_for_status()
    with open(ZIP_NAME, 'wb') as f:
        for chunk in resp.iter_content(1024 * 1024):
            f.write(chunk)
else:
    print(f'Zip already downloaded: {ZIP_NAME}')

# Iterate zip files under data
docs = []
for zip_path in DATA_DIR.glob('*.zip'):
    print('Processing', zip_path)
    with zipfile.ZipFile(zip_path, 'r') as z:
        for name in z.namelist():
            lname = name.lower()
            if lname.endswith('.md') or lname.endswith('.mdx'):
                try:
                    raw = z.read(name)
                    text = raw.decode('utf-8')
                except Exception:
                    try:
                        text = raw.decode('latin-1')
                    except Exception:
                        text = raw.decode('utf-8', 'replace')
                # normalize filename by removing first path component
                parts = name.split('/', 1)
                normalized = parts[1] if len(parts) > 1 else parts[0]
                docs.append({'filename': normalized, 'content': text})

print(f'Collected {len(docs)} markdown files')
# Save docs to disk
OUT = DATA_DIR / 'docs.json'
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(docs, f, ensure_ascii=False)
print('Wrote', OUT)
