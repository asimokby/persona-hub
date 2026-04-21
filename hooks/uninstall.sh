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

echo ""
echo "To fully uninstall:"
echo "  1. Remove the plugin: claude plugin remove persona-hub"
echo "  2. Delete persona data: rm -rf $PERSONA_DIR"
echo "  3. Remove hooks from ~/.claude/settings.json (if manually added)"
echo ""
echo "Done."
