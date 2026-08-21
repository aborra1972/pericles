#!/usr/bin/env bash
set -euo pipefail

APP_ID="com.pericles.configurator"
INSTALL_DIR="$HOME/.local/opt/pericles-configurator"
APPIMAGE_DEST="$INSTALL_DIR/pericles-configurator.AppImage"
BIN_PATH="$HOME/.local/bin/pericles-configurator"
APPLICATIONS_DIR="$HOME/.local/share/applications"
MENU_LAUNCHER="$APPLICATIONS_DIR/$APP_ID.desktop"

desktop_dir() {
  if command -v xdg-user-dir >/dev/null 2>&1; then
    xdg-user-dir DESKTOP
  else
    printf '%s\n' "$HOME/Desktop"
  fi
}

if [ "$#" -ne 1 ]; then
  printf 'Usage: %s /path/to/pericles-configurator.AppImage\n' "$0" >&2
  exit 64
fi

SOURCE_APPIMAGE=$1
case "$SOURCE_APPIMAGE" in
  *.AppImage) ;;
  *)
    printf 'Error: the argument must be an AppImage file.\n' >&2
    exit 64
    ;;
esac

if [ ! -f "$SOURCE_APPIMAGE" ] || [ ! -r "$SOURCE_APPIMAGE" ] || [ ! -s "$SOURCE_APPIMAGE" ]; then
  printf 'Error: AppImage is missing, unreadable, or empty: %s\n' "$SOURCE_APPIMAGE" >&2
  exit 66
fi

DESKTOP_DIR=$(desktop_dir)
DESKTOP_LAUNCHER="$DESKTOP_DIR/$APP_ID.desktop"

mkdir -p "$INSTALL_DIR" "${BIN_PATH%/*}" "$APPLICATIONS_DIR" "$DESKTOP_DIR"
install -m 755 "$SOURCE_APPIMAGE" "$APPIMAGE_DEST"

cat > "$BIN_PATH" <<EOF
#!/usr/bin/env bash
exec "$APPIMAGE_DEST" "\$@"
EOF
chmod 755 "$BIN_PATH"

cat > "$MENU_LAUNCHER" <<EOF
[Desktop Entry]
Name=Pericles Configurator
Comment=Configure the Pericles assistant
Exec=$BIN_PATH %U
Icon=application-x-executable
Terminal=false
Type=Application
Categories=Utility;
StartupWMClass=pericles-configurator
EOF
chmod 755 "$MENU_LAUNCHER"
install -m 755 "$MENU_LAUNCHER" "$DESKTOP_LAUNCHER"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APPLICATIONS_DIR" >/dev/null 2>&1 || true
fi

printf 'Installed Pericles Configurator. Run: pericles-configurator\n'
