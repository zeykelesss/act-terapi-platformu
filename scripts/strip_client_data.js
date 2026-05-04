import fs from 'fs';

const PATH = 'public/app.js';
let content = fs.readFileSync(PATH, 'utf8');

const checkAndReplace = (label, regex, replacement) => {
  const before = content.length;
  content = content.replace(regex, replacement);
  const after = content.length;
  if (before === after) {
    console.error(`✗ ${label}: NO MATCH — aborting`);
    process.exit(1);
  }
  console.log(`✓ ${label}: ${before - after} chars removed`);
};

checkAndReplace(
  'METAPHOR_DATA',
  /\/\/ ── METAFOR VERİTABANI[^\n]*\nconst METAPHOR_DATA = \[[\s\S]*?\n\];/,
  "// METAFOR_DATA artık /api/metaphors'tan geliyor (data/metaphors.js)\nlet METAPHOR_DATA = [];"
);

checkAndReplace(
  'PROFILES',
  /\/\/ ── CLIENT PROFILES[^\n]*\nconst PROFILES = \[[\s\S]*?\n\];/,
  "// PROFILES artık /api/profiles'tan geliyor (data/profiles.js)\nlet PROFILES = [];"
);

checkAndReplace(
  'SCENARIOS',
  /const SCENARIOS = \[[\s\S]*?\n\];/,
  "// SCENARIOS artık /api/scenarios'tan geliyor (data/scenarios.js)\nlet SCENARIOS = [];"
);

fs.writeFileSync(PATH, content);
console.log('new line count:', content.split('\n').length);
