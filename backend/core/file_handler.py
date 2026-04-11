"""File handler: extract ZIPs, group files by student."""
import zipfile
import shutil
from pathlib import Path
from collections import defaultdict

SUPPORTED_EXTENSIONS = {".py", ".c", ".h", ".java"}


def extract_and_group_files(session_dir: Path, file_paths: list) -> dict:
    """Extract ZIPs and group files by student name."""
    students = defaultdict(list)

    for fp in file_paths:
        path = Path(fp)
        if path.suffix.lower() == ".zip":
            # Extract ZIP
            extract_dir = session_dir / path.stem
            extract_dir.mkdir(exist_ok=True)
            try:
                with zipfile.ZipFile(fp, "r") as z:
                    z.extractall(extract_dir)
                _scan_directory(extract_dir, students)
            except Exception as e:
                print(f"Error extracting {fp}: {e}")
        elif path.suffix.lower() in SUPPORTED_EXTENSIONS:
            # Individual file — use filename (without extension) as student name
            student_name = path.stem
            students[student_name].append(str(path))

    # If no students detected, treat each file as a student
    if not students:
        for fp in file_paths:
            path = Path(fp)
            if path.suffix.lower() in SUPPORTED_EXTENSIONS:
                students[path.stem].append(str(path))

    return dict(students)


def _scan_directory(directory: Path, students: defaultdict):
    """Recursively scan directory, group code files by top-level subfolder."""
    code_files = list(directory.rglob("*"))
    code_files = [f for f in code_files if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS]

    for file in code_files:
        # Use parent folder name relative to directory as student name
        try:
            rel = file.relative_to(directory)
            parts = rel.parts
            if len(parts) > 1:
                student_name = parts[0]
            else:
                student_name = file.stem
            students[student_name].append(str(file))
        except Exception:
            students[file.stem].append(str(file))
