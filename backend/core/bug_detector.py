"""Bug detection for common patterns in Python, Java, and C."""
import ast
import re


def detect_bugs(code: str, language: str = "python") -> list:
    """Return list of bug warning dicts {line, type, message, severity}."""
    bugs = []
    if language == "python":
        bugs.extend(_detect_python_bugs(code))
    elif language in ("c", "java"):
        bugs.extend(_detect_generic_bugs(code, language))
    bugs.extend(_detect_naming_issues(code))
    return bugs


def _detect_python_bugs(code: str) -> list:
    bugs = []
    lines = code.splitlines()

    # Detect bare except
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped == "except:" or stripped == "except :":
            bugs.append({
                "line": i,
                "type": "BareExcept",
                "message": "Bare `except:` catches all exceptions including system exits. Specify exception type.",
                "severity": "warning"
            })

    # Detect mutable default arguments
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for default in node.args.defaults:
                    if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                        bugs.append({
                            "line": node.lineno,
                            "type": "MutableDefault",
                            "message": f"Function `{node.name}` uses mutable default argument. Use `None` as default.",
                            "severity": "error"
                        })
    except SyntaxError:
        pass

    # Detect `while True` without break
    for i, line in enumerate(lines, 1):
        if re.search(r'\bwhile\s+True\b', line) or re.search(r'\bwhile\s+1\b', line):
            # Check if there's a break within next 20 lines
            block = lines[i:min(i + 20, len(lines))]
            if not any("break" in l for l in block):
                bugs.append({
                    "line": i,
                    "type": "InfiniteLoop",
                    "message": "`while True` detected without a `break` in the next 20 lines. Possible infinite loop.",
                    "severity": "error"
                })

    # Detect == None instead of is None
    for i, line in enumerate(lines, 1):
        if re.search(r'==\s*None', line) and "!=" not in line:
            bugs.append({
                "line": i,
                "type": "NoneComparison",
                "message": "Use `is None` instead of `== None` for identity check.",
                "severity": "warning"
            })

    return bugs


def _detect_generic_bugs(code: str, language: str) -> list:
    bugs = []
    lines = code.splitlines()

    # Detect potential null pointer dereference patterns (Java)
    if language == "java":
        for i, line in enumerate(lines, 1):
            if re.search(r'\w+\s*=\s*null\s*;', line):
                bugs.append({
                    "line": i,
                    "type": "NullAssignment",
                    "message": "Variable set to null. Ensure null check before use to avoid NullPointerException.",
                    "severity": "warning"
                })

    # Detect while(1)/while(true) without break
    for i, line in enumerate(lines, 1):
        if re.search(r'while\s*\(\s*(1|true)\s*\)', line):
            block = lines[i:min(i + 20, len(lines))]
            if not any("break" in l for l in block):
                bugs.append({
                    "line": i,
                    "type": "InfiniteLoop",
                    "message": "`while(true)` or `while(1)` detected without a `break`. Possible infinite loop.",
                    "severity": "error"
                })

    # Detect C: using variable before assignment (heuristic)
    if language == "c":
        for i, line in enumerate(lines, 1):
            m = re.match(r'\s*(int|float|char|double)\s+(\w+)\s*;', line)
            if m:
                var = m.group(2)
                # Check if used before assigned
                prev_lines = "\n".join(lines[i:min(i + 5, len(lines))])
                if var in prev_lines and "=" not in (lines[i] if i < len(lines) else ""):
                    bugs.append({
                        "line": i + 1,
                        "type": "UninitializedVariable",
                        "message": f"Variable `{var}` declared but may be used before initialization.",
                        "severity": "warning"
                    })

    return bugs


def _detect_naming_issues(code: str) -> list:
    """Detect single-character variable names (poor naming)."""
    bugs = []
    lines = code.splitlines()
    bad_names = re.compile(r'\b([a-z])\s*=\s*[^=]')
    allowed_single = {'i', 'j', 'k', 'n', 'x', 'y', 'z'}

    for i, line in enumerate(lines, 1):
        for m in bad_names.finditer(line):
            name = m.group(1)
            if name not in allowed_single:
                bugs.append({
                    "line": i,
                    "type": "PoorNaming",
                    "message": f"Single-character variable `{name}` used. Use descriptive variable names.",
                    "severity": "info"
                })
                break  # max one per line

    return bugs
