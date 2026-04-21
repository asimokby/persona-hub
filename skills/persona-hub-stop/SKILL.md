---
name: persona-hub-stop
description: "Deactivate current persona"
---

# Persona-Hub — Stop

Deactivate the current persona and return to normal agent behavior.

## Protocol

1. Delete `~/.persona-hub/.active-persona` if it exists
2. Acknowledge: "Persona deactivated. Back to normal."
3. Immediately return to normal agent behavior — drop all persona voice, beliefs, and identity rules.
