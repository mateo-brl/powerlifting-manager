@echo off
REM ============================================================================
REM Powerlifting Manager - Script de lancement Windows
REM ============================================================================
REM Ce script configure l'environnement Visual Studio et lance l'application
REM Usage: Double-cliquez sur ce fichier ou executez: .\scripts\dev.bat
REM ============================================================================

echo ======================================
echo   Powerlifting Manager - Dev Mode
echo ======================================
echo.

REM Trouver VsDevCmd.bat
set "VSDEVCMD="

REM VS 2022 Build Tools
if exist "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" (
    set "VSDEVCMD=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat"
    goto :found
)

REM VS 2022 Community
if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat" (
    set "VSDEVCMD=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat"
    goto :found
)

REM VS 2022 Professional
if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\Tools\VsDevCmd.bat" (
    set "VSDEVCMD=C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\Tools\VsDevCmd.bat"
    goto :found
)

REM VS 2022 Enterprise
if exist "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\Common7\Tools\VsDevCmd.bat" (
    set "VSDEVCMD=C:\Program Files\Microsoft Visual Studio\2022\Enterprise\Common7\Tools\VsDevCmd.bat"
    goto :found
)

REM VS 2019 (fallback)
if exist "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\Common7\Tools\VsDevCmd.bat" (
    set "VSDEVCMD=C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\Common7\Tools\VsDevCmd.bat"
    goto :found
)

echo [ERREUR] Visual Studio Build Tools non trouve!
echo.
echo Veuillez installer Visual Studio Build Tools depuis:
echo https://visualstudio.microsoft.com/visual-cpp-build-tools/
echo.
echo Selectionnez "Developpement Desktop en C++" lors de l'installation.
pause
exit /b 1

:found
echo [INFO] Configuration de l'environnement Visual Studio...
call "%VSDEVCMD%" -arch=x64 > nul 2>&1

REM Ajouter Cargo au PATH si necessaire
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

REM Verifier que cargo est disponible
where cargo > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Rust/Cargo non trouve!
    echo.
    echo Veuillez installer Rust depuis: https://rustup.rs
    pause
    exit /b 1
)

REM Verifier que node est disponible
where node > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Node.js non trouve!
    echo.
    echo Veuillez installer Node.js depuis: https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Environnement configure avec succes!
echo.
echo [INFO] Lancement de l'application...
echo.

REM Aller dans le repertoire du projet
cd /d "%~dp0.."

REM Lancer l'application
npm run tauri dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERREUR] L'application a quitte avec une erreur.
    pause
)
