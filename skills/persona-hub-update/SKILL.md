---
name: persona-hub-update
description: "Update persona-hub to latest version"
---

# Persona-Hub — Update

Pull the latest version of persona-hub from GitHub.

## Protocol

1. Run: `git -C ~/.claude/plugins/marketplaces/persona-hub pull origin main`
2. If successful, tell the user: "Updated. Restart Claude Code for changes to take effect."
3. If it fails, tell the user to reinstall: `claude plugin uninstall persona-hub@persona-hub && claude plugin install persona-hub@persona-hub`
