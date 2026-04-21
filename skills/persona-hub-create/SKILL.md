---
name: persona-hub-create
description: "Create a new persona from sources"
---

# Persona-Hub — Create

Create a new persona from source materials, files, URLs, or a description.

## Gather Input

Ask for: **name**, **type** (real/fictional/composite), and **source materials** (description, files, URLs, or "start minimal"). If the user already provided some of this, don't re-ask.

## Scaffold

1. Derive slug from name (lowercase, hyphens, strip special chars)
2. Target: `./personas/<slug>/` if `personas/` exists in cwd, otherwise `~/.persona-hub/personas/<slug>/`
3. If slug already exists, ask: update existing or pick different name?
4. Create directory with: `persona.yaml`, `identity.md`, `voice.md`, `sources/sources.yaml`, `changelog.md`
5. Only create `beliefs.md`, `knowledge.md`, `relationships.md` if sources support them

## Write persona.yaml

```yaml
version: "1.0"
id: <slug>
name: "<Full Name>"
type: <real|fictional|composite>
status: draft
summary: >
  <2-4 sentence description>
dimensions:
  - file: identity.md
    priority: required
    description: "Core identity and background"
  - file: voice.md
    priority: required
    description: "Speaking style and verbal patterns"
agent_notes: >
  Load required files always. Voice patterns override generic LLM tendencies.
created: <today>
last_updated: <today>
primary_author: ""
tags: []
```

## Populate Dimension Files

Every `.md` file starts with YAML frontmatter: `dimension`, `version: 1`, `last_updated`, `confidence`, `sources`.

For each source, extract and distribute:
- **voice.md** — sentence structure, vocabulary, verbal tics, rhetorical moves, tone, anti-patterns (NEVER say)
- **identity.md** — background, roles, self-concept, public vs private
- **beliefs.md** — core values, positions by topic, temporal evolution, contradictions
- **knowledge.md** — deep expertise, working knowledge, gaps
- **relationships.md** — key people, dynamics, patterns

Add inline citations: `[source:source-id, confidence:level]`
Register sources in `sources/sources.yaml`.

## MVP Check

Verify persona.yaml + identity.md + voice.md have content.
- If yes: set `status: active`, offer to activate
- If no: keep `status: draft`, tell user what's missing

## Updating Existing Personas

If called on an existing slug: ADD new findings to existing files, bump versions, register sources, append to changelog.
