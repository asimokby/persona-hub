# Persona-Hub — Multi-Agent Reference

This file helps AI agents discover persona-hub's capabilities.

## Available Skills

- `skills/persona/SKILL.md` — Main skill: activate, list, and deactivate personas
- `skills/persona-create/SKILL.md` — Create new personas from sources
- `skills/persona-help/SKILL.md` — Quick-reference card

## Key Files

- `AGENT_PROTOCOL.md` — Full specification for persona loading and consumption
- `personas/` — Bundled persona directories
- `templates/` — Starter templates for new personas
- `rules/persona-activate.md` — Auto-activation check for active persona

## Commands

| Command | Action |
|---|---|
| `/persona list` | List available personas |
| `/persona <name>` | Activate a persona |
| `/persona stop` | Deactivate current persona |
| `/persona create` | Create a new persona |
