@echo off
title Odyssey Dev Server
echo ============================================
echo   Starting Odyssey Development Environment
echo ============================================
echo.

:: Start PostgreSQL and LocalStack (Docker)
echo [0/4] Ensuring PostgreSQL and LocalStack (AWS) are running...
docker-compose up -d postgres localstack
timeout /t 8 /nobreak >nul

:: Start Backend (Spring Boot) in a new window
echo [1/4] Starting Backend (Spring Boot)...
start "Odyssey - Backend" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

:: Start AI Proxy server in a new window
echo [2/4] Starting AI Proxy server...
taskkill /F /IM node.exe /T >nul 2>&1
start "Odyssey - AI Proxy" cmd /k "cd /d "%~dp0ai-proxy" && node server.js"

:: Small delay
timeout /t 2 /nobreak >nul

:: Start Frontend dev server in a new window
echo [3/4] Starting Frontend (Vite)...
start "Odyssey - Frontend" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

:: Wait for Vite to start, then open browser
echo.
echo Waiting for servers to start...
timeout /t 10 /nobreak >nul

:: Open the app in the default browser
echo [4/4] Opening browser...
explorer "http://localhost:5173/login"

echo.
echo ============================================
echo   Odyssey is running!
echo   Frontend  : http://localhost:5173
echo   AI Proxy  : http://localhost:3001
echo   Backend   : http://localhost:8080
echo ============================================
echo.
echo NOTE: Backend (Spring Boot) takes ~30-60 seconds to fully start.
echo Close this window when you are done.
pause >nul
