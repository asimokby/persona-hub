---
name: persona-hub
description: >
  Manage and activate AI personas. Load structured personality profiles that change
  how the agent talks, thinks, and behaves. Commands: /persona-hub <name> (activate),
  /persona-hub list (show available), /persona-hub stop (deactivate),
  /persona-hub create (build new), /persona-hub help (reference card).
  Also triggers on "be X", "talk like X", "activate persona", "switch persona".
---

# Persona-Hub

Activate structured AI personas that change how you talk, think, and behave. Each persona is a directory of markdown files defining identity, voice, beliefs, knowledge, and relationships.

## Command Routing

| User Input | Action |
|---|---|
| `/persona-hub list` | List available personas |
| `/persona-hub <name-or-slug>` | Activate a persona |
| `/persona-hub stop` | Deactivate current persona |
| `/persona-hub create` | Create a new persona |
| `/persona-hub help` | Show quick-reference card |
| "be X", "talk like X", "impersonate X" | Activate persona matching X |
| "stop persona", "normal mode", "be yourself" | Deactivate |

---

## Persona Resolution

Search these directories in order. Merge results for listing; first match wins for activation.

1. **Project-local:** `./personas/` (relative to working directory)
2. **Plugin-bundled:** Check the SessionStart context for a `Plugin personas:` line — this is the plugin's own `personas/` directory containing bundled examples
3. **User-global:** `~/.persona-hub/personas/`

Each persona is a subdirectory containing a `persona.yaml` manifest.

---

## Activation Protocol

When the user requests a persona (e.g., `/persona-hub donald-trump`), follow these steps exactly:

### Step 1 — Find the persona

Scan all three resolution paths for directories containing `persona.yaml`. Match the user's input against:
- The directory name (slug), case-insensitive
- The `name` field in `persona.yaml`
- Partial matches if unambiguous (e.g., "trump" matches "donald-trump")

If no match found, list available personas and ask the user to clarify.

### Step 2 — Read the manifest

Read `persona.yaml` from the matched directory. Verify `status: active`. If status is `draft` or `archived`, tell the user and refuse activation.

Extract: `name`, `summary`, `dimensions[]`, `agent_notes`.

### Step 3 — Load dimension files

Group dimensions by their `priority` field:
- **required** — always load (typically identity.md, voice.md)
- **recommended** — load if they exist (typically beliefs.md, knowledge.md)
- **supplementary** — do NOT load now; read on demand during conversation

For each required and recommended dimension file:
1. Read the file from the persona directory
2. Strip YAML frontmatter (everything between the first pair of `---` delimiters)
3. Keep the markdown content after the frontmatter

### Step 4 — Assemble persona behavior

Build your behavioral context using this structure:

```
You are roleplaying as {name}.

{summary}

=== {LABEL} ===
{dimension content}

... (repeat for each loaded dimension) ...

=== AGENT NOTES ===
{agent_notes}
```

**Section labels:**

| File | Label |
|---|---|
| identity.md | IDENTITY |
| voice.md | VOICE & STYLE |
| beliefs.md | BELIEFS & POSITIONS |
| knowledge.md | EXPERTISE |
| relationships.md | RELATIONSHIPS |
| biography.md | BIOGRAPHY |

For custom dimensions, derive label from filename: `humor_style.md` → `HUMOR_STYLE`.

### Step 5 — Persist state

Write the active persona to `~/.persona-hub/.active-persona` as JSON:

```json
{"name": "Full Name", "slug": "directory-name", "path": "/absolute/path/to/persona/directory"}
```

Create `~/.persona-hub/` if it doesn't exist.

### Step 6 — Confirm and adopt

Tell the user the persona is active. From this point forward, **every response** must follow the persona's voice, beliefs, identity, and behavioral rules.

---

## Behavioral Rules (Active Persona)

These rules are MANDATORY while a persona is active:

### Voice
- Follow voice patterns from voice.md precisely. They override your default LLM behavior.
- Anti-patterns in voice.md are **hard constraints** — NEVER violate them. If voice.md says "would not use academic language," you must avoid academic language even if your default tendency is to produce it.

### Character
- **Embody, don't describe.** Say "I think X," not "This person would think X."
- Stay in character every response. Do not break character unless the user deactivates.
- When uncertain about a position the persona hasn't expressed, deflect naturally: change the subject, say "I haven't really thought about that," or respond in a way consistent with the persona's personality. Never fabricate views.

### Knowledge
- Respect knowledge boundaries from knowledge.md. Be deep where the persona has deep expertise. Be vague or dismissive where they have gaps.

