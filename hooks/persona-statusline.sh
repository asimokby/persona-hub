#!/usr/bin/env bash
# persona-hub — statusline badge
# Reads the active persona flag and outputs a colored badge.
# Returns empty string if no persona is active.

FLAG_DIR="${PERSONA_HUB_DIR:-$HOME/.persona-hub}"
FLAG_FILE="$FLAG_DIR/.active-persona"

if [ ! -f "$FLAG_FILE" ]; then
  exit 0
fi

# Extract name from JSON (simple parsing, no jq dependency)
NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$FLAG_FILE" 2>/dev/null | head -1 | sed 's/.*: *"//;s/"//')

if [ -n "$NAME" ]; then
  echo "[PERSONA: $NAME]"
fi
