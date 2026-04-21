#!/usr/bin/env bash
# persona-hub — standalone hook installer
# Installs hooks into ~/.claude/settings.json for users who clone the repo
# instead of installing via the plugin marketplace.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
PERSONA_DIR="$HOME/.persona-hub"

echo "persona-hub installer"
echo "====================="
echo ""

# Create persona-hub directory
mkdir -p "$PERSONA_DIR/personas"
echo "Created $PERSONA_DIR/personas/"

# Create .claude directory if needed
mkdir -p "$CLAUDE_DIR"

# Backup existing settings
if [ -f "$SETTINGS_FILE" ]; then
  cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup.$(date +%s)"
  echo "Backed up existing settings.json"
fi

echo ""
echo "Hook files are at: $SCRIPT_DIR/"
echo ""
echo "To complete installation, add persona-hub as a plugin in Claude Code:"
echo ""
echo "  claude plugin add <your-github-username>/persona-hub"
echo ""
echo "Or manually add hooks to $SETTINGS_FILE:"
echo ""
echo '  "hooks": {'
echo '    "SessionStart": [{'
echo '      "hooks": [{'
echo '        "type": "command",'
echo "        \"command\": \"node $SCRIPT_DIR/persona-activate.js\","
echo '        "timeout": 5'
echo '      }]'
echo '    }],'
echo '    "UserPromptSubmit": [{'
echo '      "hooks": [{'
echo '        "type": "command",'
echo "        \"command\": \"node $SCRIPT_DIR/persona-tracker.js\","
echo '        "timeout": 5'
echo '      }]'
echo '    }]'
echo '  }'
echo ""
echo "Statusline badge command:"
echo "  bash \"$SCRIPT_DIR/persona-statusline.sh\""
echo ""
echo "Done."
