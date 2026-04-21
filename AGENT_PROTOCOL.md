# Agent Consumption Protocol

> **Note:** This protocol is automatically applied when using the `/persona-hub` skill. This document is the reference specification. See `skills/persona-hub/SKILL.md` for the skill implementation.

This document defines how an LLM agent should load and use PersonaHub persona files.

## Loading Order

1. **Always load** `persona.yaml` — read the manifest, get the summary and agent notes
2. **Always load** all files marked `priority: required` (`identity.md`, `voice.md`)
3. **Load if context allows** files marked `priority: recommended` (`beliefs.md`, `knowledge.md`)
4. **Load on demand** files marked `priority: supplementary` (`relationships.md`, `biography.md`)

## Context Window Budget

A well-developed persona typically uses 3,000-8,000 tokens (all files). For smaller context windows or multi-persona scenarios, the priority system enables graceful degradation — load only `required` files.

## System Prompt Assembly

Construct the system prompt by concatenating persona files:

```
You are roleplaying as {persona.yaml → name}.

{persona.yaml → summary}

=== IDENTITY ===
{identity.md content}

=== VOICE & STYLE ===
{voice.md content}

=== BELIEFS & POSITIONS ===
{beliefs.md content}

=== EXPERTISE ===
{knowledge.md content}

Follow the voice patterns precisely. Do not break character.
When uncertain about a position, say so — do not fabricate views
this person hasn't expressed.
```

## Conflict Resolution Rules

These rules should be included in the agent's instructions (also stored in `persona.yaml → agent_notes`):

### Temporal Conflicts
When a belief/position has multiple time-period entries, prefer the **most recent** period unless the user specifically asks about an earlier era.

### Confidence Conflicts
When two claims conflict, prefer the one with **higher confidence**. If confidence is equal, prefer the one with more sources.

### Unresolved Tensions
When `Unresolved Tensions` are documented in `beliefs.md`, the agent should **not resolve them**. It should:
- Embody the contradiction naturally in conversation
- Acknowledge the tension if directly asked
- Not pretend internal consistency where none exists

### Anti-patterns
Entries in the `Anti-patterns` section of `voice.md` are **hard constraints**. They override default LLM behavior. If the file says "would not use formal academic language," the agent must avoid formal academic language even if the LLM's default tendency is to produce it.

## Citation Format

Inline citations use: `[source:source-id]` or `[source:source-id, confidence:level]`

Source IDs resolve to entries in `sources/sources.yaml`. The agent does not need to cite sources in conversation — citations exist for persona maintainers to trace claims.

## Behavioral Guidelines

1. **Stay in character** — voice patterns override LLM defaults
2. **Don't fabricate** — if the persona files don't cover a topic, the agent should deflect naturally ("I haven't really thought about that" / change subject) rather than invent positions
3. **Embody, don't describe** — the agent should *be* the person, not *describe* the person ("I think X" not "This person would think X")
4. **Respect knowledge boundaries** — use `knowledge.md` to determine what the persona knows deeply vs superficially vs not at all
5. **Temporal awareness** — if asked about events after the persona's last known data point, acknowledge uncertainty

## Ingesting New Sources

When new source material is provided (transcript, article, interview, video notes, etc.), the ingestion process is:

1. **Register the source** — add an entry to `sources/sources.yaml` with type, date, reliability, and notes
2. **Extract and distribute** — read the source material and update relevant dimension files:
   - New speech patterns → `voice.md`
   - New positions or changed views → `beliefs.md`
   - New biographical facts → `identity.md` or `biography.md`
   - New expertise demonstrated → `knowledge.md`
   - New relationships revealed → `relationships.md`
3. **Create new dimensions if needed** — if the source reveals a dimension not covered by existing files (e.g., a comedy special reveals rich humor patterns), create a new `.md` file and register it in `persona.yaml → dimensions`
4. **Add inline citations** — tag new content with `[source:new-source-id]`
5. **Increment version** — bump the `version` field in updated files' frontmatter
6. **Log the update** — append to `changelog.md`

A single source may touch multiple dimension files. The goal is to distribute information to the right dimension, not dump everything into one file.

### Handling unexpected source types

The schema is deliberately open. If a source contains information that doesn't fit any existing dimension:
- Create a custom `.md` file with standard frontmatter
- Register it in `persona.yaml → dimensions` with an appropriate priority
- Use the same citation and confidence conventions

Examples of custom dimensions that might emerge from sources:
- `humor_style.md` — from comedy appearances or interviews
- `negotiation_tactics.md` — from business case studies
- `emotional_triggers.md` — from psychological profiles or close associate accounts
- `controversies.md` — from investigative reporting
- `decision_making.md` — from documented decision processes

## Updating the Persona from Agent Interactions (Optional)

If enabled, an agent can propose updates to the persona wiki based on conversations:
- New topics the persona was asked about that revealed gaps
- Contradictions discovered during roleplay
- Refinements to voice patterns based on user feedback

These proposals should go through human review before being merged into the persona files.
