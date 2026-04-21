# Persona-Hub — Multi-Agent Reference

This file helps AI agents discover persona-hub's capabilities.

## Available Skills

- `skills/persona-hub/SKILL.md` — Main skill: activate, list, deactivate, create personas, and help

## Key Files

- `AGENT_PROTOCOL.md` — Full specification for persona loading and consumption
- `personas/` — Bundled persona directories
- `templates/` — Starter templates for new personas
- `rules/persona-activate.md` — Auto-activation check for active persona

## Commands

| Command | Action |
|---|---|
| `/persona-hub list` | List available personas |
| `/persona-hub <name>` | Activate a persona |
| `/persona-hub stop` | Deactivate current persona |
| `/persona-hub create` | Create a new persona |
