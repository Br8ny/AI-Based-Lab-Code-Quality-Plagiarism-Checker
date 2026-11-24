# Contributing

Thanks for taking the time to contribute. This document describes the conventions
this repository follows so that reviews stay fast and focused.

## Getting set up

```bash
git clone https://github.com/3rany/AI-Based-Lab-Code-Quality-Plagiarism-Checker.git
cd AI-Based-Lab-Code-Quality-Plagiarism-Checker

# Backend
cd backend && python -m venv .venv && source .venv/Scripts/activate
pip install -r requirements.txt

# Frontend
cd ../frontend && npm install
```

## Development workflow

1. Create a branch from `main`: `git checkout -b feat/your-change`.
2. Keep changes small and scoped to a single concern.
3. Verify locally before pushing (see below).
4. Open a pull request against `main` and fill in the PR template.

## Before you push

Backend:

```bash
python -m compileall backend          # syntax check every module
```

Frontend:

```bash
cd frontend
npm run lint
npm run build                         # production build must succeed
```

CI runs the same checks on every push and pull request — a red build blocks merge.

## Conventions

- **Commits** follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`,
  `chore:`, `test:`), are written in the imperative mood, and stay under ~72
  characters in the subject line.
- **Python**: PEP 8, type hints for public functions, docstrings for modules and
  non-trivial functions. Keep modules in `backend/core/` single-purpose.
- **React**: functional components and hooks only; colocate styles in
  `src/App.css` / `src/index.css`; keep data access inside `src/api/index.js`.
- **No secrets.** Never commit tokens, keys, or `.env` files. Runtime output
  (`backend/uploads/`, `backend/results/`, `backend/reports/`) is git-ignored.
- **Do not rewrite public history.** Rebase locally, but never force-push `main`.

## Reporting bugs

Open an issue with the browser/OS versions, the exact steps to reproduce, what
you expected, and what happened instead. Attach a minimal sample submission that
triggers the problem where possible.

## Requesting a feature

Open an issue first and describe the teaching scenario the feature supports.
Features that change the similarity weighting or the report format need a
maintainer discussion before implementation.
