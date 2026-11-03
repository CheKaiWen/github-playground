#!/usr/bin/env node
// Usage: node scripts/validate-participants.js [file.json ...]
// With no arguments, validates every file in participants/.
const path = require('path');
const { listParticipantFiles, checkFile } = require('./lib');

const args = process.argv.slice(2).map((a) => path.basename(a));
const files = args.length ? args : listParticipantFiles();
let failed = 0;

for (const f of files) {
  const problems = checkFile(f);
  if (problems.length === 0) {
    console.log(`PASS ${f}`);
  } else {
    failed++;
    console.log(`FAIL ${f}`);
    for (const p of problems) {
      console.log(`   - ${p}`);
      // GitHub Actions turns this into an annotation on the PR
      if (process.env.GITHUB_ACTIONS) console.log(`::error file=participants/${f}::${p}`);
    }
  }
}
console.log(`\n${files.length - failed}/${files.length} file(s) valid.`);
process.exit(failed ? 1 : 0);
