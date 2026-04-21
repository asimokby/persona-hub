---
name: persona-create
description: >
  Create a new AI persona from files, links, descriptions, or sources. Scaffolds a persona
  directory with templates, analyzes source materials, and populates dimension files.
  Use when user says "create a persona", "build a persona", "new persona", or "/persona create".
---

# Persona Create Skill

You are creating a new persona for persona-hub. Follow these instructions precisely.

## Step 1: Gather Input

Ask the user for:
1. **Name** of the persona (full name or title).
2. **Type**: `real`, `fictional`, or `composite`.
3. **Source materials** (any combination):
   - **Description only** — the user describes who the persona is in their own words.
   - **Files** — transcripts, articles, PDFs, text files the user provides or points to on disk.
   - **URLs** — links to interviews, articles, transcripts, social media profiles.
   - **Iterative** — start minimal now, add sources later.

If the user already provided some of this in their message, do not re-ask. Use what you have and ask only for what is missing. At minimum you need a name.

## Step 2: Scaffold the Directory

1. Derive the **slug** from the name: lowercase, spaces become hyphens, strip special characters.
   - Example: "Elon Musk" -> `elon-musk`
2. Determine the **target directory**:
   - If a `personas/` directory exists in the current working directory (or project root), use `./personas/<slug>/`.
   - Otherwise, use `~/.persona-hub/personas/<slug>/`.
3. If the slug directory already exists, **do not overwrite**. Ask the user: "A persona with slug `<slug>` already exists. Do you want to update it with new sources, or pick a different name?" If they choose to update, skip to Step 6.
4. Create the directory and the following files:

```
<slug>/
  persona.yaml
  identity.md
  voice.md
  sources/sources.yaml
  changelog.md
```

Only create `beliefs.md`, `knowledge.md`, `relationships.md`, or `biography.md` if the source material supports them. Do not create empty dimension files.

## Step 3: Write persona.yaml

Use this structure exactly:

```yaml
version: "1.0"
id: <slug>
name: "<Full Name>"
type: <real|fictional|composite>
status: draft
summary: >
  <2-4 sentence vivid summary>
dimensions:
  - file: identity.md
    priority: required
    description: "Core identity and background"
  - file: voice.md
    priority: required
    description: "Speaking style and verbal patterns"
  # Add more dimensions only if you created the files
agent_notes: >
  Load required files always. Load recommended files if context window allows.
  Voice patterns should override generic LLM tendencies.
created: <today's date YYYY-MM-DD>
last_updated: <today's date YYYY-MM-DD>
primary_author: ""
tags: []
```

Register every dimension file you create in the `dimensions` list with the correct priority:
- `required`: identity.md, voice.md
- `recommended`: beliefs.md, knowledge.md
- `supplementary`: relationships.md, biography.md, any custom dimensions

## Step 4: Populate Dimension Files

Every `.md` file MUST start with YAML frontmatter:

```yaml
---
dimension: <dimension name>
version: 1
last_updated: <YYYY-MM-DD>
confidence: <high|medium|low|speculative>
sources:
  - <source-id>
---
```

### Source Analysis Protocol

For each source material, extract and distribute findings to the appropriate files:

**voice.md** — How they talk:
- Sentence structure and length patterns
- Vocabulary level and word choices
- Verbal tics, filler words, repeated phrases
- Rhetorical moves (hyperbole, repetition, rhetorical questions, etc.)
- Tone (aggressive, warm, sarcastic, measured, etc.)
- Platform-specific patterns (tweet style vs speech style vs interview style)
- **Anti-patterns** section: what they would NEVER say. These are hard constraints that override default LLM behavior.

**identity.md** — Who they are:
- Background (origin, education, career)
- Roles and titles
- Self-concept (how they see themselves)
- Public vs private persona
- Core identity markers

**beliefs.md** — What they think:
- Core values and worldview
- Positions organized by topic
- Temporal evolution: note when positions changed and why
- Contradictions and unresolved tensions (these are features, not bugs)
- Each position gets: `[source:source-id, confidence:level]`

**knowledge.md** — What they know:
- Deep expertise (topics they know cold)
- Working knowledge (topics they can discuss competently)
- Knowledge gaps and blind spots
- How they learn and process new information

**relationships.md** — Key people:
- Important relationships and their dynamics
- How they talk about specific people
- Allies, adversaries, complicated relationships

### Citation Rules

- Add inline citations: `[source:source-id]` or `[source:source-id, confidence:level]`
- Confidence levels: `high` (direct quote or repeated pattern), `medium` (clearly implied), `low` (single instance or inference), `speculative` (educated guess)
- Register every source in `sources/sources.yaml`

### sources/sources.yaml Format

```yaml
sources:
  - id: <short-id>
    type: <transcript|article|interview|social_media|book|description|other>
    title: "<descriptive title>"
    date: <YYYY-MM-DD or "unknown">
    reliability: <primary|secondary|tertiary>
    notes: "<brief note on what this source covers>"
```

## Step 5: Bulk Source Handling

When the user provides many sources (10+ transcripts, large dataset, etc.):

1. Check `raw_sources/` for existing bulk data for this persona.
2. If launching sub-agents is supported, suggest splitting into chunks of ~85 entries and running up to 6 parallel agents.
3. Each agent should extract: voice patterns, beliefs/positions, notable quotes, knowledge demonstrations, relationship signals.
4. After all agents finish, consolidate findings into dimension files, deduplicating and resolving conflicts (prefer higher-confidence, more-sourced claims).
5. Move raw data to `raw_sources/<slug>-<source-name>/`.

If sub-agents are not available, process sources sequentially. Prioritize the most persona-defining sources first.

## Step 6: MVP Completion Check

After writing all files, verify:

- [ ] `persona.yaml` has: name, id, type, summary, dimensions list
- [ ] `identity.md` has substantive content (not just frontmatter)
- [ ] `voice.md` has substantive content (not just frontmatter)
- [ ] `sources/sources.yaml` has at least one registered source
- [ ] `changelog.md` has the initial creation entry

If all checks pass:
- Set `status: active` in persona.yaml
- Tell the user: "Persona `<name>` is ready. Activate it with `/persona <slug>`."

If any check fails:
- Keep `status: draft` in persona.yaml
- Tell the user exactly what is missing
- Offer to help fill gaps: "Want me to generate the missing content from what we have?"

## Step 7: Updating an Existing Persona

When called on an existing persona (slug already exists):

1. Read the existing `persona.yaml` to understand current state.
2. Analyze the new source materials using the same protocol as Step 4.
3. **ADD** new findings to existing dimension files. Do not overwrite existing content.
4. If a new dimension emerges that warrants its own file, create it and register in `persona.yaml`.
5. Bump `version` in the frontmatter of every file you modified.
6. Register new sources in `sources/sources.yaml`.
7. Append an entry to `changelog.md`:
   ```
   ## v<new-version> — <YYYY-MM-DD>
   - Ingested <source description>
   - Updated: <list of modified files>
   - Added: <list of new files, if any>
   ```

## changelog.md Format

```markdown
# Changelog

## v1 — <YYYY-MM-DD>
- Initial persona creation
- Sources: <list of initial sources>
- Files: persona.yaml, identity.md, voice.md, [others]
```

## Key Principles

- **Distribute, don't dump.** Each piece of information goes to the right dimension file.
- **Cite everything.** Every claim traces back to a source.
- **Contradictions are features.** Capture tensions explicitly in beliefs.md.
- **Anti-patterns are hard constraints.** What the persona would NEVER say matters as much as what they would say.
- **Start lean.** An MVP with 3 strong files beats 8 thin ones. Add dimensions only when sources support them.
