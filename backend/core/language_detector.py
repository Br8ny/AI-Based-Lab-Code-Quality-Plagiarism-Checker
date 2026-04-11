"""Language detection based on file extension and content heuristics."""
from pathlib import Path


def detect_language(filepath: str) -> str:
    ext = Path(filepath).suffix.lower()
    if ext == ".py":
        return "python"
    elif ext in (".c", ".h"):
        return "c"
    elif ext == ".java":
        return "java"
    # Heuristic: check content
    try:
        content = Path(filepath).read_text(encoding="utf-8", errors="replace")[:500]
        if "import java" in content or "public class" in content:
            return "java"
        elif "#include" in content:
            return "c"
        elif "def " in content or "import " in content:
            return "python"
    except Exception:
        pass
    return "python"  # default
