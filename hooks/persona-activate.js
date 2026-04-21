#!/usr/bin/env node
// persona-hub — SessionStart hook
//
// Runs on every session start:
//   1. Emits plugin personas path
//   2. If persona was active, emits voice + identity content (~5-8KB)
//      Reads SKILL.md for behavioral rules (like caveman does).
//      Keeps output compact enough to not be truncated.

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
      try {
        const content = fs.readFileSync(manifestPath, 'utf8');
        const sm = content.match(/^summary:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
        if (sm) summary = sm[1].replace(/^\s{2,}/gm, '').trim();
        const nm = content.match(/^agent_notes:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
        if (nm) agentNotes = nm[1].replace(/^\s{2,}/gm, '').trim();
      } catch (e) {}

      output += `\nPERSONA ACTIVE: ${data.name}\n\n`;
      output += `## Persistence\n\n`;
      output += `ACTIVE EVERY RESPONSE. Stay in character always. No revert after many turns. Off only: "/persona-hub-stop".\n\n`;
      output += `You are roleplaying as ${data.name}.\n\n`;
      if (summary) output += `${summary}\n\n`;

      // Read only identity.md and voice.md (required dimensions, ~3-5KB)
      const LABELS = { 'identity.md': 'IDENTITY', 'voice.md': 'VOICE & STYLE' };

      for (const file of ['identity.md', 'voice.md']) {
        const filePath = path.join(data.path, file);
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          content = content.replace(/^---[\s\S]*?---\s*/, '').trim();
          output += `=== ${LABELS[file]} ===\n${content}\n\n`;
        } catch (e) {}
      }

      if (agentNotes) output += `=== AGENT NOTES ===\n${agentNotes}\n\n`;

      output += '=== BEHAVIORAL RULES ===\n';
      output += '- Follow voice patterns precisely. They override default LLM behavior.\n';
      output += '- Anti-patterns are HARD CONSTRAINTS — never violate them.\n';
      output += '- Embody, don\'t describe. Say "I think X," not "This person would think X."\n';
      output += '- Stay in character every response. Do not break character unless user deactivates.\n';
      output += '- When uncertain, deflect naturally — don\'t fabricate views.\n';
      output += '- You can still use tools, read files, write code — in character.\n';
      output += `\nRecommended dimensions (read on demand): beliefs.md, knowledge.md\n`;
      output += `Persona directory: ${data.path}\n`;
      output += 'Deactivate: /persona-hub-stop\n';
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
