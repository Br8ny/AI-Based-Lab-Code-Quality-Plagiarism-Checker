"""Embedding similarity using TF-IDF cosine similarity (no GPU/cloud needed)."""
import re
import math
from collections import Counter


def _preprocess(code: str) -> list:
    """Clean code and extract meaningful tokens."""
    code = re.sub(r'//.*|#.*|/\*[\s\S]*?\*/', '', code)
    code = re.sub(r'"[^"]*"|\'[^\']*\'', '', code)
    tokens = re.findall(r'[A-Za-z_]\w+', code)
    return [t.lower() for t in tokens if len(t) > 1]


def _tfidf_vector(doc_tokens: list, all_docs_tokens: list) -> dict:
    """Compute TF-IDF vector for a document."""
    N = len(all_docs_tokens)
    tf = Counter(doc_tokens)
    total = len(doc_tokens) or 1
    vector = {}
    for term, count in tf.items():
        tf_val = count / total
        df = sum(1 for d in all_docs_tokens if term in set(d))
        idf = math.log((N + 1) / (df + 1)) + 1
        vector[term] = tf_val * idf
    return vector


def _cosine_similarity(vec_a: dict, vec_b: dict) -> float:
    """Compute cosine similarity between two TF-IDF vectors."""
    all_terms = set(vec_a) | set(vec_b)
    if not all_terms:
        return 0.0
    dot = sum(vec_a.get(t, 0) * vec_b.get(t, 0) for t in all_terms)
    mag_a = math.sqrt(sum(v**2 for v in vec_a.values()))
    mag_b = math.sqrt(sum(v**2 for v in vec_b.values()))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def compute_embedding_similarity(code_a: str, code_b: str) -> float:
    """Compute TF-IDF cosine similarity between two code files."""
    tokens_a = _preprocess(code_a)
    tokens_b = _preprocess(code_b)
    if not tokens_a or not tokens_b:
        return 0.0

    all_docs = [tokens_a, tokens_b]
    vec_a = _tfidf_vector(tokens_a, all_docs)
    vec_b = _tfidf_vector(tokens_b, all_docs)
    return round(_cosine_similarity(vec_a, vec_b), 4)
