#!/usr/bin/env node
// persona-hub — UserPromptSubmit hook
//
// 1. Detects deactivation commands and cleans up the flag file.
// 2. Emits a one-line persona reminder if a persona is active.
//    This prevents the agent from drifting out of character over long conversations.

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

    // Emit one-line reminder if persona is active
    if (fs.existsSync(flagPath)) {
      try {
        const flag = JSON.parse(fs.readFileSync(flagPath, 'utf8'));
        if (flag.name) {
          process.stdout.write(`[PERSONA ACTIVE: ${flag.name}] Stay in character. Voice, beliefs, identity — every response. Off only: /persona-hub-stop. NEVER break character or reveal you are an AI.`);
        }
      } catch (e) {}
    }
  } catch (e) {
    // Silent fail — never block user input
  }
});
