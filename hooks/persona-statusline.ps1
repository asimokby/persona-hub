# persona-hub — statusline badge script for Claude Code (Windows)
# Reads the active persona flag and outputs a colored badge.
#
# Usage in ~/.claude/settings.json:
#   "statusLine": { "type": "command", "command": "pwsh /path/to/persona-statusline.ps1" }
#
# Plugin users: settings.json at plugin root wires this automatically.
# Standalone users: install.sh wires this automatically.

$flagDir = if ($env:PERSONA_HUB_DIR) { $env:PERSONA_HUB_DIR } else { Join-Path $env:USERPROFILE ".persona-hub" }
$flagFile = Join-Path $flagDir ".active-persona"

if (-not (Test-Path $flagFile)) { exit 0 }

try {
    $data = Get-Content $flagFile -Raw | ConvertFrom-Json
    if ($data.name) {
        Write-Host -NoNewline "`e[38;5;214m[PERSONA: $($data.name)]`e[0m"
    }
} catch {
    # Silent fail
}
