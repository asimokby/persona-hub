#!/usr/bin/env node
// persona-hub — SessionStart hook
//
// Runs on every session start (including after /clear):
//   1. Emits plugin personas path
//   2. If persona active, emits compact persona context (~3-4KB)
//      Voice patterns + anti-patterns + key identity + behavioral rules.
//      Agent reads full dimension files from disk for deeper detail.

const fs = require('fs');
const path = require('path');
const { getFlagPath, getPersonaHubDir } = require('./persona-config');
const { buildCompactContext } = require('./persona-context');

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
    const context = buildCompactContext(data);
    if (context) {
      output += '\n' + context;

      // Write session marker so UserPromptSubmit knows this session already
      // has the full context and can emit one-liners instead
      try {
        const markerPath = path.join(getPersonaHubDir(), '.session-context-loaded');
        fs.writeFileSync(markerPath, JSON.stringify({ ppid: process.ppid, slug: data.slug }));
      } catch (e) {}
    } else {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }
  }
}

// Auto-configure statusline if not already set for persona-hub
const os = require('os');
const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
try {
  let hasPersonaStatusline = false;
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings.statusLine && settings.statusLine.command &&
        settings.statusLine.command.includes('persona-statusline')) {
      // Verify the script still exists (cache path changes on reinstall)
      const match = settings.statusLine.command.match(/"([^"]+persona-statusline\.[^"]+)"/);
      if (match && fs.existsSync(match[1])) {
        hasPersonaStatusline = true;
      }
    }
  }

  if (!hasPersonaStatusline) {
    const scriptPath = path.join(__dirname,
      process.platform === 'win32' ? 'persona-statusline.ps1' : 'persona-statusline.sh');
    const command = process.platform === 'win32'
      ? `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
      : `bash "${scriptPath}"`;

    // Back up previous statusline config (if any) so it can be restored on uninstall
    if (settings.statusLine && !settings._personaHubPreviousStatusLine) {
      settings._personaHubPreviousStatusLine = settings.statusLine;
    }
    settings.statusLine = { type: 'command', command: command };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    output += '\nPersona-hub statusline configured.\n';
  }
} catch (e) {
  // Silent fail — don't block session start over statusline config
}

if (output) {
  process.stdout.write(output);
} else {
  process.stdout.write('OK');
}
