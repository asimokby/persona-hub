#!/usr/bin/env bash
# persona-hub — statusline badge script for Claude Code
# Reads the active persona flag and outputs a colored badge.
# Returns empty string if no persona is active.
#
# Usage in ~/.claude/settings.json:
#   "statusLine": { "type": "command", "command": "bash /path/to/persona-statusline.sh" }
#
# Plugin users: settings.json at plugin root wires this automatically.
# Standalone users: install.sh wires this automatically.

FLAG_DIR="${PERSONA_HUB_DIR:-$HOME/.persona-hub}"
FLAG_FILE="$FLAG_DIR/.active-persona"

[ ! -f "$FLAG_FILE" ] && exit 0

# Extract name from JSON (simple parsing, no jq dependency)
NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$FLAG_FILE" 2>/dev/null | head -1 | sed 's/.*: *"//;s/"//')

if [ -n "$NAME" ]; then
  printf '\033[38;5;214m[PERSONA: %s]\033[0m' "$NAME"
fi
