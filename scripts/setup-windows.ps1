# =============================================================================
# Powerlifting Manager - Script d'installation Windows
# =============================================================================
# Usage: .\scripts\setup-windows.ps1
# Requires: PowerShell 5.1+ (Run as Administrator recommended)
#
# Ce script installe automatiquement toutes les dependances necessaires:
# - Visual Studio Build Tools (C++ workload)
# - Rust (via rustup)
# - Node.js LTS
# - Dependances npm du projet
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Powerlifting Manager - Installation Windows" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Ce script va installer automatiquement:" -ForegroundColor White
Write-Host "    - Visual Studio Build Tools (C++)" -ForegroundColor Gray
Write-Host "    - Rust et Cargo" -ForegroundColor Gray
Write-Host "    - Node.js LTS" -ForegroundColor Gray
Write-Host "    - Dependances du projet" -ForegroundColor Gray
Write-Host ""

# Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-Err {
    param([string]$Message)
    Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host ""
    Write-Host "[$Step] " -ForegroundColor Cyan -NoNewline
    Write-Host $Message -ForegroundColor White
    Write-Host ("-" * 50) -ForegroundColor DarkGray
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if winget is available
function Test-Winget {
    try {
        $null = Get-Command winget -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Install Rust
function Install-Rust {
    Write-Info "Checking Rust installation..."

    try {
        $rustVersion = rustc --version 2>$null
        if ($rustVersion) {
            Write-Info "Rust is already installed: $rustVersion"
            return
        }
    } catch {
        # Rust not found, proceed with installation
    }

    Write-Info "Installing Rust..."

    if (Test-Winget) {
        Write-Info "Using winget to install Rust..."
        winget install Rustlang.Rustup -e --silent --accept-package-agreements --accept-source-agreements

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

        # Run rustup to install default toolchain
        & "$env:USERPROFILE\.cargo\bin\rustup.exe" default stable
    } else {
        Write-Info "Downloading Rust installer..."
        $rustupUrl = "https://win.rustup.rs/x86_64"
        $rustupPath = "$env:TEMP\rustup-init.exe"

        Invoke-WebRequest -Uri $rustupUrl -OutFile $rustupPath -UseBasicParsing

        Write-Info "Running Rust installer..."
        Start-Process -FilePath $rustupPath -ArgumentList "-y" -Wait -NoNewWindow

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    }

    Write-Info "Rust installed successfully!"
}

# Install Node.js
function Install-Node {
    Write-Info "Checking Node.js installation..."

    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Info "Node.js is already installed: $nodeVersion"
            return
        }
    } catch {
        # Node not found, proceed with installation
    }

    Write-Info "Installing Node.js..."

    if (Test-Winget) {
        Write-Info "Using winget to install Node.js LTS..."
        winget install OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    } else {
        Write-Err "winget not available. Please install Node.js manually from https://nodejs.org/"
        Write-Err "Then re-run this script."
        exit 1
    }

    Write-Info "Node.js installed successfully!"
}

# Install Visual Studio Build Tools (required for native modules)
function Install-BuildTools {
    Write-Info "Checking Visual Studio Build Tools..."

    $vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"

    if (Test-Path $vsWhere) {
        $vsInstalled = & $vsWhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
        if ($vsInstalled) {
            Write-Info "Visual Studio Build Tools are already installed."
            return
        }
    }

    Write-Warn "Visual Studio Build Tools may be required for native compilation."
    Write-Warn "If you encounter build errors, install them from:"
    Write-Warn "https://visualstudio.microsoft.com/visual-cpp-build-tools/"
    Write-Warn "Select 'Desktop development with C++' workload."
}

# Check WebView2
function Test-WebView2 {
    Write-Info "Checking WebView2 runtime..."

    $webview2Key = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"

    if (Test-Path $webview2Key) {
        Write-Info "WebView2 runtime is installed."
    } else {
        Write-Warn "WebView2 runtime may not be installed."
        Write-Warn "It's usually pre-installed on Windows 10/11."
        Write-Warn "If the app doesn't start, download from:"
        Write-Warn "https://developer.microsoft.com/en-us/microsoft-edge/webview2/"
    }
}

# Install npm dependencies
function Install-NpmDeps {
    Write-Info "Installing npm dependencies..."

    $projectRoot = Split-Path -Parent $PSScriptRoot
    Push-Location $projectRoot

    try {
        npm install
        Write-Info "npm dependencies installed successfully!"
    } finally {
        Pop-Location
    }
}

# Main installation process
function Main {
    # Check admin rights
    if (-not (Test-Administrator)) {
        Write-Warn "Execution sans privileges administrateur."
        Write-Warn "Certaines installations peuvent necessiter les droits Admin."
        Write-Host ""
    }

    Write-Step "1/5" "Installation de Visual Studio Build Tools..."
    Install-BuildTools

    Write-Step "2/5" "Installation de Rust..."
    Install-Rust

    Write-Step "3/5" "Installation de Node.js..."
    Install-Node

    Write-Step "4/5" "Verification de WebView2..."
    Test-WebView2

    Write-Step "5/5" "Installation des dependances npm..."
    Install-NpmDeps

    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "  Installation terminee avec succes!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  IMPORTANT: Pour lancer l'application, utilisez:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Option 1 (Recommandee) - Double-cliquez sur:" -ForegroundColor White
    Write-Host "    scripts\dev.bat" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Option 2 - Depuis PowerShell:" -ForegroundColor White
    Write-Host "    npm run tauri dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  NE PAS utiliser Git Bash pour lancer l'application!" -ForegroundColor Red
    Write-Host "  (Conflit avec le linker Visual Studio)" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  Pour creer un build de production:" -ForegroundColor White
    Write-Host "    npm run tauri build" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Note: Redemarrez votre terminal si les" -ForegroundColor DarkGray
    Write-Host "  commandes ne sont pas reconnues." -ForegroundColor DarkGray
    Write-Host ""
}

# Run
Main
