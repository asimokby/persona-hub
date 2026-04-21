---
name: persona-hub-create
description: "Create or enrich a persona from folders, files, URLs, or text"
---

# Persona-Hub — Create & Enrich

Create a new persona or enrich an existing one from source materials.

## Two Modes

| Mode | Trigger | What happens |
|---|---|---|
| **Create** | `/persona-hub-create` on a new name | Scaffolds a new persona directory and populates from sources |
| **Enrich** | `/persona-hub-create` on an existing persona | Adds new findings to existing dimension files from new sources |

---

## Step 1 — Understand What the User Wants

Ask for what you don't already know:

- **Name** — who is the persona? (e.g., "Elon Musk", "Gandalf", "my CEO")
- **Type** — `real` (public figure), `fictional` (character), or `composite` (archetype/blend)
- **Sources** — this is the most important part. Ask the user to provide one or more of:

### Source Types (best to weakest)

| Source | Quality | Example |
|---|---|---|
| **Folder of files** | Best | `./transcripts/`, `./interviews/` — bulk ingestion of many files at once |
| **Individual files** | Great | `speech.txt`, `interview.md`, `podcast-transcript.txt` |
| **URLs** | Good | Links to articles, interviews, public statements |
| **Description** | OK for start | "He's a fast-talking NYC real estate guy who..." |
| **"Start minimal"** | MVP only | Creates skeleton files the user fills in later |

**Always encourage more sources.** A persona built from one description will be shallow. A persona built from 50+ transcripts will feel real. Tell the user:

> The more source material you provide, the more authentic the persona will be. Transcripts, interviews, speeches, and writings work best — they capture how someone actually talks, not how others describe them. You can always add more sources later with `/persona-hub-create <name>`.

### Batch Folder Ingestion

When the user points to a folder:
1. List all files in the folder (`.txt`, `.md`, `.json`, `.csv`, `.yaml`)
2. Tell the user how many files you found and their total size
3. Process each file, extracting persona-relevant content
4. Distribute findings across dimension files
5. Register each file as a source in `sources/sources.yaml`

This is the recommended workflow for building rich personas. Example:
```
User: /persona-hub-create Elon Musk
Agent: What sources do you have?
User: I have a folder of interview transcripts at ./musk-interviews/
Agent: Found 47 files in ./musk-interviews/. Processing...
```

---

## Step 2 — Scaffold (New Persona Only)

Skip this step if enriching an existing persona.

1. Derive slug from name (lowercase, hyphens, strip special chars): "Elon Musk" → `elon-musk`
2. Target directory: `./personas/<slug>/` if `personas/` exists in cwd, otherwise `~/.persona-hub/personas/<slug>/`
3. Create directory with: `persona.yaml`, `identity.md`, `voice.md`, `sources/sources.yaml`, `changelog.md`
4. Only create `beliefs.md`, `knowledge.md`, `relationships.md` if sources support them

### persona.yaml Template

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

Add more dimension entries as you create them (beliefs.md, knowledge.md, etc.).

---

## Step 3 — Analyze Sources & Populate Dimensions

Every `.md` dimension file starts with YAML frontmatter:
```yaml
---
dimension: <name>
version: 1
last_updated: <today>
confidence: medium
sources: [<source-ids>]
---
```

### What to Extract Per Dimension

Read each source and distribute findings to the right dimension file:

**voice.md** (required) — How they talk
- Sentence structure (short/long, fragments, run-ons)
- Vocabulary level and favorite words
- Verbal tics and filler words
- Rhetorical moves (repetition, hyperbole, understatement)
- Tone (formal, casual, aggressive, warm)
- **Anti-patterns** — things they would NEVER say. These are hard constraints.

**identity.md** (required) — Who they are
- Background, origin, formative experiences
- Roles they identify with
- Self-concept (how they see themselves)
- Public vs private persona differences

**beliefs.md** (recommended) — What they think
- Core values and principles
- Positions by topic, with temporal evolution (views change over time)
- Contradictions and unresolved tensions — document these, don't resolve them

**knowledge.md** (recommended) — What they know
- Areas of deep expertise (speak authoritatively)
- Working knowledge (can discuss, not expert)
- Knowledge gaps (be vague or dismissive here)

**relationships.md** (supplementary) — Who matters to them
- Key people and dynamics
- Relationship patterns (mentor, rival, ally)

### Citation Format

Every claim should have an inline citation:
```
He frequently uses superlatives [source:interview-2024-03, confidence:high]
```

Confidence levels:
- `high` — direct quote or repeated pattern across multiple sources
- `medium` — clearly implied from source material
- `low` — single instance or reasonable inference
- `speculative` — educated guess, flagged for verification

### Register Sources

Add every source to `sources/sources.yaml`:
```yaml
sources:
  - id: interview-2024-03
    type: transcript
    title: "Joe Rogan Interview March 2024"
    date: "2024-03-15"
    path: "./transcripts/rogan-2024-03.txt"
    word_count: 12500
```

---

## Step 4 — MVP Check

Check if the minimum viable persona exists:
- `persona.yaml` has name, type, summary ✓
- `identity.md` has content beyond frontmatter ✓
- `voice.md` has content, including anti-patterns ✓

If yes: set `status: active` in persona.yaml, offer to activate with `/persona-hub <name>`
If no: keep `status: draft`, tell user what's missing

---

## Step 5 — Report

Show the user what was created/updated:

```
Persona: {name}
Status: {active|draft}
Sources processed: {count}
Dimensions: {list of files created/updated}
Total content: ~{word count} words

Next steps:
- Activate: /persona-hub <name>
- Add more sources: /persona-hub-create <name>
- Edit manually: {path to persona directory}
```

---

## Enrichment Mode (Existing Persona)

When `/persona-hub-create` targets an existing slug:

1. Read existing dimension files to understand current state
2. Process new sources
3. **ADD** new findings to existing files — don't overwrite, merge
4. Bump `version` in each updated file's frontmatter
5. Update `last_updated` dates
6. Register new sources in `sources/sources.yaml`
7. Append to `changelog.md`:
   ```
   ## v{version} — {date}
   - Added {count} new sources
   - Updated: {list of dimension files changed}
   - Key additions: {brief summary}
   ```

**Important:** When enriching, look for:
- New voice patterns not captured before
- Evolved or changed positions (add temporal entries, don't replace)
- Contradictions with existing content (document as unresolved tensions)
- Deeper detail on topics already covered
