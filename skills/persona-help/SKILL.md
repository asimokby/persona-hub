---
name: persona-help
description: >
  Quick-reference card for persona-hub commands and persona file format.
  Use when user says "persona help", "how do personas work", or "/persona-help".
---

# Persona-Hub Quick Reference

Display this reference card to the user. Format it as readable markdown.

---

## Commands

| Command | What it does |
|---------|-------------|
| `/persona list` | Show all available personas (project-local and global) |
| `/persona <name>` | Activate a persona for the current conversation |
| `/persona stop` | Deactivate the current persona |
| `/persona create` | Create a new persona from sources, files, or description |
| `/persona-help` | Show this reference card |

## Persona Directory Structure

```
personas/<slug>/
  persona.yaml          # Manifest and entry point (always read first)
  identity.md           # Who they are (required)
  voice.md              # How they talk (required)
  beliefs.md            # What they think (recommended)
  knowledge.md          # What they know (recommended)
  relationships.md      # Key people (supplementary)
  biography.md          # Life timeline (supplementary)
  sources/sources.yaml  # Source registry
  changelog.md          # Update log
```

Custom `.md` dimensions can be added for any persona. Register them in `persona.yaml`.

## Dimension Priorities

| Priority | Files | Loading rule |
|----------|-------|-------------|
| **required** | identity.md, voice.md | Always loaded |
| **recommended** | beliefs.md, knowledge.md | Loaded if context window allows |
| **supplementary** | relationships.md, biography.md, custom | Loaded on demand |

## Minimum Viable Persona (MVP)

Three files to get started:
1. `persona.yaml` — name, type, summary, dimensions list
2. `identity.md` — core identity and background
3. `voice.md` — speaking style, verbal patterns, anti-patterns

Everything else is additive. Start lean, add dimensions as sources support them.

## Where Personas Live

| Location | Path | When used |
|----------|------|-----------|
| **Project-local** | `./personas/<slug>/` | Default when `personas/` exists in project |
| **Global** | `~/.persona-hub/personas/<slug>/` | Fallback, available across projects |

## Adding Sources to an Existing Persona

1. Run `/persona create` with the existing persona's name.
2. Provide new source materials (files, URLs, description).
3. The agent will analyze and merge findings into existing dimension files.
4. Version numbers are bumped, sources registered, changelog updated.

Or manually:
1. Add source entry to `sources/sources.yaml`
2. Update relevant dimension files with new content and `[source:source-id]` citations
3. Bump `version` in modified files' frontmatter
4. Append to `changelog.md`

## Confidence Levels

- **high** — Direct quote or repeated pattern across sources
- **medium** — Clearly implied from source material
- **low** — Single instance or reasonable inference
- **speculative** — Educated guess, flagged for verification

## Full Specification

See `AGENT_PROTOCOL.md` for the complete agent consumption protocol: loading order, conflict resolution, system prompt assembly, and behavioral guidelines.
