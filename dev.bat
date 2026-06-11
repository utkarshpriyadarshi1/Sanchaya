@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo     Starting e-Patra Development Environment    
echo ===================================================
echo.

call :find_maven
if %errorlevel% neq 0 (
    echo.
    pause
    exit /b %errorlevel%
)

echo [1/2] Launching Backend Service (Spring Boot)...
start "e-Patra Backend" cmd /k "%MAVEN_CMD% -f backend/pom.xml spring-boot:run"

echo [2/2] Launching Frontend Client (Tauri / React)...
start "e-Patra Frontend" cmd /k "cd frontend && npm run tauri dev"

echo.
echo [SUCCESS] Both development servers have been spawned in separate windows!
echo Please keep those windows open during development.
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
