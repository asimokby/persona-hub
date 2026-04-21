#!/usr/bin/env node
// persona-hub — UserPromptSubmit hook
//
// Runs on EVERY user message:
//   1. Detects deactivation commands and cleans up flag file
//   2. If persona is active, emits full persona content to survive /clear

const fs = require('fs');
const path = require('path');
const { getFlagPath } = require('./persona-config');

const LABELS = {
  'identity.md': 'IDENTITY',
  'voice.md': 'VOICE & STYLE',
  'beliefs.md': 'BELIEFS & POSITIONS',
  'knowledge.md': 'EXPERTISE',
  'relationships.md': 'RELATIONSHIPS',
  'biography.md': 'BIOGRAPHY'
};

const flagPath = getFlagPath();

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').trim().toLowerCase();

    // Detect deactivation commands
    const deactivatePatterns = [
      /^\/persona-hub-stop\b/,
      /^\/persona-hub:persona-hub-stop\b/,
      /^\/persona-hub\s+stop\b/,
      /^\/persona-hub:persona-hub\s+stop\b/,
      /\bstop persona\b/,
      /\bdeactivate persona\b/,
      /\bbe yourself\b/,
      /\bnormal mode\b/,
      /\bdrop the act\b/,
    ];

    if (deactivatePatterns.some(p => p.test(prompt))) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
      return;
    }

    // If persona is active, emit full persona content
    if (fs.existsSync(flagPath)) {
      let flagData;
      try {
        flagData = JSON.parse(fs.readFileSync(flagPath, 'utf8'));
      } catch (e) { return; }

      const personaDir = flagData.path;
      const manifestPath = path.join(personaDir, 'persona.yaml');
      if (!fs.existsSync(manifestPath)) {
        try { fs.unlinkSync(flagPath); } catch (e) {}
        return;
      }

      // Read manifest
      let summary = '';
      let agentNotes = '';
      let dimensions = [];
      try {
        const content = fs.readFileSync(manifestPath, 'utf8');
        const summaryMatch = content.match(/^summary:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
        if (summaryMatch) summary = summaryMatch[1].replace(/^\s{2,}/gm, '').trim();
        const notesMatch = content.match(/^agent_notes:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
        if (notesMatch) agentNotes = notesMatch[1].replace(/^\s{2,}/gm, '').trim();
        const dimMatches = content.matchAll(/- file:\s*(\S+)\s*\n\s*priority:\s*(\S+)/g);
        for (const m of dimMatches) dimensions.push({ file: m[1], priority: m[2] });
      } catch (e) {}

      let output = `PERSONA ACTIVE: ${flagData.name}\n\n`;
      output += `You are roleplaying as ${flagData.name}.\n\n`;
      if (summary) output += `${summary}\n\n`;

      // Emit required + recommended dimension content
      for (const dim of dimensions) {
        if (dim.priority === 'supplementary') continue;
        const filePath = path.join(personaDir, dim.file);
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          content = content.replace(/^---[\s\S]*?---\s*/, '').trim();
          const label = LABELS[dim.file] || dim.file.replace(/\.md$/, '').toUpperCase();
          output += `=== ${label} ===\n${content}\n\n`;
        } catch (e) {}
      }

      if (agentNotes) output += `=== AGENT NOTES ===\n${agentNotes}\n\n`;

      output += '=== BEHAVIORAL RULES ===\n';
      output += '- Follow voice patterns precisely. They override default LLM behavior.\n';
      output += '- Anti-patterns are HARD CONSTRAINTS — never violate them.\n';
      output += '- Embody, don\'t describe. Say "I think X," not "This person would think X."\n';
      output += '- Stay in character every response.\n';
      output += '- When uncertain, deflect naturally — don\'t fabricate views.\n';
      output += '- Persona affects communication only. You can still use tools and write code — in character.\n';
      output += '\nDeactivate: /persona-hub-stop\n';

      process.stdout.write(output);
    }
  } catch (e) {
    // Silent fail — never block user input
  }
});
