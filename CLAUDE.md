# PersonaHub — Claude Instructions

This repo is a multi-platform AI agent skill/plugin for managing structured personality profiles ("personas").

## Repo Structure

```
persona-hub/
  skills/                         # Skill definitions (SOURCE OF TRUTH)
    persona/SKILL.md              # Main skill: /persona <name>, list, stop
    persona-create/SKILL.md       # Creation workflow: /persona create
    persona-help/SKILL.md         # Quick-reference card
  .claude-plugin/                 # Claude Code plugin manifest
    plugin.json                   # Hook wiring (SessionStart + UserPromptSubmit)
    marketplace.json              # Marketplace listing
  hooks/                          # Claude Code hooks (Node.js)
    persona-activate.js           # SessionStart: re-inject active persona
    persona-tracker.js            # UserPromptSubmit: track /persona commands
    persona-config.js             # Shared config resolution
    persona-statusline.sh/.ps1    # Statusline badge
    install.sh / uninstall.sh     # Standalone installers
  commands/                       # Slash commands (TOML)
    persona.toml                  # /persona <name>
    persona-create.toml           # /persona create
    persona-list.toml             # /persona list
    persona-stop.toml             # /persona stop
  rules/                          # Auto-activation rules (SOURCE OF TRUTH)
    persona-activate.md           # Rule for non-Claude platforms
  personas/                       # Bundled example personas
    donald-trump/                 # Complete persona (v5, ~1,500 lines)
  templates/                      # Starter templates for new personas
  AGENT_PROTOCOL.md               # Full consumption specification
```

## Source of Truth vs Auto-Generated

| Source of Truth | Auto-Generated Mirrors |
|----------------|----------------------|
| `skills/persona/SKILL.md` | `.cursor/skills/persona/SKILL.md`, `.windsurf/skills/persona/SKILL.md` |
| `rules/persona-activate.md` | `.cursor/rules/persona.mdc`, `.windsurf/rules/persona.md`, `.clinerules/persona.md`, `.github/copilot-instructions.md` |

CI workflow `.github/workflows/sync-skill.yml` syncs source of truth to mirrors on push to main.

**Never edit auto-generated mirrors directly.**

## Persona Structure

Each persona is a directory under `personas/`:
```
personas/<slug>/
  persona.yaml              # Manifest (entry point, loading priorities)
  identity.md               # Who they are (required)
  voice.md                  # How they talk (required)
  beliefs.md                # What they think (recommended)
  knowledge.md              # What they know (recommended)
  relationships.md          # Key people (supplementary)
  biography.md              # Timeline (supplementary)
  sources/sources.yaml      # Source registry
  changelog.md              # Update log
```

Custom `.md` dimensions can be added — register them in `persona.yaml`.

## Key Conventions

- **Frontmatter:** Every `.md` file has: dimension, version, last_updated, confidence, sources
- **Inline citations:** `[source:source-id, confidence:level]`
- **Confidence levels:** high / medium / low / speculative
- **Anti-patterns:** In voice.md, document what the person would NEVER say — hard constraints
- **Unresolved Tensions:** Contradictions are features, not bugs
- **MVP = 3 files:** persona.yaml + identity.md + voice.md

## State Management

- Active persona stored at `~/.persona-hub/.active-persona` (JSON: name, slug, path)
- SessionStart hook reads this and emits compact reminder
- UserPromptSubmit hook detects deactivation commands and deletes flag
- Persona resolution: `./personas/` (project-local) > `~/.persona-hub/personas/` (global)

## Building a New Persona

Use `/persona create` or manually:

1. Copy `templates/` to `personas/<persona-slug>/`
2. Fill in `persona.yaml` with name, type, summary
3. Write `identity.md` and `voice.md` (minimum viable persona)
4. Add more dimensions as source material supports them
5. Register sources in `sources/sources.yaml`
6. Log updates in `changelog.md`

## Current State

- **Trump persona:** Complete (v5). Built from 517 transcripts (~3.5M words). ~1,500 lines across 6 dimension files.
- **Templates:** Complete for all standard file types.
- **Skills:** 3 skills (persona, persona-create, persona-help)
- **Hooks:** SessionStart + UserPromptSubmit for Claude Code
- **Platform support:** Claude Code, Cursor, Windsurf, Cline, Copilot, OpenClaw, Hermes, Gemini
