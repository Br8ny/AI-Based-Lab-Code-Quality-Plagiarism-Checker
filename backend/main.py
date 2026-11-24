import sys
import os
import ast
import re
import uuid
import zipfile
import asyncio
import shutil
import json
from pathlib import Path
from collections import defaultdict

from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

# add the project root to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from core.file_handler import extract_and_group_files
from core.language_detector import detect_language
from core.ast_similarity import compute_ast_similarity
from core.token_similarity import compute_token_similarity
from core.embedding_similarity import compute_embedding_similarity
from core.quality_analyzer import analyze_quality
from core.bug_detector import detect_bugs
from core.report_generator import generate_pdf, generate_csv

app = FastAPI(title="AI Code Quality & Plagiarism Checker API", version="1.0.0")

# Comma-separated list of browser origins allowed to call the API.
# Permissive by default so the Vite dev server works out of the box; set
# ALLOWED_ORIGINS in backend/.env when deploying (see backend/.env.example).
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
RESULTS_DIR = Path("results")
REPORTS_DIR = Path("reports")

for d in [UPLOAD_DIR, RESULTS_DIR, REPORTS_DIR]:
    d.mkdir(exist_ok=True)

# In-memory session store
sessions: dict = {}
progress_clients: dict = {}


@app.post("/api/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    """Accept ZIP or individual code files, group by student."""
    session_id = str(uuid.uuid4())
    session_dir = UPLOAD_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    saved_files = []
    for file in files:
        dest = session_dir / file.filename
        contents = await file.read()
        dest.write_bytes(contents)
        saved_files.append(str(dest))

    # Extract and group
    students = extract_and_group_files(session_dir, saved_files)
    sessions[session_id] = {"students": students, "status": "uploaded", "results": None}

    return {"session_id": session_id, "students": list(students.keys()), "file_count": len(saved_files)}


@app.post("/api/analyze/{session_id}")
async def analyze_session(session_id: str, language: str = "auto", assignment_name: str = "Assignment"):
    """Run full analysis pipeline asynchronously."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    sessions[session_id]["status"] = "analyzing"
    sessions[session_id]["assignment_name"] = assignment_name

    # Run analysis in background
    asyncio.create_task(_run_analysis(session_id, language))
    return {"message": "Analysis started", "session_id": session_id}


async def _run_analysis(session_id: str, language: str):
    """Background analysis task with WebSocket progress updates."""
    async def send_progress(step: int, message: str, sub: str = ""):
        data = {"step": step, "message": message, "sub": sub, "total_steps": 4}
        if session_id in progress_clients:
            for ws in list(progress_clients[session_id]):
                try:
                    await ws.send_json(data)
                except Exception:
                    progress_clients[session_id].discard(ws)

    try:
        students = sessions[session_id]["students"]
        student_names = list(students.keys())

        # Step 1: Parse code
        await send_progress(1, "Parsing source code...", "Reading student files")
        await asyncio.sleep(0.5)

        student_codes = {}
        detected_langs = {}
        for name, files in students.items():
            code = ""
            for fp in files:
                try:
                    code += Path(fp).read_text(encoding="utf-8", errors="replace") + "\n"
                except Exception:
                    pass
            student_codes[name] = code
            if language == "auto":
                detected_langs[name] = detect_language(files[0] if files else "")
            else:
                detected_langs[name] = language

        await send_progress(1, "Parsing source code...", f"Parsed {len(student_names)} submissions")
        await asyncio.sleep(0.3)

        # Step 2: AST generation
        await send_progress(2, "Generating Abstract Syntax Trees...", "Building AST for each submission")
        await asyncio.sleep(0.5)

        # Step 3: Compute similarity
        await send_progress(3, "Computing similarity scores...", "Running AST + Token + Embedding analysis")
        await asyncio.sleep(0.5)

        n = len(student_names)
        similarity_matrix = {}
        for i in range(n):
            for j in range(i + 1, n):
                a, b = student_names[i], student_names[j]
                code_a, code_b = student_codes.get(a, ""), student_codes.get(b, "")
                lang = detected_langs.get(a, "python")

                ast_sim = compute_ast_similarity(code_a, code_b, lang)
                tok_sim = compute_token_similarity(code_a, code_b)
                emb_sim = compute_embedding_similarity(code_a, code_b)

                combined = round(0.4 * ast_sim + 0.35 * tok_sim + 0.25 * emb_sim, 2)
                key = f"{a}||{b}"
                similarity_matrix[key] = {
                    "ast": round(ast_sim, 2),
                    "token": round(tok_sim, 2),
                    "embedding": round(emb_sim, 2),
                    "combined": combined,
                }

        await send_progress(3, "Computing similarity scores...", f"Computed {len(similarity_matrix)} pairs")
        await asyncio.sleep(0.3)

        # Step 4: Quality scoring
        await send_progress(4, "Scoring code quality & detecting bugs...", "Analyzing metrics")
        await asyncio.sleep(0.5)

        quality_results = {}
        for name, code in student_codes.items():
            lang = detected_langs.get(name, "python")
            quality = analyze_quality(code, lang)
            bugs = detect_bugs(code, lang)
            quality_results[name] = {**quality, "bugs": bugs, "language": lang, "code": code}

        await send_progress(4, "Scoring code quality & detecting bugs...", "Complete!")
        await asyncio.sleep(0.3)

        # Save results
        results = {
            "students": student_names,
            "similarity_matrix": similarity_matrix,
            "quality": quality_results,
            "detected_languages": detected_langs,
        }
        sessions[session_id]["results"] = results
        sessions[session_id]["status"] = "done"

        result_file = RESULTS_DIR / f"{session_id}.json"
        result_file.write_text(json.dumps(results, indent=2))

        # Final done signal
        if session_id in progress_clients:
            for ws in list(progress_clients[session_id]):
                try:
                    await ws.send_json({"step": 5, "message": "Analysis complete!", "sub": "", "total_steps": 4, "done": True})
                except Exception:
                    pass

    except Exception as e:
        sessions[session_id]["status"] = "error"
        sessions[session_id]["error"] = str(e)
        if session_id in progress_clients:
            for ws in list(progress_clients[session_id]):
                try:
                    await ws.send_json({"error": str(e)})
                except Exception:
                    pass


@app.get("/api/results/{session_id}")
async def get_results(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    session = sessions[session_id]
    if session["status"] != "done":
        return {"status": session["status"]}
    return {"status": "done", "data": session["results"], "assignment_name": session.get("assignment_name", "")}


@app.websocket("/ws/progress/{session_id}")
async def websocket_progress(websocket: WebSocket, session_id: str):
    await websocket.accept()
    if session_id not in progress_clients:
        progress_clients[session_id] = set()
    progress_clients[session_id].add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        progress_clients[session_id].discard(websocket)


@app.get("/api/report/{session_id}/pdf")
async def download_pdf(session_id: str):
    if session_id not in sessions or sessions[session_id].get("results") is None:
        raise HTTPException(status_code=404, detail="Results not ready")
    results = sessions[session_id]["results"]
    assignment = sessions[session_id].get("assignment_name", "Assignment")
    pdf_path = REPORTS_DIR / f"{session_id}.pdf"
    generate_pdf(results, assignment, str(pdf_path))
    return FileResponse(str(pdf_path), media_type="application/pdf", filename=f"{assignment}_report.pdf")


@app.get("/api/report/{session_id}/csv")
async def download_csv(session_id: str):
    if session_id not in sessions or sessions[session_id].get("results") is None:
        raise HTTPException(status_code=404, detail="Results not ready")
    results = sessions[session_id]["results"]
    assignment = sessions[session_id].get("assignment_name", "Assignment")
    csv_path = REPORTS_DIR / f"{session_id}.csv"
    generate_csv(results, str(csv_path))
    return FileResponse(str(csv_path), media_type="text/csv", filename=f"{assignment}_report.csv")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
