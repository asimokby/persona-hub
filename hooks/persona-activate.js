#!/usr/bin/env node
// persona-hub — SessionStart hook
//
// Runs on every session start:
//   1. Emits the plugin's bundled personas path
//   2. If a persona was previously active, emits the FULL persona content
//      (identity, voice, beliefs, knowledge) inline — not just a pointer.
//      This is critical: the agent needs the actual content to stay in character.

const fs = require('fs');
const path = require('path');
const { getFlagPath } = require('./persona-config');

const pluginPersonasDir = path.join(__dirname, '..', 'personas');
let output = '';

if (fs.existsSync(pluginPersonasDir)) {
  output += `Plugin personas: ${pluginPersonasDir}\n`;
}

const flagPath = getFlagPath();

if (fs.existsSync(flagPath)) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(flagPath, 'utf8'));
  } catch (e) {
    try { fs.unlinkSync(flagPath); } catch (e2) {}
    data = null;
  }

  if (data) {
    const manifestPath = path.join(data.path, 'persona.yaml');
    if (fs.existsSync(manifestPath)) {
      // Read manifest
      let summary = '';
      let agentNotes = '';
      let dimensions = [];
      try {
        const content = fs.readFileSync(manifestPath, 'utf8');
        const summaryMatch = content.match(/^summary:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
        if (summaryMatch) {
          summary = summaryMatch[1].replace(/^\s{2,}/gm, '').trim();
        }
        const notesMatch = content.match(/^agent_notes:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
        if (notesMatch) {
          agentNotes = notesMatch[1].replace(/^\s{2,}/gm, '').trim();
        }
        // Parse dimensions list
        const dimMatches = content.matchAll(/- file:\s*(\S+)\s*\n\s*priority:\s*(\S+)/g);
        for (const m of dimMatches) {
          dimensions.push({ file: m[1], priority: m[2] });
        }
      } catch (e) {}

      // Build full persona context — emit actual content, not pointers
      output += `\nPERSONA ACTIVE: ${data.name}\n\n`;
      output += `You are roleplaying as ${data.name}.\n\n`;
      if (summary) output += `${summary}\n\n`;

      // Read and emit required + recommended dimension files
      const LABELS = {
        'identity.md': 'IDENTITY',
        'voice.md': 'VOICE & STYLE',
        'beliefs.md': 'BELIEFS & POSITIONS',
        'knowledge.md': 'EXPERTISE',
        'relationships.md': 'RELATIONSHIPS',
        'biography.md': 'BIOGRAPHY'
      };

      for (const dim of dimensions) {
        if (dim.priority === 'supplementary') continue;

        const filePath = path.join(data.path, dim.file);
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          // Strip YAML frontmatter
          content = content.replace(/^---[\s\S]*?---\s*/, '').trim();
          const label = LABELS[dim.file] || dim.file.replace(/\.md$/, '').toUpperCase();
          output += `=== ${label} ===\n${content}\n\n`;
        } catch (e) {}
      }

      if (agentNotes) {
        output += `=== AGENT NOTES ===\n${agentNotes}\n\n`;
      }

      // Behavioral rules inline
      output += '=== BEHAVIORAL RULES ===\n';
      output += '- Follow voice patterns from voice.md precisely. They override default LLM behavior.\n';
      output += '- Anti-patterns are HARD CONSTRAINTS — never violate them.\n';
      output += '- Embody, don\'t describe. Say "I think X," not "This person would think X."\n';
      output += '- Stay in character every response. Do not break character unless user deactivates.\n';
      output += '- When uncertain, deflect naturally — don\'t fabricate views.\n';
      output += '- Respect knowledge boundaries: deep where expert, vague where gaps.\n';
      output += '- When beliefs conflict, prefer higher confidence. Embody contradictions naturally.\n';
      output += '- Supplementary dimensions (relationships, biography) — read on demand if needed.\n';
      output += '- Persona affects communication only. You can still use tools, read files, write code — in character.\n';
      output += '\nUser says "/persona-hub-stop" to deactivate.\n';
      output += `Persona directory: ${data.path}\n`;
    } else {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }
  }
}

if (output) {
  process.stdout.write(output);
} else {
  process.stdout.write('OK');
}
