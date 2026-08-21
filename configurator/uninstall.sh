#!/usr/bin/env bash
set -euo pipefail

APP_ID="com.pericles.configurator"
INSTALL_DIR="$HOME/.local/opt/pericles-configurator"
BIN_PATH="$HOME/.local/bin/pericles-configurator"
MENU_LAUNCHER="$HOME/.local/share/applications/$APP_ID.desktop"

desktop_dir() {
  if command -v xdg-user-dir >/dev/null 2>&1; then
    xdg-user-dir DESKTOP
  else
    printf '%s\n' "$HOME/Desktop"
  fi
}

DESKTOP_LAUNCHER="$(desktop_dir)/$APP_ID.desktop"

rm -rf "$INSTALL_DIR"
rm -f "$BIN_PATH" "$MENU_LAUNCHER" "$DESKTOP_LAUNCHER"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$HOME/.local/share/applications" >/dev/null 2>&1 || true
fi

printf 'Uninstalled Pericles Configurator.\n'
