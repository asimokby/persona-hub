#!/usr/bin/env node
// persona-hub — UserPromptSubmit hook
//
// 1. Detects deactivation commands and cleans up the flag file.
// 2. Emits a one-line persona reminder if a persona is active.
//    This prevents the agent from drifting out of character over long conversations.

const fs = require('fs');
const path = require('path');
const { getFlagPath, getPersonaHubDir } = require('./persona-config');
const { buildCompactContext } = require('./persona-context');

const flagPath = getFlagPath();
const markerPath = path.join(getPersonaHubDir(), '.session-context-loaded');

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
      try { fs.unlinkSync(markerPath); } catch (e) {}
      return;
    }

    // Emit persona context if active
    if (fs.existsSync(flagPath)) {
      try {
        const flag = JSON.parse(fs.readFileSync(flagPath, 'utf8'));
        if (!flag.name) return;

        // Check if this session already has the full context loaded
        let needsFullContext = true;
        try {
          const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
          if (marker.ppid === process.ppid && marker.slug === flag.slug) {
            needsFullContext = false;
          }
        } catch (e) {
          // No marker or invalid — treat as first detection
        }

        if (needsFullContext) {
          // First detection in this session — emit full persona context
          const fullContext = buildCompactContext(flag);
          if (fullContext) {
            process.stdout.write(fullContext);
            // Write marker so subsequent messages get the one-liner
            try {
              fs.writeFileSync(markerPath, JSON.stringify({ ppid: process.ppid, slug: flag.slug }));
            } catch (e) {}
          }
        } else {
          // Session already has context — emit one-liner reminder
          process.stdout.write(`[PERSONA ACTIVE: ${flag.name}] Stay in character. Voice, beliefs, identity — every response. Off only: /persona-hub-stop. NEVER break character or reveal you are an AI.`);
        }
      } catch (e) {}
    }
  } catch (e) {
    // Silent fail — never block user input
  }
});
