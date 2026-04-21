---
name: persona-hub-update
description: "Update persona-hub to latest version"
---

# Persona-Hub — Update

Update persona-hub to the latest version from GitHub.

## Protocol

Run these two commands in sequence:

1. Pull latest code: `git -C ~/.claude/plugins/marketplaces/persona-hub pull origin main`
2. Reinstall plugin: `claude plugin uninstall persona-hub@persona-hub && claude plugin install persona-hub@persona-hub`

Then tell the user: "Updated. Restart Claude Code to use the new version."

If either step fails, show the error and suggest the user run the commands manually.
