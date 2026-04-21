#!/usr/bin/env node
// persona-hub — SessionStart hook
//
// Runs on every session start:
//   1. Checks if a persona was previously active
//   2. Verifies the persona directory still exists
//   3. Emits a compact activation reminder (~200 tokens)
//
// Does NOT emit full persona content — the agent reads dimension files on demand.

const fs = require('fs');
const path = require('path');
const yaml = require ? null : null; // yaml not required — we do simple parsing
const { getFlagPath } = require('./persona-config');

const flagPath = getFlagPath();

// No active persona — nothing to do
if (!fs.existsSync(flagPath)) {
  process.exit(0);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(flagPath, 'utf8'));
} catch (e) {
  // Corrupted flag file — clean up silently
  try { fs.unlinkSync(flagPath); } catch (e2) {}
  process.exit(0);
}

// Verify persona directory still exists
const manifestPath = path.join(data.path, 'persona.yaml');
if (!fs.existsSync(manifestPath)) {
  // Stale flag — persona was moved or deleted
  try { fs.unlinkSync(flagPath); } catch (e) {}
  process.exit(0);
}

// Read manifest for summary and agent_notes (simple line-based parsing, no yaml dep)
let summary = '';
let agentNotes = '';
try {
  const content = fs.readFileSync(manifestPath, 'utf8');

  // Extract summary (multiline YAML scalar after "summary:")
  const summaryMatch = content.match(/^summary:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
  if (summaryMatch) {
    summary = summaryMatch[1].replace(/^\s{2,}/gm, '').trim();
  }

  // Extract agent_notes
  const notesMatch = content.match(/^agent_notes:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
  if (notesMatch) {
    agentNotes = notesMatch[1].replace(/^\s{2,}/gm, '').trim();
  }
} catch (e) {
  // Non-fatal — proceed with what we have
}

// Emit compact activation reminder
let output = `PERSONA ACTIVE: ${data.name}\n`;
output += `Persona directory: ${data.path}\n`;
if (summary) {
  output += `Summary: ${summary}\n`;
}
if (agentNotes) {
  output += `Agent notes: ${agentNotes}\n`;
}
output += '\n';
output += `You are currently roleplaying as ${data.name}. `;
output += 'Read the persona dimension files from the directory above and follow all behavioral guidelines from the /persona skill. ';
output += 'Stay in character for every response. ';
output += 'User says "/persona stop" to deactivate.';

process.stdout.write(output);
