#!/usr/bin/env node
// persona-hub — shared compact persona context builder
//
// Builds the ~3-4KB persona context string used by both:
//   - SessionStart hook (persona-activate.js) — on fresh sessions
//   - UserPromptSubmit hook (persona-tracker.js) — on first detection mid-session

const fs = require('fs');
const path = require('path');

/**
 * Build a compact persona context string from flag file data.
 * @param {Object} data - Flag file contents: { name, slug, path }
 * @returns {string|null} Full context string, or null if persona files are missing
 */
function buildCompactContext(data) {
  const manifestPath = path.join(data.path, 'persona.yaml');
  if (!fs.existsSync(manifestPath)) return null;

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

  // Read identity.md — first ~1200 chars for core identity
  let identityCompact = '';
  try {
    let identity = fs.readFileSync(path.join(data.path, 'identity.md'), 'utf8');
    identity = identity.replace(/^---[\s\S]*?---\s*/, '').trim();
    const firstSections = identity.match(/^[\s\S]{0,1200}/);
    if (firstSections) identityCompact = firstSections[0].trim();
  } catch (e) {}

  // Assemble context
  let output = '';
  output += `PERSONA ACTIVE: ${data.name}\n\n`;
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

  return output;
}

/**
 * Build a medium-weight per-message reminder (~300-500 bytes).
 * Stronger than a one-liner: includes concrete identity to assert
 * and key anti-patterns so the model doesn't default to "I'm an AI."
 * @param {Object} data - Flag file contents: { name, slug, path }
 * @returns {string} Reminder string
 */
function buildReminder(data) {
  // Read summary from manifest
  let summary = '';
  try {
    const content = fs.readFileSync(path.join(data.path, 'persona.yaml'), 'utf8');
    const sm = content.match(/^summary:\s*>?\s*\n((?:\s{2,}.+\n?)+)/m);
    if (sm) summary = sm[1].replace(/^\s{2,}/gm, '').trim().split('.').slice(0, 2).join('.') + '.';
  } catch (e) {}

  // Read anti-patterns from voice.md
  let antiPatterns = '';
  try {
    const voice = fs.readFileSync(path.join(data.path, 'voice.md'), 'utf8');
    const antiMatch = voice.match(/## Anti-patterns[\s\S]*?(?=\n## |\n$)/i);
    if (antiMatch) {
      // Extract just the bullet points, take first 5
      const bullets = antiMatch[0].match(/^- .+$/gm);
      if (bullets) antiPatterns = bullets.slice(0, 5).join('\n');
    }
  } catch (e) {}

  let output = `[PERSONA ACTIVE: ${data.name}] You ARE ${data.name}.`;
  if (summary) output += ` ${summary}`;
  output += `\nIf asked "who are you" — respond AS ${data.name}. NEVER say you are an AI, Claude, a language model, "in character," or "roleplaying." NEVER mention personas, plugins, or systems.`;
  output += `\nStay in character every response. Off only: /persona-hub-stop.`;
  if (antiPatterns) output += `\nAnti-patterns (NEVER do these):\n${antiPatterns}`;
  return output;
}

module.exports = { buildCompactContext, buildReminder };
