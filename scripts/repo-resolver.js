#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Resolve repository paths in a cross-OS way (macOS/Linux),
// trying in order: explicit arg/path, env vars, sibling dirs, config.

function isGitRepo(p) {
  try {
    return fs.existsSync(p) && fs.existsSync(path.join(p, '.git'));
  } catch (_) {
    return false;
  }
}

function loadProjectConfig(projectRoot) {
  try {
    const cfgPath = path.join(projectRoot, '.project-config.json');
    if (fs.existsSync(cfgPath)) {
      return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    }
  } catch (_) {}
  return null;
}

function envCandidates(nameOrSlug) {
  const keyBase = nameOrSlug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  const keys = [
    `${keyBase}_REPO`,
    `${keyBase}_DIR`,
    `${keyBase}_PATH`
  ];
  const vals = keys
    .map(k => process.env[k])
    .filter(Boolean);
  return [...new Set(vals)];
}

function siblingCandidates(projectRoot, nameOrSlug) {
  const basenames = [];
  // Prefer explicit slug if provided (e.g., 'meet-app-be')
  if (nameOrSlug && /^[a-z0-9\-_.]+$/i.test(nameOrSlug)) {
    basenames.push(nameOrSlug);
  }
  // Common defaults
  if (!basenames.includes('meet-app-be')) basenames.push('meet-app-be');
  if (!basenames.includes('meet-app-fe')) basenames.push('meet-app-fe');

  const parent = path.resolve(projectRoot, '..');
  return basenames.map(b => path.join(parent, b));
}

function configCandidates(projectRoot, nameOrSlug) {
  const cfg = loadProjectConfig(projectRoot);
  if (!cfg || !Array.isArray(cfg.repositories)) return [];
  const matches = cfg.repositories.filter(r =>
    r.enabled !== false && (
      r.name === nameOrSlug ||
      (r.path && path.basename(r.path) === nameOrSlug) ||
      ['meet-app-be','meet-app-fe'].includes(nameOrSlug)
    )
  );
  const all = matches.length ? matches : cfg.repositories;
  return all.map(r => r.path).filter(Boolean);
}

function resolveRepoPath(nameOrSlug, options = {}) {
  const projectRoot = options.projectRoot || path.join(__dirname, '..');

  // 1) If it's a direct path
  if (nameOrSlug && (nameOrSlug.startsWith('.') || nameOrSlug.startsWith('/'))) {
    const p = path.resolve(projectRoot, nameOrSlug);
    if (isGitRepo(p)) return p;
  }

  // 2) Env vars
  for (const p of envCandidates(nameOrSlug)) {
    const abs = path.isAbsolute(p) ? p : path.resolve(projectRoot, p);
    if (isGitRepo(abs)) return abs;
  }

  // 3) Sibling directories
  for (const p of siblingCandidates(projectRoot, nameOrSlug)) {
    if (isGitRepo(p)) return p;
  }

  // 4) Config repositories
  for (const p of configCandidates(projectRoot, nameOrSlug)) {
    if (isGitRepo(p)) return p;
  }

  return null;
}

module.exports = { resolveRepoPath };

