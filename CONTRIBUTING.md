# Contributing

Improvements to skill definitions, persona templates, and hooks are welcome.

## How

1. Fork the repo
2. Edit the **source of truth** files (see below)
3. Open a PR with:
   - **Before:** what the skill does now
   - **After:** what the skill does with your change
   - One sentence why the change is better

## Source of Truth Files

Only edit these — CI auto-syncs everything else:

| File | What it controls |
|------|-----------------|
| `skills/persona/SKILL.md` | Main persona skill (activation, listing, deactivation) |
| `skills/persona-create/SKILL.md` | Persona creation workflow |
| `skills/persona-help/SKILL.md` | Help reference card |
| `rules/persona-activate.md` | Auto-activation rule for non-Claude platforms |
| `hooks/*.js` | Claude Code hook scripts |

**Do NOT edit directly:**
- `.cursor/` — auto-synced from `skills/` and `rules/`
- `.windsurf/` — auto-synced
- `.clinerules/` — auto-synced
- `.github/copilot-instructions.md` — auto-synced

## Contributing Personas

Want to add a persona to the bundled examples?

1. Create a directory under `personas/<slug>/`
2. Follow the template structure in `templates/`
3. Minimum: `persona.yaml` + `identity.md` + `voice.md`
4. Include source citations with `[source:source-id]`
5. Register sources in `sources/sources.yaml`

## Guidelines

- Small focused changes over big rewrites
- Test your changes by activating a persona with `/persona <name>`
- Persona content should be sourced and cited, not fabricated
