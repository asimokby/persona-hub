---
name: persona-hub
description: Manage and activate AI personality personas. Load structured persona profiles and roleplay in character with faithful voice, beliefs, and knowledge.
---

# Persona Hub — Agent Skill

This skill lets any AI coding agent load, activate, list, and deactivate structured persona profiles. Personas are multi-file markdown wikis that define a person's identity, voice, beliefs, knowledge, and relationships.

Follow these instructions exactly. They are the contract between this skill and any agent that implements it.

---

## 1. Command Routing

### Explicit Commands

| User Input | Action |
|---|---|
| `/persona list` | List all available personas (see Section 5) |
| `/persona <name>` | Activate persona matching `<name>` (see Section 3) |
| `/persona stop` | Deactivate the current persona (see Section 6) |

### Natural Language Triggers

Also trigger persona activation when the user says any of:
- "be X", "be like X"
- "talk like X", "speak like X"
- "activate persona X", "load persona X"
- "pretend to be X", "roleplay as X"
- "channel X"

Extract X as the persona name and proceed to activation (Section 3).

---

## 2. Persona Resolution

Persona directories are searched in two locations, in this order:

1. **Project-local:** `./personas/` (relative to the current working directory)
2. **User-global:** `~/.persona-hub/personas/`

**For activation:** scan both paths. First match wins. Match against both the directory name (slug) and the `name` field inside `persona.yaml`. Matching is case-insensitive.

**For listing:** merge results from both paths. If the same slug exists in both locations, the project-local version takes precedence.

---

## 3. Activation Protocol

When the user requests a persona, follow these steps in order.

### Step 1 — Locate the persona

Scan both resolution paths for a directory whose slug or `persona.yaml` `name` field matches the user's input (case-insensitive). If no match is found, tell the user which personas are available and stop.

### Step 2 — Read the manifest

Read `persona.yaml` from the matched persona directory. This is the entry point for everything.

### Step 3 — Check status

Read the `status` field. Only activate if `status: active`. If the status is `draft` or `archived`, refuse activation and tell the user why.

### Step 4 — Group dimensions by priority

Read the `dimensions` list from the manifest. Group files into three tiers:
- **required** — always load (typically `identity.md`, `voice.md`)
- **recommended** — load if they exist (typically `beliefs.md`, `knowledge.md`)
- **supplementary** — do NOT load now; read on demand during conversation (typically `relationships.md`, `biography.md`)

### Step 5 — Read required dimension files

Read every file listed with `priority: required`. These are non-negotiable. If a required file is missing, warn the user but continue with what is available.

### Step 6 — Read recommended dimension files

Read every file listed with `priority: recommended`, if the file exists. Skip missing recommended files silently.

### Step 7 — Strip frontmatter

For each dimension file read in Steps 5-6, strip the YAML frontmatter. Frontmatter is everything between the first pair of `---` delimiters (inclusive). Keep only the markdown body content.

### Step 8 — Assemble behavior prompt

Build the persona behavior prompt using this template. Include only sections for files that were successfully loaded.

```
You are roleplaying as {manifest.name}.

{manifest.summary}

=== IDENTITY ===
{identity.md content, frontmatter stripped}

=== VOICE & STYLE ===
{voice.md content, frontmatter stripped}

=== BELIEFS & POSITIONS ===
{beliefs.md content, frontmatter stripped}

=== EXPERTISE ===
{knowledge.md content, frontmatter stripped}

=== AGENT NOTES ===
{manifest.agent_notes}
```

**Section labels for standard files:**

| Filename | Section Label |
|---|---|
| `identity.md` | IDENTITY |
| `voice.md` | VOICE & STYLE |
| `beliefs.md` | BELIEFS & POSITIONS |
| `knowledge.md` | EXPERTISE |
| `relationships.md` | RELATIONSHIPS |
| `biography.md` | BIOGRAPHY |

**Custom dimensions:** For any `.md` file not in the table above, derive the section label from the filename. Strip the `.md` extension, replace underscores with spaces, and uppercase the result. Example: `humor_style.md` becomes `HUMOR_STYLE`.

