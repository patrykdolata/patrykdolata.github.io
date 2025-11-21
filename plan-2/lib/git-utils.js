const { execSync } = require('child_process');

function run(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: 'utf8' }).trim();
}

function getCommitsSince(repoPath, sinceIso) {
  const sinceArg = sinceIso ? `--since="${sinceIso}"` : '--since="2 days ago"';
  const raw = run(`git log ${sinceArg} --pretty=format:'%H|%ct|%s'`, repoPath);
  if (!raw) return [];
  return raw.split('\n').filter(Boolean).map(line => {
    const [hash, ts, message] = line.split('|');
    return {
      hash,
      timestamp: Number(ts) * 1000,
      message
    };
  });
}

function getCommitFiles(repoPath, hash) {
  const raw = run(`git show --name-only --pretty="" ${hash}`, repoPath);
  return raw.split('\n').filter(Boolean);
}

function currentHead(repoPath) {
  try {
    return run('git rev-parse HEAD', repoPath);
  } catch {
    return null;
  }
}

module.exports = {
  getCommitsSince,
  getCommitFiles,
  currentHead
};
