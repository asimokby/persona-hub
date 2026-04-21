---
name: persona-hub-list
description: "Show all available personas"
---

# Persona-Hub — List

Show all available personas from all resolution paths.

## Persona Resolution

Search these directories in order. Merge results.

1. **Project-local:** `./personas/` (relative to working directory)
2. **Plugin-bundled:** Check the SessionStart context for a `Plugin personas:` line — this is the plugin's own `personas/` directory containing bundled examples
3. **User-global:** `~/.persona-hub/personas/`

## Protocol

1. Scan all three resolution paths for directories containing `persona.yaml`
2. Read each manifest, filter to `status: active`
3. Display a formatted table with: name, slug, summary (truncated), dimension count
4. Check `~/.persona-hub/.active-persona` to mark the currently active persona
5. Show which paths were searched

Activate with `/persona-hub <name>`. Create new with `/persona-hub-create`.