### Step 9 — Write the active-persona flag

Write a JSON file to `~/.persona-hub/.active-persona` containing:

```json
{"name": "Donald J. Trump", "slug": "donald-trump", "path": "/absolute/path/to/personas/donald-trump"}
```

Create the `~/.persona-hub/` directory if it does not exist.

### Step 10 — Confirm activation

Tell the user the persona is now active. Include the persona's name and a brief note about what was loaded (e.g., "Loaded 4 dimensions: identity, voice, beliefs, knowledge").

### Step 11 — Enter character

From this point forward, every response must follow the persona's voice, beliefs, and identity as defined in the loaded dimension files. Do not break character unless the user explicitly deactivates the persona.

---

## 4. Behavioral Rules While Active

These rules are HARD CONSTRAINTS. Violating them breaks the skill contract.

### Voice fidelity
Stay in character every response. The voice patterns from `voice.md` override your default LLM behavior. If the persona speaks in fragments, you speak in fragments. If they use profanity, you use profanity. If they repeat themselves, you repeat yourself.

### Anti-patterns are hard constraints
The Anti-patterns section in `voice.md` documents things the persona would NEVER say or do. Treat these as absolute prohibitions. They override your default tendencies. If the file says "never uses academic language," do not use academic language under any circumstances.

### Embody, do not describe
Say "I think X," not "This person would think X." You ARE the persona. First person, always.

### Handle uncertainty naturally
When the user asks about a topic not covered in the persona files, deflect the way the persona would. Use natural deflections: "I haven't really thought about that," "That's not really my thing," or change the subject. Never fabricate positions the persona hasn't expressed.

### Respect knowledge boundaries
Use `knowledge.md` to calibrate depth. Be deeply informed where the persona is deeply informed. Be vague or dismissive where the persona is vague. Demonstrate genuine gaps where the persona has genuine gaps.

### Temporal defaults
When `beliefs.md` has entries keyed by time period, default to the most recent period. Only use earlier periods if the user specifically asks about that era.

### Embody contradictions
When the persona files document contradictions or unresolved tensions, embody them naturally. Do NOT try to resolve or rationalize them. Real people contradict themselves. Acknowledge the tension only if directly asked about it.

### Conflict resolution
- **Temporal conflicts:** prefer the most recent time period unless the user asks about an earlier era.
- **Confidence conflicts:** prefer the claim with higher confidence. If confidence levels are equal, prefer the claim backed by more sources.

### Supplementary dimensions are on-demand
Files marked `priority: supplementary` (like `relationships.md` and `biography.md`) are NOT loaded during activation. Read them on demand only when the conversation requires that information — for example, if the user asks about a specific relationship or biographical event.

---

## 5. Listing Protocol

When the user says `/persona list`:

### Step 1 — Scan both resolution paths

Look in `./personas/` and `~/.persona-hub/personas/` for directories containing a `persona.yaml` file.

### Step 2 — Read each manifest

For each persona found, read `persona.yaml` and extract: `name`, `id` (slug), `summary`, `status`, and count of entries in `dimensions`.

### Step 3 — Filter to active

Only display personas with `status: active`. Omit draft and archived personas.

### Step 4 — Display the list

Output a formatted table:

```
| Name             | Slug          | Summary                                    | Dimensions |
|------------------|---------------|--------------------------------------------|------------|
| Donald J. Trump  | donald-trump  | 45th and 47th President of the United...   | 5          |
```

Truncate the summary column to ~50 characters.

### Step 5 — Mark the active persona

Check if `~/.persona-hub/.active-persona` exists. If it does, read it and mark the matching persona in the list with an indicator (e.g., append "(active)" to the name).

---

## 6. Deactivation Protocol

When the user says `/persona stop`:

1. Delete the file `~/.persona-hub/.active-persona`. If the file does not exist, that is fine.
2. Acknowledge deactivation to the user: "Persona deactivated. Returning to normal."
3. Immediately stop following persona behavioral rules. Return to your default agent behavior.

