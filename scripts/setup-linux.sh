#!/bin/bash

# =============================================================================
# Powerlifting Manager - Script d'installation Linux
# =============================================================================

set -e

echo "======================================"
echo "  Powerlifting Manager - Setup Linux"
echo "======================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Détecter le gestionnaire de paquets
detect_package_manager() {
    if command -v apt &> /dev/null; then
        echo "apt"
    elif command -v dnf &> /dev/null; then
        echo "dnf"
    elif command -v pacman &> /dev/null; then
        echo "pacman"
    elif command -v zypper &> /dev/null; then
        echo "zypper"
    else
        echo "unknown"
    fi
}

# Installer les dépendances système pour Tauri
install_system_deps() {
    local pm=$(detect_package_manager)

    info "Gestionnaire de paquets détecté: $pm"

    case $pm in
        apt)
            info "Installation des dépendances (Debian/Ubuntu)..."
            sudo apt update
            sudo apt install -y \
                libwebkit2gtk-4.1-dev \
                build-essential \
                curl \
                wget \
                file \
                libxdo-dev \
                libssl-dev \
                libayatana-appindicator3-dev \
                librsvg2-dev \
                libgtk-3-dev
            ;;
        dnf)
            info "Installation des dépendances (Fedora)..."
            sudo dnf install -y \
                webkit2gtk4.1-devel \
                openssl-devel \
                curl \
                wget \
                file \
                libxdo-devel \
                libappindicator-gtk3-devel \
                librsvg2-devel \
                gtk3-devel \
                @development-tools
            ;;
        pacman)
            info "Installation des dépendances (Arch Linux)..."
            sudo pacman -Syu --noconfirm \
                webkit2gtk-4.1 \
                base-devel \
                curl \
                wget \
                file \
                openssl \
                appmenu-gtk-module \
                libappindicator-gtk3 \
                librsvg \
                gtk3
            ;;
        zypper)
            info "Installation des dépendances (openSUSE)..."
            sudo zypper install -y \
                webkit2gtk3-soup2-devel \
                libopenssl-devel \
                curl \
                wget \
                file \
                libxdo-devel \
                libappindicator3-devel \
                librsvg-devel \
                gtk3-devel \
                -t pattern devel_basis
            ;;
        *)
            error "Gestionnaire de paquets non supporté. Installez manuellement les dépendances Tauri."
            error "Voir: https://v2.tauri.app/start/prerequisites/#linux"
            exit 1
            ;;
    esac

    info "Dépendances système installées!"
}

# Installer Rust
install_rust() {
    if command -v cargo &> /dev/null; then
        info "Rust est déjà installé: $(rustc --version)"
    else
        info "Installation de Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
        info "Rust installé: $(rustc --version)"
    fi
}

# Installer Node.js si nécessaire
install_node() {
    if command -v node &> /dev/null; then
        info "Node.js est déjà installé: $(node --version)"
    else
        info "Installation de Node.js via nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install --lts
        nvm use --lts
        info "Node.js installé: $(node --version)"
    fi
}

# Installer les dépendances npm
install_npm_deps() {
    info "Installation des dépendances npm..."
    npm install
    info "Dépendances npm installées!"
}

# Main
main() {
    echo ""
    info "Étape 1/4: Installation des dépendances système..."
    install_system_deps
    echo ""

    info "Étape 2/4: Installation de Rust..."
    install_rust
    echo ""

    info "Étape 3/4: Vérification de Node.js..."
    install_node
    echo ""

    info "Étape 4/4: Installation des dépendances npm..."
    install_npm_deps
    echo ""

    echo "======================================"
    echo -e "${GREEN}  Installation terminée!${NC}"
    echo "======================================"
    echo ""
    echo "Pour lancer l'application:"
    echo "  npm run tauri dev"
    echo ""
    echo "Pour créer un build de production:"
    echo "  npm run tauri build"
    echo ""
}

# Exécuter
main "$@"