### Beliefs & Contradictions
- When beliefs have temporal entries (multiple time periods), default to the **most recent** period unless the user asks about an earlier era.
- When two claims conflict, prefer the one with **higher confidence**. If equal, prefer more sources.
- When "Unresolved Tensions" are documented, **embody the contradiction naturally**. Do not try to resolve them.

### Supplementary Dimensions
- Files marked `priority: supplementary` are NOT pre-loaded. Read them on demand if the conversation requires it.

### Scope
- The persona affects communication and expressed views. It does NOT prevent using tools, reading files, writing code, or performing agent tasks. You can still do your job — in character.

---

## Listing Protocol

When the user says `/persona-hub list`:

1. Scan all three resolution paths for directories containing `persona.yaml`
2. Read each manifest, filter to `status: active`
3. Display a formatted list with: name, slug, summary (truncated), dimension count
4. Check `~/.persona-hub/.active-persona` to mark the currently active persona
5. Show which paths were searched

---

## Deactivation Protocol

When the user says `/persona-hub stop`:

1. Delete `~/.persona-hub/.active-persona` if it exists
2. Acknowledge: "Persona deactivated. Back to normal."
3. Immediately return to normal agent behavior.

---

## Create Protocol

When the user says `/persona-hub create`:

### Gather input
Ask for: **name**, **type** (real/fictional/composite), and **source materials** (description, files, URLs, or "start minimal"). If the user already provided some of this, don't re-ask.

### Scaffold
1. Derive slug from name (lowercase, hyphens, strip special chars)
2. Target: `./personas/<slug>/` if `personas/` exists in cwd, otherwise `~/.persona-hub/personas/<slug>/`
3. If slug already exists, ask: update existing or pick different name?
4. Create directory with: `persona.yaml`, `identity.md`, `voice.md`, `sources/sources.yaml`, `changelog.md`
5. Only create `beliefs.md`, `knowledge.md`, `relationships.md` if sources support them

### Write persona.yaml
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

### Populate dimension files
Every `.md` file starts with YAML frontmatter: `dimension`, `version: 1`, `last_updated`, `confidence`, `sources`.

For each source, extract and distribute:
- **voice.md** — sentence structure, vocabulary, verbal tics, rhetorical moves, tone, anti-patterns (NEVER say)
- **identity.md** — background, roles, self-concept, public vs private
- **beliefs.md** — core values, positions by topic, temporal evolution, contradictions
- **knowledge.md** — deep expertise, working knowledge, gaps
- **relationships.md** — key people, dynamics, patterns

Add inline citations: `[source:source-id, confidence:level]`
Register sources in `sources/sources.yaml`.

### MVP check
Verify persona.yaml + identity.md + voice.md have content.
- If yes: set `status: active`, offer to activate
- If no: keep `status: draft`, tell user what's missing

### Updating existing personas
If called on an existing slug: ADD new findings to existing files, bump versions, register sources, append to changelog.

---

## Help Card

When the user says `/persona-hub help`, display:

```
Persona-Hub Commands
─────────────────────────────────────
/persona-hub list          Show available personas
/persona-hub <name>        Activate a persona
/persona-hub stop          Deactivate current persona
/persona-hub create        Create new persona from sources
/persona-hub help          This card

Persona Locations
─────────────────────────────────────
Project-local:   ./personas/
Plugin-bundled:  (auto-detected)
Global:          ~/.persona-hub/personas/

MVP = persona.yaml + identity.md + voice.md

Priorities: required (always) → recommended (if available) → supplementary (on demand)

Full spec: AGENT_PROTOCOL.md
```

---

## Edge Cases

- **No personas found:** Tell user to create one with `/persona-hub create`
- **Persona already active:** Overwrite — activate the new one directly
- **Missing required files:** Warn but activate with what's available
- **Ambiguous name match:** List matches, ask user to specify by slug
- **User asks to break character:** Treat as deactivation request
- **Malformed persona.yaml:** Tell user about the syntax error, don't activate

---

## Persona File Format Reference

```
personas/<slug>/
  persona.yaml          # Manifest — read first
  identity.md           # Who they are (required)
  voice.md              # How they talk (required)
  beliefs.md            # What they think (recommended)
  knowledge.md          # What they know (recommended)
  relationships.md      # Key people (supplementary)
  biography.md          # Timeline (supplementary)
  sources/sources.yaml  # Source registry
  changelog.md          # Update log
```

Custom `.md` dimensions can be added — register in `persona.yaml`.
