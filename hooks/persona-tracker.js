#!/usr/bin/env node
// persona-hub — UserPromptSubmit hook
//
// Runs on EVERY user message:
//   1. Detects deactivation commands and cleans up flag file
//   2. If persona is active, emits compact persona reminder (~2-3KB)
//      Keeps voice patterns + anti-patterns (critical for character).
//      Full content is in SessionStart; this is the /clear safety net.

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

    // If persona is active, emit compact reminder
    if (fs.existsSync(flagPath)) {
      let flagData;
      try {
        flagData = JSON.parse(fs.readFileSync(flagPath, 'utf8'));
      } catch (e) { return; }

      const personaDir = flagData.path;
      if (!fs.existsSync(path.join(personaDir, 'persona.yaml'))) {
        try { fs.unlinkSync(flagPath); } catch (e) {}
        return;
      }

      // Read summary from manifest
      let summary = '';
      try {
        const manifest = fs.readFileSync(path.join(personaDir, 'persona.yaml'), 'utf8');
        const m = manifest.match(/^summary:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
        if (m) summary = m[1].replace(/^\s{2,}/gm, '').trim();
      } catch (e) {}

      // Read voice.md — extract just the key patterns and anti-patterns
      let voiceCompact = '';
      try {
        let voice = fs.readFileSync(path.join(personaDir, 'voice.md'), 'utf8');
        voice = voice.replace(/^---[\s\S]*?---\s*/, '').trim();

        // Extract key sections: Signature Patterns + Anti-patterns
        const sections = [];
        const sigMatch = voice.match(/## (?:Signature|Key|Core) (?:Patterns|Style|Moves)[\s\S]*?(?=\n## |\n$)/i);
        if (sigMatch) sections.push(sigMatch[0].trim());
        const antiMatch = voice.match(/## Anti-patterns[\s\S]*?(?=\n## |\n$)/i);
        if (antiMatch) sections.push(antiMatch[0].trim());

        if (sections.length > 0) {
          voiceCompact = sections.join('\n\n');
        } else {
          // Fallback: take first 1500 chars of voice
          voiceCompact = voice.substring(0, 1500);
        }
      } catch (e) {}

      let output = `PERSONA ACTIVE: ${flagData.name}\n\n`;
      output += `## Persistence\n\n`;
      output += `ACTIVE EVERY RESPONSE. Stay in character always. Do not revert. Off only: "/persona-hub-stop".\n\n`;
      output += `You are roleplaying as ${flagData.name}. ${summary}\n\n`;

      if (voiceCompact) {
        output += `=== VOICE (CRITICAL) ===\n${voiceCompact}\n\n`;
      }

      output += '=== RULES ===\n';
      output += '- Follow voice patterns precisely. Anti-patterns are HARD CONSTRAINTS.\n';
      output += '- Embody, don\'t describe. Say "I think X," not "This person would think X."\n';
      output += '- Stay in character every response. You can still use tools — in character.\n';
      output += `\n=== IMPORTANT: READ FULL PERSONA ===\n`;
      output += `Before responding, read these files for complete character depth:\n`;
      output += `- ${path.join(personaDir, 'beliefs.md')} — positions, values, contradictions\n`;
      output += `- ${path.join(personaDir, 'knowledge.md')} — expertise areas and gaps\n`;
      output += `Identity and voice are above. For relationships or biography, read from: ${personaDir}\n`;
      output += 'Deactivate: /persona-hub-stop\n';

      process.stdout.write(output);
    }
  } catch (e) {
    // Silent fail — never block user input
  }
});
