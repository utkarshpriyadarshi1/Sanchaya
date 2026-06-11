@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo           Cleaning e-Patra Workspace            
echo ===================================================
echo.

call :find_maven
if %errorlevel% neq 0 (
    echo [WARNING] Maven command not found. Skipping backend clean...
) else (
    echo Cleaning backend target directory...
    call %MAVEN_CMD% -f backend/pom.xml clean
)

echo Cleaning frontend Cargo directory...
if exist "frontend\src-tauri" (
    cd frontend\src-tauri
    cargo clean
    cd ..\..
)

echo.
echo [SUCCESS] Workspace clean completed!
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
