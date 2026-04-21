---
trigger: always_on
---

# Persona-Hub Auto-Activation Rule

On session start, check if an AI persona is active.

## Check

Read `~/.persona-hub/.active-persona`. If it exists and contains valid JSON with `name`, `slug`, and `path` fields:

1. The user has an active persona session.
2. Read the persona's dimension files from the `path` directory.
3. Follow all behavioral rules from the persona skill: stay in character, follow voice patterns, respect anti-patterns as hard constraints.
4. Tell the user briefly that the persona is still active.

If the file does not exist, do nothing — no persona is active.

## Deactivation

If the user says `/persona-hub-stop`, "stop persona", "normal mode", "be yourself", or "drop the act":
1. Delete `~/.persona-hub/.active-persona`
2. Return to normal behavior immediately.

## Commands

| Command | Action |
|---|---|
| `/persona-hub <name>` | Activate a persona |
| `/persona-hub-list` | List personas from `./personas/` and `~/.persona-hub/personas/` |
| `/persona-hub-stop` | Deactivate current persona |
| `/persona-hub-create` | Create a new persona |
