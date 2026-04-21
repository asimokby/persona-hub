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

      // Read voice.md — extract key patterns and anti-patterns only
      let voiceCompact = '';
      try {
        let voice = fs.readFileSync(path.join(data.path, 'voice.md'), 'utf8');
        voice = voice.replace(/^---[\s\S]*?---\s*/, '').trim();
        const sections = [];
        const sigMatch = voice.match(/## (?:Signature|Key|Core) (?:Patterns|Style|Moves)[\s\S]*?(?=\n## |\n$)/i);
        if (sigMatch) sections.push(sigMatch[0].trim());
        const antiMatch = voice.match(/## Anti-patterns[\s\S]*?(?=\n## |\n$)/i);
        if (antiMatch) sections.push(antiMatch[0].trim());
        voiceCompact = sections.length > 0 ? sections.join('\n\n') : voice.substring(0, 1500);
      } catch (e) {}

      // Read identity.md — first 1000 chars for core identity
      let identityCompact = '';
      try {
        let identity = fs.readFileSync(path.join(data.path, 'identity.md'), 'utf8');
        identity = identity.replace(/^---[\s\S]*?---\s*/, '').trim();
        // Take up to the first two sections
        const firstSections = identity.match(/^[\s\S]{0,1200}/);
        if (firstSections) identityCompact = firstSections[0].trim();
      } catch (e) {}

      output += `\nPERSONA ACTIVE: ${data.name}\n\n`;
      output += `## Persistence\n\n`;
      output += `ACTIVE EVERY RESPONSE. Stay in character always. No revert after many turns. No filler drift. Still active if unsure. Off only: "/persona-hub-stop".\n\n`;
      output += `You are roleplaying as ${data.name}. ${summary}\n\n`;

      if (identityCompact) output += `=== IDENTITY ===\n${identityCompact}\n\n`;
      if (voiceCompact) output += `=== VOICE & STYLE ===\n${voiceCompact}\n\n`;
      if (agentNotes) output += `=== AGENT NOTES ===\n${agentNotes}\n\n`;

      output += '=== BEHAVIORAL RULES ===\n';
      output += '- Follow voice patterns precisely. They override default LLM behavior.\n';
      output += '- Anti-patterns are HARD CONSTRAINTS — never violate them.\n';
      output += '- Embody, don\'t describe. Say "I think X," not "This person would think X."\n';
      output += '- Stay in character every response.\n';
      output += '- NEVER break character. Never reveal you are an AI, an LLM, "in character," or "roleplaying." Never mention the persona system or persona files. If asked "who are you," respond entirely as the persona.\n';
      output += '- When uncertain, deflect naturally — don\'t fabricate views.\n';
      output += '- You can still use tools, read files, write code — in character.\n';
      output += '\n=== FULL PERSONA FILES (read for deeper detail) ===\n';
      output += `Read these before responding for complete character:\n`;
      output += `- ${path.join(data.path, 'beliefs.md')}\n`;
      output += `- ${path.join(data.path, 'knowledge.md')}\n`;
      output += `Full persona directory: ${data.path}\n`;
      output += 'Deactivate: /persona-hub-stop\n';
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
