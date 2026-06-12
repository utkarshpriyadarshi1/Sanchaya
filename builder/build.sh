#!/usr/bin/env bash
# build.sh - Compiles e-Patra Production Build on macOS/Linux.
set -euo pipefail

# Change to root directory of project relative to script location
cd "$(dirname "$0")/.."

echo "==================================================="
echo "       Compiling e-Patra Production Build       "
echo "==================================================="
echo

# Helper function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Resolve Maven command
MAVEN_CMD="mvn"
if ! command_exists mvn; then
    # Check if local maven wrapper wrapper jar/script exists
    if [ -f "backend/mvnw" ]; then
        MAVEN_CMD="./mvnw"
    else
        echo "[ERROR] Maven ('mvn') is not found in your PATH."
        echo "Please install Maven or ensure it is available in your PATH."
        exit 1
    fi
fi

# 2. Build backend
echo "[1/2] Packaging Backend Service (Spring Boot Jar)..."
$MAVEN_CMD -f backend/pom.xml clean package

echo
echo "[2/2] Compiling Frontend Client (Tauri Standalone App)..."
cd frontend

echo "Bumping build version..."
node bump-version.cjs

echo "Cleaning Rust compile cache to prevent file locking issues..."
cd src-tauri
cargo clean
cd ..

# Limit parallel compilation jobs to prevent compiler OOM errors
export CARGO_BUILD_JOBS=2

# Build production Tauri app
npm run tauri build

cd ..
echo
echo "==================================================="
echo "     [SUCCESS] Production build completed!         "
echo "==================================================="
echo "Backend Jar: backend/target/e-patra-1.0-SNAPSHOT.jar"
echo "Frontend Standalone App: frontend/src-tauri/target/release/"
echo
