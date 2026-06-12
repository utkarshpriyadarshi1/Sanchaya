#!/usr/bin/env bash
# clean.sh - Cleans e-Patra compile target files on macOS/Linux.
set -euo pipefail

# Change to root directory of project relative to script location
cd "$(dirname "$0")/.."

echo "==================================================="
echo "          Cleaning e-Patra Workspace            "
echo "==================================================="
echo

# Helper function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Resolve Maven command
MAVEN_CMD="mvn"
MAVEN_FOUND=true
if ! command_exists mvn; then
    if [ -f "backend/mvnw" ]; then
        MAVEN_CMD="./mvnw"
    else
        MAVEN_FOUND=false
    fi
fi

if [ "$MAVEN_FOUND" = true ]; then
    echo "Cleaning backend target directory..."
    $MAVEN_CMD -f backend/pom.xml clean
else
    echo "[WARNING] Maven command not found. Skipping backend clean..."
fi

echo "Cleaning frontend Cargo directory..."
if [ -d "frontend/src-tauri" ]; then
    cd frontend/src-tauri
    if command_exists cargo; then
        cargo clean
    else
        echo "[WARNING] Cargo not found. Skipping Cargo clean..."
    fi
    cd ../..
fi

echo
echo "[SUCCESS] Workspace clean completed!"
echo
