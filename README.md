# AI-Based Lab Code Quality & Plagiarism Checker

**Academia Lab Analyzer** — a self-hosted tool that helps instructors screen a full
cohort's lab submissions for copied code and poor coding habits in one pass.

Upload a folder of student solutions (or a ZIP), and the tool parses every file,
compares each pair of students, scores code quality, flags likely bugs, and produces
a similarity heatmap plus PDF/CSV reports. Everything runs locally — no code leaves
the machine and there is no cloud service to configure.

![License](https://img.shields.io/badge/license-MIT-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite-61dafb)
![Languages](https://img.shields.io/badge/languages-Python%20%C2%B7%20C%2FC%2B%2B%20%C2%B7%20Java-informational)

---

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Try it with sample data](#try-it-with-sample-data)
- [API reference](#api-reference)
- [Reports](#reports)
- [Continuous integration](#continuous-integration)
- [Contributing](#contributing)
- [Limitations](#limitations)
- [License](#license)

---

## Features

| Area | What you get |
|---|---|
| **Plagiarism detection** | Pairwise similarity across the cohort, combining AST structure, token overlap and TF-IDF embedding cosine similarity |
| **Code quality scoring** | Cyclomatic complexity, function count and length, comment density, line counts → single 0–100 score |
| **Bug detection** | Infinite loops, bare `except`, mutable default arguments, missing semicolons/headers and other common student mistakes |
| **Similarity heatmap** | Full N×N matrix; click any cell to open a side-by-side comparison of the two submissions |
| **Student report cards** | Per-student metrics, detected language, flagged bugs and the raw source used for the analysis |
| **Export** | One-click PDF and CSV reports for the whole assignment |
| **Live progress** | WebSocket-driven step tracker while parsing, tree-building and scoring run |
| **Batch intake** | Accepts individual files or ZIP archives; students are grouped automatically by filename |

Supported languages: **Python**, **C/C++** and **Java**.

---

## How it works

```
                      ┌───────────────────────────┐
   upload ZIP / files │  POST /api/upload         │
  ───────────────────►│  extract + group by name  │
                      └────────────┬──────────────┘
                                   ▼
                      ┌───────────────────────────┐
                      │  POST /api/analyze/{id}   │  ── background task
                      └────────────┬──────────────┘        │
                                   ▼                       │
        ┌──────────────────────────────────────────┐      │  WS progress
        │  per student: detect language → parse     │◄─────┘  /ws/progress/{id}
        └──────────────────┬───────────────────────┘
                           ▼
        ┌──────────────────────────────────────────┐
        │  pairwise similarity (all student pairs)  │
        │  0.40 · AST  +  0.35 · Token  +  0.25 ·   │
        │  Embedding                                 │
        └──────────────────┬───────────────────────┘
                           ▼
        ┌──────────────────────────────────────────┐
        │  per student: quality score + bug scan    │
        └──────────────────┬───────────────────────┘
                           ▼
              GET /api/results/{id}  →  dashboard, heatmap,
                                        comparisons, exports
```

The combined similarity score is deliberately weighted toward **AST structure**
(40%) so that renaming variables or reformatting whitespace — the two tricks students
reach for first — do not hide a copy. Token overlap (35%) catches reordered but
structurally different implementations, and TF-IDF cosine similarity (25%) catches
solutions that only share vocabulary and boilerplate.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.9+, FastAPI, Uvicorn, WebSockets |
| Analysis | `radon` (complexity), `scikit-learn` (TF-IDF), `javalang` (Java parsing), `pycparser` (C parsing) |
| Reporting | `reportlab` (PDF), stdlib `csv` |
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 3 |
| State & data | Zustand, Axios, React Dropzone, Recharts, Framer Motion, PrismJS |
| Tooling | ESLint, PostCSS/Autoprefixer, GitHub Actions |

---

## Project structure

```
AI-Based-Lab-Code-Quality-Plagiarism-Checker/
├── backend/
│   ├── main.py                     # FastAPI app, routes, WebSocket progress
│   ├── requirements.txt
│   └── core/
│       ├── file_handler.py         # ZIP extraction + grouping files by student
│       ├── language_detector.py    # C / C++ / Java / Python detection
│       ├── ast_similarity.py       # AST node-sequence similarity
│       ├── token_similarity.py     # Jaccard + bigram token overlap
│       ├── embedding_similarity.py # TF-IDF vectors + cosine similarity
│       ├── quality_analyzer.py     # Complexity, function & comment metrics
│       ├── bug_detector.py         # Pattern-based defect detection
│       └── report_generator.py     # PDF and CSV export
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── pages/                  # Landing, Processing, Dashboard, Heatmap,
│       │                           # StudentDetail, Comparison, Reports,
│       │                           # Login, Signup
│       ├── components/             # Navbar, FileDropzone, ProtectedRoute,
│       │                           # NoDataState
│       ├── store/                  # Zustand stores (auth + analysis state)
│       ├── api/index.js            # Axios API layer
│       └── App.css / index.css     # Tailwind + custom styles
├── sample_submissions/             # Four demo Python submissions
├── start_backend.bat               # Windows one-click backend launcher
├── start_frontend.bat              # Windows one-click frontend launcher
├── .github/workflows/ci.yml        # Lint + build pipeline
├── CONTRIBUTING.md
└── LICENSE
```

`backend/uploads/`, `backend/results/` and `backend/reports/` are created at runtime
and are git-ignored — nothing generated during an analysis is committed.

---

## Getting started

### Prerequisites

- **Python 3.9+** — <https://www.python.org/downloads/>
- **Node.js 20+** — <https://nodejs.org/>

### Option A — one-click launchers (Windows)

```bat
start_backend.bat      :: installs deps, serves http://localhost:8000
start_frontend.bat     :: installs deps, serves http://localhost:5173
```

### Option B — manual

Backend:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend (new terminal):

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The FastAPI interactive docs are available at
<http://localhost:8000/docs>.

---

## Configuration

Both services default to `localhost` and need no configuration for local use.

| Variable | Used by | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE` | frontend | `http://localhost:8000` | Base URL for REST calls |
| `VITE_WS_BASE` | frontend | derived from `VITE_API_BASE` (`http` → `ws`) | Base URL for the progress WebSocket |

Create `frontend/.env.local` (git-ignored) if the backend runs on another host:

```bash
VITE_API_BASE=http://192.168.1.20:8000
```

> Pointing the browser at an unfamiliar host also requires tightening the CORS
> `allow_origins` list in `backend/main.py`; the default is permissive for local
> development only.

---

## Try it with sample data

`sample_submissions/` contains four Python solutions to the same sorting-algorithms
lab, written to exercise every detection path.

1. Start both services and open <http://localhost:5173>.
2. Sign up for a local account, then start a new analysis.
3. Assignment name: `Lab 3 - Sorting Algorithms`, language: `Python`.
4. Upload all four files from `sample_submissions/`.
5. Click **Analyze Submissions** and watch the progress steps.

What to expect:

| Student | Expected outcome |
|---|---|
| `alice_johnson.py` | Baseline — clean, well-commented implementation |
| `bob_smith.py` | High similarity to Alice (structure preserved, identifiers renamed) |
| `carol_davis.py` | Low similarity — genuinely independent solution |
| `david_lee.py` | Low similarity, but a low quality score and several flagged bugs |

---

## API reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Multipart upload of one or more files/ZIPs. Returns `session_id`, detected student names and file count |
| `POST` | `/api/analyze/{session_id}` | Starts the background pipeline. Query params: `language` (`auto`\|`python`\|`c`\|`cpp`\|`java`), `assignment_name` |
| `GET` | `/api/results/{session_id}` | Returns `status` and, once finished, the full result payload |
| `GET` | `/ws/progress/{session_id}` | WebSocket stream of `{step, message, sub, total_steps}` progress events |
| `GET` | `/api/report/{session_id}/pdf` | Downloads the assignment report as PDF |
| `GET` | `/api/report/{session_id}/csv` | Downloads the metrics table as CSV |

Result payload shape:

```jsonc
{
  "students": ["alice_johnson", "bob_smith"],
  "similarity_matrix": {
    "alice_johnson||bob_smith": {
      "ast": 0.91, "token": 0.84, "embedding": 0.77, "combined": 0.85
    }
  },
  "quality": {
    "alice_johnson": {
      "cyclomatic_complexity": 6,
      "num_functions": 2,
      "avg_function_length": 8.5,
      "max_function_length": 12.0,
      "comment_density": 0.21,
      "total_lines": 42, "code_lines": 33, "comment_lines": 9,
      "quality_score": 88,
      "bugs": [{ "type": "bare_except", "line": 17 }],
      "language": "python",
      "code": "// full source, retained for the comparison view"
    }
  },
  "detected_languages": { "alice_johnson": "python" }
}
```

---

## Reports

- **PDF** — assignment header, cohort summary, the full similarity matrix, per-student
  quality metrics and the bug list.
- **CSV** — one row per student plus the pairwise similarity table, suitable for
  grading spreadsheets.

Both are generated on demand from the live session, so the exported numbers always
match what the dashboard shows.

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request to `main`:

1. **Backend** — installs `requirements.txt` on Python 3.11 and compiles every module.
2. **Frontend** — `npm ci`, then ESLint, then a production build.

A red pipeline blocks merge; see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Contributing

Bug reports, feature ideas and pull requests are welcome — read
[CONTRIBUTING.md](CONTRIBUTING.md) for the setup steps, code conventions and commit
style before opening a PR.

---

## Limitations

- Sessions live in memory: restarting the backend discards them, and results are not
  shared between multiple server workers. This is a single-instructor tool, not a
  multi-tenant service.
- Authentication is a client-side demonstration flow — there is no backend user
  store, so the API itself is unauthenticated. Do not expose port 8000 publicly.
- Similarity scores are a screening signal, not proof of misconduct. Always review
  the side-by-side comparison before making an academic judgement.
- Heuristic bug detection produces false positives on purpose (it favours recall
  for teaching feedback).

---

## License

Released under the [MIT License](LICENSE).
