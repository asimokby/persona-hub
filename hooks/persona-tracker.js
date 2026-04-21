#!/usr/bin/env node
// persona-hub — UserPromptSubmit hook
//
// Runs on EVERY user message:
//   1. Detects deactivation commands and cleans up flag file
//   2. If persona is active, emits compact persona reminder
//      This ensures persona survives /clear and context compression.

const fs = require('fs');
const path = require('path');
const { getFlagPath } = require('./persona-config');

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

    // If persona is active, emit compact reminder on every message
    if (fs.existsSync(flagPath)) {
      let flagData;
      try {
        flagData = JSON.parse(fs.readFileSync(flagPath, 'utf8'));
      } catch (e) {
        return;
      }

      const personaDir = flagData.path;
      const manifestPath = path.join(personaDir, 'persona.yaml');
      if (!fs.existsSync(manifestPath)) {
        try { fs.unlinkSync(flagPath); } catch (e) {}
        return;
      }

      // Read voice.md for key patterns (most critical for staying in character)
      let voiceSummary = '';
      try {
        let voice = fs.readFileSync(path.join(personaDir, 'voice.md'), 'utf8');
        voice = voice.replace(/^---[\s\S]*?---\s*/, '').trim();
        // Extract just anti-patterns section if it exists
        const antiMatch = voice.match(/## Anti-patterns[\s\S]*?(?=\n## |\n$|$)/i);
        if (antiMatch) {
          voiceSummary = antiMatch[0].trim();
        }
      } catch (e) {}

      let output = `PERSONA ACTIVE: ${flagData.name}. Stay in character.\n`;
      if (voiceSummary) {
        output += `\n${voiceSummary}\n`;
      }
      output += `\nPersona directory: ${personaDir}\n`;
      output += 'If you lost persona context (e.g. after /clear), read the dimension files from the directory above.\n';
      output += 'Deactivate: /persona-hub-stop';

      process.stdout.write(output);
    }
  } catch (e) {
    // Silent fail — never block user input
  }
});
