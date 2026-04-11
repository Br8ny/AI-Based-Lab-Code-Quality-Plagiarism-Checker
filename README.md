# AI-Based Lab Code Quality & Plagiarism Checker

A production-ready academic tool for professors and institutions to detect plagiarism and evaluate code quality across student submissions — running **100% locally** on a laptop with no cloud dependencies.

## ✨ Features

| Feature | Details |
|---|---|
| **Plagiarism Detection** | AST + Token + TF-IDF Embedding similarity (weighted) |
| **Code Quality** | Cyclomatic complexity, function length, comment density |
| **Bug Detection** | Infinite loops, bare except, mutable defaults, uninitialized vars |
| **Interactive Heatmap** | Click any cell to compare two students side-by-side |
| **Reports** | PDF + CSV export with full metrics |
| **Real-time Progress** | WebSocket-driven animated processing steps |
| **Languages** | Python 🐍 · C/C++ ⚡ · Java ☕ |

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+** — [Download](https://python.org/downloads)
- **Node.js 18+** — [Download](https://nodejs.org)

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs at → **http://localhost:8000**

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend opens at → **http://localhost:5173**

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── main.py                    # FastAPI app + WebSocket
│   ├── requirements.txt
│   └── core/
│       ├── file_handler.py        # ZIP extraction, student grouping
│       ├── language_detector.py   # Auto-detect C/Python/Java
│       ├── ast_similarity.py      # AST structural similarity
│       ├── token_similarity.py    # Jaccard token similarity
│       ├── embedding_similarity.py # TF-IDF cosine similarity
│       ├── quality_analyzer.py    # Cyclomatic complexity, metrics
│       ├── bug_detector.py        # Pattern-based bug detection
│       └── report_generator.py   # PDF + CSV reports
├── frontend/
│   ├── src/
│   │   ├── pages/                 # 7 full pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ProcessingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HeatmapPage.jsx
│   │   │   ├── StudentDetailPage.jsx
│   │   │   ├── ComparisonPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── FileDropzone.jsx
│   │   ├── store/useStore.js      # Zustand global state
│   │   └── api/index.js           # Axios API layer
└── sample_submissions/            # 4 demo Python files
    ├── alice_johnson.py           # Original
    ├── bob_smith.py               # Copy (high similarity)
    ├── carol_davis.py             # Independent clean code
    └── david_lee.py               # Poor quality + bugs
```

---

## 🧪 Testing with Sample Data

1. Open **http://localhost:5173**
2. Enter assignment name: `Lab 3 - Sorting Algorithms`
3. Select language: `Python`
4. Upload all 4 files from **`sample_submissions/`**
5. Click **Analyze Submissions**

**Expected results:**
- 🔴 `bob_smith` → high similarity with alice (~80%)
- 🟢 `carol_davis` → safe (independent implementation)
- 🟡 `david_lee` → multiple bugs detected, poor quality score

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/upload` | POST | Upload files/ZIP |
| `/api/analyze/{session_id}` | POST | Start analysis |
| `/api/results/{session_id}` | GET | Fetch results |
| `/ws/progress/{session_id}` | WS | Real-time progress |
| `/api/report/{session_id}/pdf` | GET | Download PDF |
| `/api/report/{session_id}/csv` | GET | Download CSV |

---

## 🔮 Similarity Algorithm

Combined score = `0.40 × AST + 0.35 × Token + 0.25 × Embedding`

| Method | Technique |
|---|---|
| AST Similarity | Parse to AST, compare node-type sequences |
| Token Similarity | Jaccard + bigram overlap on normalized tokens |
| Embedding Similarity | TF-IDF vectorizer + cosine similarity |

---

*Built with React + Vite + Tailwind CSS (frontend) and Python FastAPI (backend).*
