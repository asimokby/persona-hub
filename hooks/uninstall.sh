#!/usr/bin/env bash
# persona-hub — standalone hook uninstaller
# Removes the active persona flag. Does NOT delete persona files.

set -e

PERSONA_DIR="${PERSONA_HUB_DIR:-$HOME/.persona-hub}"
FLAG_FILE="$PERSONA_DIR/.active-persona"

echo "persona-hub uninstaller"
echo "======================="
echo ""

# Remove active persona flag
if [ -f "$FLAG_FILE" ]; then
  rm "$FLAG_FILE"
  echo "Removed active persona flag."
else
  echo "No active persona flag found."
fi

# Restore previous statusline if persona-hub auto-configured it
SETTINGS_FILE="$HOME/.claude/settings.json"
if [ -f "$SETTINGS_FILE" ] && command -v node >/dev/null 2>&1; then
  node -e "
    const fs = require('fs');
    const s = JSON.parse(fs.readFileSync('$SETTINGS_FILE', 'utf8'));
    if (s._personaHubPreviousStatusLine) {
      s.statusLine = s._personaHubPreviousStatusLine;
      delete s._personaHubPreviousStatusLine;
      fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(s, null, 2) + '\n');
      console.log('Restored previous statusline config.');
    } else if (s.statusLine && s.statusLine.command && s.statusLine.command.includes('persona-statusline')) {
      delete s.statusLine;
      delete s._personaHubPreviousStatusLine;
      fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(s, null, 2) + '\n');
      console.log('Removed persona-hub statusline config.');
    }
  " 2>/dev/null || true
fi

echo ""
echo "To fully uninstall:"
echo "  1. Remove the plugin: claude plugin remove persona-hub"
echo "  2. Delete persona data: rm -rf $PERSONA_DIR"
echo ""
echo "Done."
