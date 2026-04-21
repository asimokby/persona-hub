---
name: persona-hub-help
description: "Quick-reference card for commands and format"
---

# Persona-Hub — Help

Display this quick-reference card:

```
Persona-Hub Commands
─────────────────────────────────────
/persona-hub <name>    Activate a persona
/persona-hub-list      Show available personas
/persona-hub-stop      Deactivate current persona
/persona-hub-create    Create or enrich a persona
/persona-hub-help      This card
/persona-hub-update    Pull latest version

Creating & Enriching
─────────────────────────────────────
/persona-hub-create accepts any source:
  - Folder of files   ./transcripts/  (best — bulk ingestion)
  - Individual files   speech.txt, interview.md
  - URLs               article links, interviews
  - Text description   "He's a fast-talking NYC guy..."

Run again on the same persona to enrich it:
  /persona-hub-create elon-musk    ← adds new sources to existing

More sources = more authentic persona.

Persona Locations
─────────────────────────────────────
Project-local:   ./personas/
Plugin-bundled:  (auto-detected)
Global:          ~/.persona-hub/personas/

MVP = persona.yaml + identity.md + voice.md

Priorities: required (always) → recommended (if available) → supplementary (on demand)
```
