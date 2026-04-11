@echo off
echo ================================================
echo  AI Code Quality ^& Plagiarism Checker - Frontend
echo ================================================
echo.

cd /d "%~dp0frontend"

echo [1/2] Installing Node dependencies (if needed)...
npm install

echo.
echo [2/2] Starting React dev server on http://localhost:5173
echo       Browser will open automatically.
echo       Press Ctrl+C to stop.
echo.
npm run dev
