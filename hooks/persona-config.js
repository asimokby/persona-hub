#!/usr/bin/env node
// persona-hub — shared configuration resolver
//
// Resolution order for persona directory:
//   1. PERSONA_HUB_DIR environment variable
//   2. Config file:
//      - $XDG_CONFIG_HOME/persona-hub/config.json
//      - ~/.config/persona-hub/config.json (macOS / Linux)
//      - %APPDATA%\persona-hub\config.json (Windows)
//   3. ~/.persona-hub/

const fs = require('fs');
const path = require('path');
const os = require('os');

function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'persona-hub');
  }
  if (process.platform === 'win32') {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
      'persona-hub'
    );
  }
  return path.join(os.homedir(), '.config', 'persona-hub');
}

function getConfig() {
  try {
    const configPath = path.join(getConfigDir(), 'config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    return {};
  }
}

function getPersonaHubDir() {
  // 1. Environment variable
  if (process.env.PERSONA_HUB_DIR) {
    return process.env.PERSONA_HUB_DIR;
  }

  // 2. Config file
  const config = getConfig();
  if (config.personaDir) {
    return config.personaDir;
  }

  // 3. Default
  return path.join(os.homedir(), '.persona-hub');
}

function getFlagPath() {
  return path.join(getPersonaHubDir(), '.active-persona');
}

function getPersonasDir() {
  return path.join(getPersonaHubDir(), 'personas');
}

module.exports = { getPersonaHubDir, getFlagPath, getPersonasDir, getConfig, getConfigDir };
