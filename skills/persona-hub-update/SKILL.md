---
name: persona-hub-update
description: "Update persona-hub to latest version"
---

# Persona-Hub — Update

Update persona-hub to the latest version from GitHub.

## Protocol

### Step 1 — Detect platform

Determine which platform you're running on:

| Signal | Platform |
|--------|----------|
| `claude` CLI available, `~/.claude/plugins/` exists | **Claude Code** |
| `.cursor/skills/` exists in project root | **Cursor** |
| `.windsurf/skills/` exists in project root | **Windsurf** |
| `.clinerules/` exists in project root | **Cline** |
| None of the above | **OpenClaw / Other** |

### Step 2 — Run platform-specific update

**Claude Code:**
1. `git -C ~/.claude/plugins/marketplaces/persona-hub pull origin main`
2. `claude plugin uninstall persona-hub@persona-hub && claude plugin install persona-hub@persona-hub`
3. Tell user: "Updated. Restart Claude Code to use the new version."

**Cursor:**
1. `npx skills add asimokby/persona-hub -a cursor`
2. Tell user: "Updated. Skills and rules refreshed."

**Windsurf:**
1. `npx skills add asimokby/persona-hub -a windsurf`
2. Tell user: "Updated. Skills and rules refreshed."

**Cline:**
1. `npx skills add asimokby/persona-hub -a cline`
2. Tell user: "Updated. Rules refreshed."

**OpenClaw / Other:**
1. `npx skills add asimokby/persona-hub`
2. Tell user: "Updated. Skills refreshed."

If any step fails, show the error and suggest the user run the commands manually.
