#!/usr/bin/env node

const path = require('path');
const { resolveRepoPath } = require('./repo-resolver');
const git = require('./git-analyzer');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const names = args.filter(a => !a.startsWith('-'));

const projectRoot = path.join(__dirname, '..');

const targets = names.length > 0 ? names : ['meet-app-be', 'meet-app-fe'];

function infoFor(name) {
  const repoPath = resolveRepoPath(name, { projectRoot });
  let status = null;
  let valid = false;
  if (repoPath) {
    valid = git.validateRepo(repoPath).valid;
    try { status = git.getRepoStatus(repoPath); } catch (_) {}
  }
  return { name, path: repoPath, valid, status };
}

const results = targets.map(infoFor);

if (asJson) {
  console.log(JSON.stringify({ results }, null, 2));
} else {
  console.log('Repository resolution (cross-OS):');
  for (const r of results) {
    const ok = r.path ? (r.valid ? 'OK' : 'Not a valid git repo') : 'Not found';
    console.log(`- ${r.name}: ${r.path || '(not found)'} ${r.path ? `→ ${ok}` : ''}`);
    if (r.status && r.path) {
      const dirty = r.status.clean ? 'clean' : `modified: ${r.status.modified.length}, untracked: ${r.status.untracked.length}`;
      console.log(`  status: ${dirty}`);
    }
  }
  console.log('\nHints:');
  console.log('- Set env vars MEET_APP_BE_REPO / MEET_APP_FE_REPO (or *_DIR / *_PATH) to override.');
  console.log('- Place sibling repos as ../meet-app-be and ../meet-app-fe.');
  console.log('- Or update .project-config.json repositories paths.');
}

