#!/usr/bin/env bash
# dev.sh - Runs concurrent e-Patra development environment on macOS/Linux.
set -euo pipefail

echo "==================================================="
echo "    Starting e-Patra Development Environment    "
echo "==================================================="
echo

# Helper function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Resolve Maven command
MAVEN_CMD="mvn"
if ! command_exists mvn; then
    if [ -f "backend/mvnw" ]; then
        MAVEN_CMD="./mvnw"
    else
        echo "[ERROR] Maven ('mvn') is not found in your PATH."
        echo "Please install Maven or ensure it is available in your PATH."
        exit 1
    fi
fi

# Define cleanup handler for background processes
BACKEND_PID=""
cleanup() {
    echo
    if [ -n "$BACKEND_PID" ]; then
        echo "Stopping local backend service (PID: $BACKEND_PID)..."
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    echo "Development servers stopped."
    exit 0
}
# Trap exit signals
trap cleanup SIGINT SIGTERM EXIT

echo "[1/2] Launching Backend Service (Spring Boot)..."
$MAVEN_CMD -f backend/pom.xml spring-boot:run &
BACKEND_PID=$!
echo "Backend service spawned with PID $BACKEND_PID."
echo

echo "[2/2] Launching Frontend Client (Tauri / React)..."
cd frontend
npm run tauri dev

# Wait on foreground process
cd ..
