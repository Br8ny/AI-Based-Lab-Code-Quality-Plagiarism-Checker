"""Token-based similarity using Jaccard index on normalized token sets."""
import re


def tokenize(code: str) -> list:
    """Normalize and tokenize source code."""
    # Remove strings
    code = re.sub(r'"[^"]*"', 'STR', code)
    code = re.sub(r"'[^']*'", 'STR', code)
    # Remove comments
    code = re.sub(r'//.*', '', code)
    code = re.sub(r'/\*[\s\S]*?\*/', '', code)
    code = re.sub(r'#[^\n]*', '', code)
    # Extract tokens (words and operators)
    tokens = re.findall(r'[A-Za-z_]\w*|[+\-*/=<>!&|]+|[0-9]+', code)
    # Normalize identifiers (rename user-defined names to VAR)
    keywords = {
        'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue',
        'class', 'def', 'import', 'from', 'int', 'float', 'char', 'void',
        'public', 'private', 'static', 'String', 'new', 'this', 'super',
        'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'with',
        'try', 'except', 'finally', 'raise', 'pass', 'lambda', 'yield',
    }
    normalized = []
    for t in tokens:
        if t in keywords:
            normalized.append(t)
        elif t.isdigit():
            normalized.append('NUM')
        else:
            normalized.append('ID')
    return normalized


def compute_token_similarity(code_a: str, code_b: str) -> float:
    """Jaccard similarity on normalized token sets."""
    toks_a = tokenize(code_a)
    toks_b = tokenize(code_b)
    if not toks_a or not toks_b:
        return 0.0

    set_a = set(toks_a)
    set_b = set(toks_b)
    jaccard = len(set_a & set_b) / len(set_a | set_b) if (set_a | set_b) else 0.0

    # N-gram bigram overlap
    bigrams_a = set(zip(toks_a, toks_a[1:]))
    bigrams_b = set(zip(toks_b, toks_b[1:]))
    bigram_sim = (
        len(bigrams_a & bigrams_b) / len(bigrams_a | bigrams_b)
        if (bigrams_a | bigrams_b) else 0.0
    )

    return round((jaccard + bigram_sim) / 2, 4)
