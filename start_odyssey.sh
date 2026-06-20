#!/bin/bash

# Odyssey macOS Startup Script 🚀

# Function to run a command in a new Terminal tab
run_in_new_tab() {
  local title=$1
  local command=$2
  osascript <<EOF
    tell application "Terminal"
      activate
      tell application "System Events" to keystroke "t" using command down
      repeat while contents of selected tab of window 1 is not ""
        delay 0.1
      end repeat
      do script "cd '$PWD'; $command" in window 1
    end tell
EOF
}

echo "============================================"
echo "  Starting Odyssey Development Environment"
echo "============================================"
echo

# 1. Start Docker Services
echo "[0/4] Checking Docker services (PostgreSQL & LocalStack)..."
docker-compose up -d postgres localstack
sleep 5

# 2. Start AI Proxy
echo "[1/4] Starting AI Proxy..."
run_in_new_tab "Odyssey - AI Proxy" "cd ai-proxy && node server.js"

# 3. Start Backend
echo "[2/4] Starting Backend (Spring Boot)..."
run_in_new_tab "Odyssey - Backend" "cd backend && ./mvnw spring-boot:run"

# 4. Start Frontend
echo "[3/4] Starting Frontend (Vite)..."
run_in_new_tab "Odyssey - Frontend" "cd frontend && npm run dev"

echo
echo "============================================"
echo "  Odyssey is starting up! 🚀"
echo "  Frontend  : http://localhost:5173"
echo "  AI Proxy  : http://localhost:3001"
echo "  Backend   : http://localhost:8080"
echo "============================================"
echo
echo "Waiting 5 seconds before opening browser..."
sleep 5
open "http://localhost:5173"

echo "Done!"
