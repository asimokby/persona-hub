# PersonaHub

AI persona management for coding agents. Activate structured personality profiles that change how your agent talks, thinks, and behaves.

Works with Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, OpenClaw, Hermes, and any agent supporting the [Agent Skills](https://agentskills.io) specification.

## Install

Pick your agent. One command. Done.

| Agent | Install |
|-------|---------|
| Claude Code | `claude plugin marketplace add asimokby/persona-hub && claude plugin install persona-hub@persona-hub` |
| Cursor | `npx skills add asimokby/persona-hub -a cursor` |
| Windsurf | `npx skills add asimokby/persona-hub -a windsurf` |
| Copilot | `npx skills add asimokby/persona-hub -a github-copilot` |
| Cline | `npx skills add asimokby/persona-hub -a cline` |
| Any other | `npx skills add asimokby/persona-hub` |

Install once. Use in every session after that.

## Quick Start

```
/persona-hub list              # See available personas
/persona-hub donald-trump      # Activate a persona
/persona-hub stop              # Deactivate
/persona-hub create            # Build a new persona
```

## Commands

| Command | What it does |
|---------|-------------|
| `/persona-hub list` | Show available personas |
| `/persona-hub <name>` | Activate a persona |
| `/persona-hub stop` | Deactivate current persona |
| `/persona-hub create` | Create a new persona from files, links, or description |
| `/persona-hub help` | Show quick-reference card |

## How It Works

Each persona is a directory of markdown files — a **Personality Wiki**:

```
personas/donald-trump/
  persona.yaml          # Manifest (name, summary, dimensions)
  identity.md           # Who they are
  voice.md              # How they talk (including anti-patterns)
  beliefs.md            # What they think (with temporal evolution)
  knowledge.md          # What they know (and don't know)
  relationships.md      # Key people
  sources/sources.yaml  # Source registry
```

| File | Agent Question | Priority |
|---|---|---|
| `identity.md` | "Who am I?" | required |
| `voice.md` | "How do I talk?" | required |
| `beliefs.md` | "What do I think?" | recommended |
| `knowledge.md` | "What do I know?" | recommended |
| `relationships.md` | "Who matters to me?" | supplementary |
| `biography.md` | "What happened to me?" | supplementary |

When you activate a persona, the agent reads these files and adopts the persona's voice, beliefs, and identity. Anti-patterns in `voice.md` are hard constraints — things the persona would never say.

**Minimum viable persona = 3 files:** `persona.yaml` + `identity.md` + `voice.md`

## Key Design Principles

- **Modular** — each file covers one dimension, independently updatable
- **Evolvable** — files get updated as new info comes in (interviews, articles, etc.)
- **Agent-consumable** — an LLM reads these files and responds in-character
- **Source-grounded** — claims are traceable via inline `[source:id]` citations
- **Contradiction-aware** — captures tensions and temporal evolution, not just facts

## Creating a Persona

Run `/persona-hub create` and provide:
- A name and description
- Source materials: transcripts, articles, URLs, or text
- The agent analyzes sources and builds dimension files automatically

Or manually: copy `templates/` to `personas/<slug>/` and fill in the files.

## Where Personas Live

| Location | Path | Scope |
|----------|------|-------|
| Project-local | `./personas/` | This project only |
| Global | `~/.persona-hub/personas/` | All projects |

Project-local takes precedence over global for same-slug personas.

## Bundled Personas

| Persona | Description | Dimensions | Sources |
|---------|-------------|------------|---------|
| Donald J. Trump | 45th & 47th US President | 5 (identity, voice, beliefs, knowledge, relationships) | 517 transcripts, ~3.5M words |

## Platform Support

| Platform | Install | Hooks | Skills |
|----------|---------|-------|--------|
| Claude Code | Plugin marketplace | Yes | Yes |
| Cursor | Skills directory | No | Yes |
| Windsurf | Skills directory | No | Yes |
| Cline | Rules directory | No | Yes |
| GitHub Copilot | Instructions file | No | Yes |
| OpenClaw | Skills directory | No | Yes |
| Hermes | Skills directory | No | Yes |
| Gemini CLI | Context file | No | Yes |

Hooks provide session persistence (remembers active persona across sessions). Without hooks, personas work within a single session.

## Project Structure

```
persona-hub/
  skills/                     # Skill definitions (source of truth)
    persona/SKILL.md          # Main skill
    persona-create/SKILL.md   # Creation workflow
    persona-help/SKILL.md     # Help card
  .claude-plugin/             # Claude Code plugin manifest
  hooks/                      # Session hooks (Claude Code)
  commands/                   # Slash commands
  rules/                      # Auto-activation rules
  personas/                   # Bundled persona examples
  templates/                  # Starter templates
  AGENT_PROTOCOL.md           # Full consumption specification
```

## Full Specification

See [AGENT_PROTOCOL.md](AGENT_PROTOCOL.md) for the complete specification: loading order, conflict resolution, system prompt assembly, and behavioral guidelines.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Edit `skills/persona/SKILL.md` (source of truth) — CI syncs to all platforms.

## License

MIT
