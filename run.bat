@echo off
setlocal enabledelayedexpansion

:: Clear screen and show header
cls
echo ===================================================
echo             e-Dastavej Management CLI             
echo ===================================================
echo.

:menu
echo Select an action to perform:
echo   [1] Run Development Environment (Dev Mode)
echo   [2] Compile Production Standalone App (Prod Build)
echo   [3] Clean Build Artifacts (mvn/cargo clean)
echo   [4] Exit
echo.
set /p choice="Enter your selection (1-4): "

if "%choice%"=="1" goto run_dev
if "%choice%"=="2" goto build_prod
if "%choice%"=="3" goto clean_all
if "%choice%"=="4" exit /b 0
echo.
echo [ERROR] Invalid selection. Please enter 1, 2, 3, or 4.
echo.
goto menu

:run_dev
echo.
echo ===================================================
echo     [Option 1] Starting Development Environment    
echo ===================================================
call :find_maven
if %errorlevel% neq 0 (
    echo.
    pause
    goto menu
)

echo.
echo [1/2] Launching Backend Service (Spring Boot)...
start "e-Dastavej Backend" cmd /k "%MAVEN_CMD% -f backend/pom.xml spring-boot:run"

echo [2/2] Launching Frontend Client (Tauri / React)...
start "e-Dastavej Frontend" cmd /k "cd frontend && npm run tauri dev"

echo.
echo [SUCCESS] Both development servers have been spawned in separate windows!
echo Please keep those windows open during development.
echo.
pause
goto menu

:build_prod
echo.
echo ===================================================
echo        [Option 2] Compiling Production Build       
echo ===================================================
call :find_maven
if %errorlevel% neq 0 (
    echo.
    pause
    goto menu
)

echo.
echo [1/2] Packaging Backend Service (Spring Boot Jar)...
call %MAVEN_CMD% -f backend/pom.xml clean package
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend packaging failed!
    pause
    goto menu
)

echo.
echo [2/2] Compiling Frontend Client (Tauri Standalone App)...
cd frontend
echo Cleaning Rust compile cache to prevent file locking issues...
cd src-tauri
cargo clean
cd ..
:: Build production Tauri app
call npm run tauri build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Tauri desktop build failed!
    cd ..
    pause
    goto menu
)
cd ..

echo.
echo ===================================================
echo      [SUCCESS] Production build completed!         
echo ===================================================
echo Backend Jar: backend/target/e-dastavej-1.0-SNAPSHOT.jar
echo Frontend Standalone App: frontend/src-tauri/target/release/
echo.
pause
goto menu

:clean_all
echo.
echo ===================================================
echo           [Option 3] Cleaning Workspace            
echo ===================================================
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
goto menu

:: Helper subroutine to resolve Maven executable
:find_maven
set MAVEN_CMD=mvn
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Users\utkar\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd" (
        set MAVEN_CMD="C:\Users\utkar\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd"
    ) else (
        echo [ERROR] Maven (mvn) was not found in your PATH or local user directory.
        echo Please ensure Java 17+ and Maven are installed.
        exit /b 1
    )
)
exit /b 0
