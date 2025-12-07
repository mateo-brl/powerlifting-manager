@echo off
REM Set cargo in PATH
set "PATH=C:\Users\PC\.cargo\bin;%PATH%"

REM Call VS Dev environment with host_arch to properly set up all paths
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" -arch=amd64 -host_arch=amd64

REM Ensure Windows Kit lib paths are set (fallback if VsDevCmd doesn't set them)
if not defined LIB (
    set "LIB=C:\Program Files (x86)\Windows Kits\10\Lib\10.0.22621.0\um\x64;C:\Program Files (x86)\Windows Kits\10\Lib\10.0.22621.0\ucrt\x64;C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.44.35207\lib\x64"
)

REM Go to project directory
cd /d "C:\Users\PC\powerlifting-manager"

REM Run tauri dev
npm run tauri dev
