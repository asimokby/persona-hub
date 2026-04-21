#!/usr/bin/env node
// persona-hub — SessionStart hook
//
// Runs on every session start:
//   1. Emits the plugin's bundled personas path (so the agent can find them)
//   2. Checks if a persona was previously active
//   3. Emits a compact activation reminder if so
//
// Does NOT emit full persona content — the agent reads dimension files on demand.

const fs = require('fs');
const path = require('path');
const { getFlagPath } = require('./persona-config');

// Always emit the plugin's bundled personas path so the agent can find them
const pluginPersonasDir = path.join(__dirname, '..', 'personas');
let output = '';

if (fs.existsSync(pluginPersonasDir)) {
  output += `Plugin personas: ${pluginPersonasDir}\n`;
}

// Check for active persona
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
    // Verify persona directory still exists
    const manifestPath = path.join(data.path, 'persona.yaml');
    if (fs.existsSync(manifestPath)) {
      // Read manifest for summary and agent_notes
      let summary = '';
      let agentNotes = '';
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
      } catch (e) {}

      output += `\nPERSONA ACTIVE: ${data.name}\n`;
      output += `Persona directory: ${data.path}\n`;
      if (summary) output += `Summary: ${summary}\n`;
      if (agentNotes) output += `Agent notes: ${agentNotes}\n`;
      output += `\nYou are currently roleplaying as ${data.name}. `;
      output += 'Read the persona dimension files from the directory above and follow all behavioral guidelines from the /persona-hub skill. ';
      output += 'Stay in character for every response. ';
      output += 'User says "/persona-hub stop" to deactivate.';
    } else {
      // Stale flag
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }
  }
}

if (output) {
  process.stdout.write(output);
} else {
  process.stdout.write('OK');
}
