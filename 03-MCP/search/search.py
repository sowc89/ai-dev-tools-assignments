import json
from minsearch import Index
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / 'data'
DOCS_FILE = DATA_DIR / 'docs.json'

def build_index(docs):
    # create index over content; keep filename as keyword field
    idx = Index(text_fields=['content'], keyword_fields=['filename'])
    idx.fit(docs)
    return idx


def load_docs():
    with open(DOCS_FILE, 'r', encoding='utf-8') as f:
        docs = json.load(f)
    return docs


def search(query, top_n=5):
    docs = load_docs()
    idx = build_index(docs)
    results = idx.search(query, num_results=top_n)
    # results is a list; entries likely contain 'doc' or include doc fields
    output = []
    for item in results:
        # item can be (doc, score) or dict — inspect
        if isinstance(item, dict):
            # attempt to find filename and score
            fname = item.get('filename') or item.get('id')
            score = item.get('score')
            content = item.get('content')
            output.append({'filename': fname, 'score': score, 'content': content})
        elif isinstance(item, (list, tuple)) and len(item) >= 2:
            doc, score = item[0], item[1]
            if isinstance(doc, dict):
                output.append({'filename': doc.get('filename'), 'score': score, 'content': doc.get('content')})
            else:
                # doc may be id; retrieve from docs
                try:
                    docobj = docs[doc]
                    output.append({'filename': docobj.get('filename'), 'score': score, 'content': docobj.get('content')})
                except Exception:
                    output.append({'filename': str(doc), 'score': score, 'content': ''})
        else:
            output.append({'filename': str(item), 'score': None, 'content': ''})
    return output


if __name__ == '__main__':
    import sys
    q = 'example' if len(sys.argv) < 2 else ' '.join(sys.argv[1:])
    for r in search(q, top_n=5):
        print(r['score'], r['filename'])
