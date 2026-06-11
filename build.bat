@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo        Compiling e-Patra Production Build       
echo ===================================================
echo.

call :find_maven
if %errorlevel% neq 0 (
    echo.
    pause
    exit /b %errorlevel%
)

echo [1/2] Packaging Backend Service (Spring Boot Jar)...
call %MAVEN_CMD% -f backend/pom.xml clean package
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend packaging failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Compiling Frontend Client (Tauri Standalone App)...
cd frontend
echo Bumping build version...
call node bump-version.cjs
echo Cleaning Rust compile cache to prevent file locking issues...
cd src-tauri
cargo clean
cd ..
:: Limit parallel compilation jobs to prevent compiler OOM errors
set CARGO_BUILD_JOBS=2
:: Build production Tauri app
call npm run tauri build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Tauri desktop build failed!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ===================================================
echo      [SUCCESS] Production build completed!         
echo ===================================================
echo Backend Jar: backend/target/e-patra-1.0-SNAPSHOT.jar
echo Frontend Standalone App: frontend/src-tauri/target/release/
echo.
pause
exit /b 0

:: Helper subroutine to resolve Maven executable
:find_maven
set MAVEN_CMD=mvn
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Users\utkar\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd" (
        set MAVEN_CMD="C:\Users\utkar\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd"
    ) else (
        echo [ERROR] Maven was not found in your PATH or local user directory.
        echo Please ensure Java 17+ and Maven are installed.
        exit /b 1
    )
)
exit /b 0
