@echo off
set ROOT=%~dp0

echo ========================================
echo   Xiaodu Blog - Starting...
echo ========================================
echo.

echo [1/2] Starting backend (port 3000)...
start "Xiaodu-Backend" /d "%ROOT%backend" cmd /k "echo Backend running at http://localhost:3000 && node src/index.js"

timeout /t 2 /nobreak >nul

echo [2/2] Starting frontend (port 5173)...
start "Xiaodu-Frontend" /d "%ROOT%frontend" cmd /k "echo Frontend running at http://localhost:5173 && npx vite --host 0.0.0.0"

echo.
echo ========================================
echo   All services started!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:3000
echo   Password : Xiaodu0019
echo ========================================
echo.
pause
