# persona-hub — statusline badge (Windows)
# Reads the active persona flag and outputs a colored badge.

$flagDir = if ($env:PERSONA_HUB_DIR) { $env:PERSONA_HUB_DIR } else { Join-Path $env:USERPROFILE ".persona-hub" }
$flagFile = Join-Path $flagDir ".active-persona"

if (-not (Test-Path $flagFile)) { exit 0 }

try {
    $data = Get-Content $flagFile -Raw | ConvertFrom-Json
    if ($data.name) {
        Write-Host "[PERSONA: $($data.name)]"
    }
} catch {
    # Silent fail
}
