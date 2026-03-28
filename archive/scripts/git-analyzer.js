#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { resolveRepoPath } = require('./repo-resolver');

/**
 * Git Analyzer Module
 * Analyzes git repositories for commits, changes, and file modifications
 */

/**
 * Check if a repository exists and is a valid git repo
 */
function validateRepo(repoPath) {
  try {
    if (!fs.existsSync(repoPath)) {
      return { valid: false, reason: `Directory does not exist: ${repoPath}` };
    }

    const gitDir = path.join(repoPath, '.git');
    if (!fs.existsSync(gitDir)) {
      return { valid: false, reason: `Not a git repository: ${repoPath}` };
    }

    // Check if repo has any commits
    try {
      execSync('git rev-parse HEAD', { cwd: repoPath, stdio: 'pipe' });
    } catch (e) {
      return { valid: false, reason: `No commits in repository: ${repoPath}` };
    }

    return { valid: true, reason: 'OK' };
  } catch (error) {
    return { valid: false, reason: error.message };
  }
}

/**
 * Get commits since a specific timestamp
 * @param {string} repoPath - Path to git repository
 * @param {string|null} sinceTimestamp - ISO timestamp or null for all commits
 * @returns {Array} Array of commit objects
 */
function getCommitsSince(repoPath, sinceTimestamp = null) {
  const validation = validateRepo(repoPath);
  if (!validation.valid) {
    console.error(`⚠️  ${validation.reason}`);
    return [];
  }

  try {
    let cmd = 'git log --pretty=format:"%H|%an|%ae|%ai|%s" --name-only';
    if (sinceTimestamp) {
      cmd += ` --since="${sinceTimestamp}"`;
    }

    const output = execSync(cmd, {
      cwd: repoPath,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });

    if (!output.trim()) {
      return [];
    }

    const commits = [];
    const blocks = output.split('\n\n').filter(b => b.trim());

    for (const block of blocks) {
      const lines = block.split('\n').filter(l => l.trim());
      if (lines.length === 0) continue;

      const [hash, author, email, timestamp, message] = lines[0].split('|');
      const files = lines.slice(1).filter(f => f.trim());

      commits.push({
        hash: hash.trim(),
        author: author.trim(),
        email: email.trim(),
        timestamp: new Date(timestamp.trim()).toISOString(),
        message: message.trim(),
        files: files
      });
    }

    return commits;
  } catch (error) {
    console.error(`Error getting commits from ${repoPath}:`, error.message);
    return [];
  }
}

/**
 * Get changed files with diff stats between two commits
 */
function getChangedFiles(repoPath, fromCommit, toCommit = 'HEAD') {
  const validation = validateRepo(repoPath);
  if (!validation.valid) {
    return [];
  }

  try {
    const cmd = `git diff --numstat ${fromCommit}..${toCommit}`;
    const output = execSync(cmd, { cwd: repoPath, encoding: 'utf8' });

    if (!output.trim()) {
      return [];
    }

    const files = [];
    const lines = output.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 3) {
        files.push({
          file: parts[2],
          insertions: parseInt(parts[0]) || 0,
          deletions: parseInt(parts[1]) || 0
        });
      }
    }

    return files;
  } catch (error) {
    console.error(`Error getting changed files from ${repoPath}:`, error.message);
    return [];
  }
}

/**
 * Get file content from a specific commit
 */
function getFileContent(repoPath, commitHash, filePath) {
  const validation = validateRepo(repoPath);
  if (!validation.valid) {
    return null;
  }

  try {
    const cmd = `git show ${commitHash}:${filePath}`;
    const content = execSync(cmd, { cwd: repoPath, encoding: 'utf8' });
    return content;
  } catch (error) {
    // File might not exist in that commit
    return null;
  }
}

/**
 * Get the last commit hash
 */
function getLastCommitHash(repoPath) {
  const validation = validateRepo(repoPath);
  if (!validation.valid) {
    return null;
  }

  try {
    const hash = execSync('git rev-parse HEAD', {
      cwd: repoPath,
      encoding: 'utf8'
    }).trim();
    return hash;
  } catch (error) {
    return null;
  }
}

/**
 * Get repository status (dirty/clean)
 */
function getRepoStatus(repoPath) {
  const validation = validateRepo(repoPath);
  if (!validation.valid) {
    return { clean: false, untracked: [], modified: [] };
  }

  try {
    const status = execSync('git status --porcelain', {
      cwd: repoPath,
      encoding: 'utf8'
    });

    const lines = status.split('\n').filter(l => l.trim());
    const untracked = [];
    const modified = [];

    for (const line of lines) {
      const statusCode = line.substring(0, 2);
      const file = line.substring(3);

      if (statusCode === '??') {
        untracked.push(file);
      } else {
        modified.push(file);
      }
    }

    return {
      clean: lines.length === 0,
      untracked,
      modified
    };
  } catch (error) {
    return { clean: false, untracked: [], modified: [] };
  }
}

module.exports = {
  validateRepo,
  getCommitsSince,
  getChangedFiles,
  getFileContent,
  getLastCommitHash,
  getRepoStatus,
  resolveRepoPath
};
