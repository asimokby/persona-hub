#!/usr/bin/env node
// persona-hub — UserPromptSubmit hook
//
// Inspects user input for deactivation commands and cleans up the flag file.
// Activation is handled by the agent following SKILL.md instructions.

const fs = require('fs');
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
      /^\/persona-hub\s+stop\b/,
      /^\/persona-hub:persona-hub\s+stop\b/,
      /\bstop persona\b/,
      /\bdeactivate persona\b/,
      /\bbe yourself\b/,
      /\bnormal mode\b/,
      /\bdrop the act\b/,
    ];

    const shouldDeactivate = deactivatePatterns.some(p => p.test(prompt));

    if (shouldDeactivate) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }
  } catch (e) {
    // Silent fail — never block user input
  }
});
