@echo off
echo ================================================
echo  AI Code Quality ^& Plagiarism Checker - Backend
echo ================================================
echo.
cd /d "%~dp0backend"

echo Detecting Python installation...

:: Try multiple Python locations
set PYTHON=

for %%p in (
  "python"
  "python3"
  "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python39\python.exe"
  "C:\Python312\python.exe"
  "C:\Python311\python.exe"
  "C:\Python310\python.exe"
) do (
  if exist %%~p (
    set PYTHON=%%~p
    goto :found
  )
)

:: Try where command
for /f "tokens=*" %%i in ('where python 2^>nul') do (
  if not "%%i"=="" set PYTHON=%%i
  goto :found
)

echo ERROR: Python not found. Please install Python 3.9+ from https://python.org
echo        Make sure to check "Add Python to PATH" during installation.
pause
exit /b 1

:found
echo Found Python: %PYTHON%
echo.
echo [1/2] Installing dependencies...
%PYTHON% -m pip install -r requirements.txt

echo.
echo [2/2] Starting backend on http://localhost:8000
echo        Press Ctrl+C to stop.
echo.
%PYTHON% -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
