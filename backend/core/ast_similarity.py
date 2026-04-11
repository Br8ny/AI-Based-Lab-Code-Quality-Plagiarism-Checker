"""AST-based structural similarity for Python, Java, and C."""
import ast
import re


def compute_ast_similarity(code_a: str, code_b: str, language: str = "python") -> float:
    """Compute AST structural similarity as overlapping node types ratio."""
    try:
        if language == "python":
            return _python_ast_sim(code_a, code_b)
        elif language == "java":
            return _java_ast_sim(code_a, code_b)
        elif language == "c":
            return _c_structural_sim(code_a, code_b)
    except Exception:
        pass
    return _fallback_structural_sim(code_a, code_b)


def _get_python_ast_nodes(code: str) -> list:
    """Extract sequence of AST node type names from Python code."""
    try:
        tree = ast.parse(code)
        return [type(node).__name__ for node in ast.walk(tree)]
    except SyntaxError:
        return []


def _python_ast_sim(code_a: str, code_b: str) -> float:
    nodes_a = _get_python_ast_nodes(code_a)
    nodes_b = _get_python_ast_nodes(code_b)
    if not nodes_a or not nodes_b:
        return 0.0
    set_a = set(nodes_a)
    set_b = set(nodes_b)
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    jaccard = intersection / union if union > 0 else 0.0

    # Also compute sequence overlap ratio
    seq_sim = _lcs_ratio(nodes_a[:200], nodes_b[:200])
    return round((jaccard + seq_sim) / 2, 4)


def _java_ast_sim(code_a: str, code_b: str) -> float:
    """Java AST similarity using javalang if available, else structural heuristics."""
    try:
        import javalang
        def get_nodes(code):
            tokens = list(javalang.tokenize(code))
            return [t.__class__.__name__ for t in tokens]
        nodes_a = get_nodes(code_a)
        nodes_b = get_nodes(code_b)
        set_a, set_b = set(nodes_a), set(nodes_b)
        intersection = len(set_a & set_b)
        union = len(set_a | set_b)
        return intersection / union if union > 0 else 0.0
    except Exception:
        return _fallback_structural_sim(code_a, code_b)


def _c_structural_sim(code_a: str, code_b: str) -> float:
    """C structural similarity using keyword + operator pattern extraction."""
    def extract_patterns(code):
        keywords = re.findall(r'\b(if|else|for|while|do|switch|case|return|int|float|char|void|struct|include|define)\b', code)
        return keywords

    pat_a = extract_patterns(code_a)
    pat_b = extract_patterns(code_b)
    if not pat_a or not pat_b:
        return 0.0
    set_a, set_b = set(pat_a), set(pat_b)
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0


def _fallback_structural_sim(code_a: str, code_b: str) -> float:
    """Fallback: line structure comparison."""
    lines_a = [l.strip() for l in code_a.splitlines() if l.strip()]
    lines_b = [l.strip() for l in code_b.splitlines() if l.strip()]
    if not lines_a or not lines_b:
        return 0.0
    set_a = set(lines_a)
    set_b = set(lines_b)
    return len(set_a & set_b) / len(set_a | set_b) if set_a | set_b else 0.0


def _lcs_ratio(a: list, b: list) -> float:
    """Approximate LCS ratio using the shorter list to avoid O(n^2) blowup."""
    if not a or not b:
        return 0.0
    max_len = max(len(a), len(b))
    # Fast approximation: count elements in a that appear in b
    b_set = set(b)
    matches = sum(1 for x in a if x in b_set)
    return matches / max_len
