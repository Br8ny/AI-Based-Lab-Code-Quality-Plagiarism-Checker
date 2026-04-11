"""Code quality analysis: cyclomatic complexity, function length, comment density."""
import ast
import re


def analyze_quality(code: str, language: str = "python") -> dict:
    """Return quality metrics dict."""
    if language == "python":
        return _analyze_python(code)
    elif language == "java":
        return _analyze_generic(code, "java")
    elif language == "c":
        return _analyze_generic(code, "c")
    return _analyze_generic(code, language)


def _analyze_python(code: str) -> dict:
    """Python-specific analysis using ast module."""
    complexity = 0
    function_lengths = []
    lines = code.splitlines()
    total_lines = len(lines)
    blank_lines = sum(1 for l in lines if not l.strip())
    comment_lines = sum(1 for l in lines if l.strip().startswith("#"))
    code_lines = total_lines - blank_lines - comment_lines

    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                # Get function body line count
                body_lines = (node.end_lineno - node.lineno + 1) if hasattr(node, 'end_lineno') else 10
                function_lengths.append(body_lines)
            # Cyclomatic complexity: count decision nodes
            if isinstance(node, (ast.If, ast.For, ast.While, ast.Try,
                                   ast.ExceptHandler, ast.With, ast.Assert)):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
    except SyntaxError:
        complexity = _count_decisions_regex(code)

    avg_func_length = round(sum(function_lengths) / len(function_lengths), 1) if function_lengths else 0
    max_func_length = max(function_lengths) if function_lengths else 0
    comment_density = round((comment_lines / total_lines * 100), 1) if total_lines > 0 else 0
    num_functions = len(function_lengths)

    # Score calculation (0-100)
    score = _compute_score(complexity, avg_func_length, comment_density, code_lines)

    return {
        "cyclomatic_complexity": max(1, complexity),
        "num_functions": num_functions,
        "avg_function_length": avg_func_length,
        "max_function_length": max_func_length,
        "comment_density": comment_density,
        "total_lines": total_lines,
        "code_lines": code_lines,
        "comment_lines": comment_lines,
        "quality_score": score,
    }


def _analyze_generic(code: str, lang: str) -> dict:
    """Generic analysis for C and Java using regex."""
    lines = code.splitlines()
    total_lines = len(lines)
    blank_lines = sum(1 for l in lines if not l.strip())

    if lang == "c":
        comment_lines = sum(1 for l in lines if l.strip().startswith("//") or l.strip().startswith("/*") or l.strip().startswith("*"))
    else:
        comment_lines = sum(1 for l in lines if l.strip().startswith("//") or l.strip().startswith("/*") or l.strip().startswith("*"))

    code_lines = total_lines - blank_lines - comment_lines
    complexity = _count_decisions_regex(code)

    # Count functions
    if lang == "c":
        func_pattern = r'\b\w+\s+\w+\s*\([^)]*\)\s*\{'
    else:
        func_pattern = r'(public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\([^)]*\)\s*(throws[^{]*)?\{'

    functions = re.findall(func_pattern, code)
    num_functions = len(functions)

    comment_density = round(comment_lines / total_lines * 100, 1) if total_lines > 0 else 0
    avg_func_length = round(code_lines / num_functions, 1) if num_functions > 0 else code_lines
    score = _compute_score(complexity, avg_func_length, comment_density, code_lines)

    return {
        "cyclomatic_complexity": max(1, complexity),
        "num_functions": num_functions,
        "avg_function_length": avg_func_length,
        "max_function_length": avg_func_length,
        "comment_density": comment_density,
        "total_lines": total_lines,
        "code_lines": code_lines,
        "comment_lines": comment_lines,
        "quality_score": score,
    }


def _count_decisions_regex(code: str) -> int:
    """Count decision points using regex for any language."""
    patterns = [
        r'\bif\b', r'\belse if\b', r'\belif\b', r'\bfor\b', r'\bwhile\b',
        r'\bcase\b', r'\bcatch\b', r'&&', r'\|\|', r'\?[^:]',
    ]
    count = 0
    for p in patterns:
        count += len(re.findall(p, code))
    return count


def _compute_score(complexity: int, avg_func_len: float, comment_density: float, code_lines: int) -> int:
    """Compute quality score 0-100."""
    score = 100

    # Penalize high complexity
    if complexity > 20:
        score -= 30
    elif complexity > 10:
        score -= 15
    elif complexity > 5:
        score -= 5

    # Penalize long functions
    if avg_func_len > 100:
        score -= 25
    elif avg_func_len > 50:
        score -= 15
    elif avg_func_len > 30:
        score -= 5

    # Reward comment density
    if comment_density < 5:
        score -= 20
    elif comment_density < 10:
        score -= 10
    elif comment_density > 30:
        score += 5

    # Small bonus for reasonable code size
    if 20 <= code_lines <= 300:
        score += 5

    return max(0, min(100, score))
