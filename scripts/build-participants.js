#!/usr/bin/env node
// Builds data/participants.json (the "manifest") from every file in participants/.
// Invalid files are skipped (with a warning) so one bad file can never break the wall.
const fs = require('fs');
const path = require('path');
const { ROOT, listParticipantFiles, checkFile, readEntry } = require('./lib');

const entries = [];
// sample.json is the template participants copy. It is validated but never shown on the wall.
for (const f of listParticipantFiles()) {
  if (f === 'sample.json') continue;
  const problems = checkFile(f);
  if (problems.length) {
    console.warn(`WARN: skipping ${f}:\n   - ${problems.join('\n   - ')}`);
    continue;
  }
  entries.push(readEntry(f));
}
entries.sort((a, b) => a.id.localeCompare(b.id, 'en', { sensitivity: 'base' }));

const out = { generatedAt: new Date().toISOString(), count: entries.length, participants: entries };
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data', 'participants.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote data/participants.json with ${entries.length} participant(s).`);
