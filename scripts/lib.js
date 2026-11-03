// Shared rules for participant files. Used by validate-participants.js and build-participants.js.
// This code only ever *parses* contributor files as JSON data - it never executes them.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PARTICIPANTS_DIR = path.join(ROOT, 'participants');

const LIMITS = { name: 30, emoji: 16, fact: 140 };
const ALLOWED_KEYS = ['name', 'emoji', 'fact'];
// GitHub usernames: letters, digits, single hyphens (we are a bit lenient).
const FILENAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?\.json$/;
const CONTROL_RE = /[\u0000-\u001F\u007F]/;

function listParticipantFiles() {
  if (!fs.existsSync(PARTICIPANTS_DIR)) return [];
  return fs.readdirSync(PARTICIPANTS_DIR).filter((f) => !f.startsWith('.')).sort();
}

// Returns an array of human-friendly problems. Empty array = file is OK.
function checkFile(filename) {
  const problems = [];
  const full = path.join(PARTICIPANTS_DIR, filename);

  if (!filename.endsWith('.json')) {
    return [`"${filename}" is not a .json file. Only .json files belong in participants/.`];
  }
  if (!FILENAME_RE.test(filename)) {
    problems.push(`File name "${filename}" should be your GitHub username + ".json" (letters, numbers and hyphens only), e.g. alex-123.json`);
  }
  let raw;
  try {
    raw = fs.readFileSync(full, 'utf8');
  } catch (e) {
    return [`Could not read file: ${e.message}`];
  }
  if (raw.length > 2000) problems.push('File is too big (max 2000 characters).');
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1); // tolerate a BOM from Windows editors

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    problems.push(`Not valid JSON: ${e.message}. Check for missing quotes, missing commas, or a trailing comma.`);
    return problems;
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    problems.push('The file must contain one JSON object: { "name": ..., "emoji": ..., "fact": ... }');
    return problems;
  }
  for (const key of Object.keys(data)) {
    if (!ALLOWED_KEYS.includes(key)) problems.push(`Unexpected field "${key}". Allowed fields: ${ALLOWED_KEYS.join(', ')}.`);
  }
  for (const key of ALLOWED_KEYS) {
    const v = data[key];
    if (typeof v !== 'string' || v.trim() === '') {
      problems.push(`"${key}" is required and must be non-empty text.`);
      continue;
    }
    if (CONTROL_RE.test(v)) problems.push(`"${key}" must not contain line breaks or control characters.`);
    if ([...v].length > LIMITS[key]) problems.push(`"${key}" is too long (max ${LIMITS[key]} characters, yours is ${[...v].length}).`);
    if (/[<>]/.test(v)) problems.push(`"${key}" must not contain < or > characters.`);
  }
  if (typeof data.emoji === 'string' && data.emoji.trim() !== '' && !/\p{Extended_Pictographic}/u.test(data.emoji)) {
    problems.push('"emoji" should contain an emoji, e.g. "🚀".');
  }
  return problems;
}

function readEntry(filename) {
  const raw = fs.readFileSync(path.join(PARTICIPANTS_DIR, filename), 'utf8').replace(/^﻿/, '');
  const d = JSON.parse(raw);
  return {
    id: filename.replace(/\.json$/, ''),
    name: d.name.trim(),
    emoji: d.emoji.trim(),
    fact: d.fact.trim(),
  };
}

module.exports = { ROOT, PARTICIPANTS_DIR, listParticipantFiles, checkFile, readEntry };