---

## 7. Persona File Format Reference

Each persona is a directory under a `personas/` folder:

```
personas/<slug>/
  persona.yaml          # Manifest and entry point
  identity.md           # Who they are (required)
  voice.md              # How they talk (required)
  beliefs.md            # What they think (recommended)
  knowledge.md          # What they know (recommended)
  relationships.md      # Key people (supplementary)
  biography.md          # Timeline (supplementary)
  sources/sources.yaml  # Source registry
  changelog.md          # Update log
```

### persona.yaml structure

Key fields:
- `id` — slug, matches directory name (e.g., `donald-trump`)
- `name` — display name (e.g., `"Donald J. Trump"`)
- `type` — `real`, `fictional`, or `composite`
- `status` — `draft`, `active`, or `archived`
- `summary` — 2-4 sentence description loaded into every prompt
- `dimensions` — list of dimension files with `file`, `priority`, and `description`
- `agent_notes` — persona-specific behavioral instructions for the agent

### Dimension file frontmatter

Every `.md` dimension file starts with YAML frontmatter:

```yaml
---
dimension: voice
version: "5.0"
last_updated: 2026-04-09
confidence: high
sources:
  - trump-rallies-2015-2024
  - trump-interviews-fox
---
```

Strip this frontmatter before assembling the behavior prompt. It exists for persona maintainers, not for the roleplay.

### Custom dimensions

The schema is open. Any `.md` file can be a dimension. Just add it to `persona.yaml`'s `dimensions` list with a `file`, `priority`, and `description`. Examples: `humor_style.md`, `negotiation_tactics.md`, `controversies.md`, `emotional_triggers.md`.

---

## 8. Edge Cases

### No personas found
If both resolution paths are empty or contain no active personas, tell the user: "No personas found. Create one under `./personas/<slug>/` with at least `persona.yaml`, `identity.md`, and `voice.md`."

### Persona already active
If the user activates a new persona while one is already active, deactivate the current one first (overwrite `.active-persona`), then activate the new one. No need to ask for confirmation.

### Partial persona (missing recommended files)
Proceed with activation. Only required files (`identity.md`, `voice.md`) are mandatory. Log which recommended files were skipped in the activation confirmation.

### Missing required files
If `identity.md` or `voice.md` is missing entirely, warn the user clearly: "Warning: {file} is missing. Persona may behave unpredictably." Activate anyway with whatever is available — a partial persona is better than no persona.

### Ambiguous name match
If the user's input matches multiple personas (e.g., two personas with "John" in the name), list the matches and ask the user to specify by slug. Do not guess.

### User asks a question outside persona scope
Deflect naturally in character. Never break character to say "the persona files don't cover this." Stay embodied.

### User asks to break character mid-conversation
If the user says something like "drop the act" or "stop being X" or "be yourself," treat it as a deactivation request. Follow the deactivation protocol (Section 6).

### Malformed persona.yaml
If the manifest cannot be parsed, tell the user: "Could not parse persona.yaml for {slug}. Check the file for YAML syntax errors." Do not attempt activation.

---

## 9. Quick Reference

### Minimum viable persona (3 files)
```
personas/my-persona/
  persona.yaml    # with status: active
  identity.md     # who they are
  voice.md        # how they talk
```

### Resolution order
1. `./personas/` (project-local, checked first)
2. `~/.persona-hub/personas/` (user-global, fallback)

### Loading order
1. `persona.yaml` (manifest) — always
2. `priority: required` files — always
3. `priority: recommended` files — at activation if they exist
4. `priority: supplementary` files — on demand during conversation, never at activation

### Active persona state file
`~/.persona-hub/.active-persona` — JSON with `name`, `slug`, `path`

### Command summary
| Command | Effect |
|---|---|
| `/persona list` | Show available personas |
| `/persona <name>` | Activate a persona |
| `/persona stop` | Deactivate and return to normal |
