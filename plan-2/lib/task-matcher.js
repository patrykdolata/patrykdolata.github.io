const { normalize } = require('./parse-todo');

function scoreCommitAgainstTask(commit, files, task, config) {
  const textTokens = new Set(normalize(`${commit.message} ${files.join(' ')}`).split(' '));
  const taskTokens = new Set(task.tokens);

  let matches = 0;
  let keywords = [];

  for (const token of taskTokens) {
    if (token.length < 3) continue;
    if (textTokens.has(token)) {
      matches++;
      keywords.push(token);
    }
  }

  const baseScore = taskTokens.size ? matches / taskTokens.size : 0;
  const boosted = keywords.length > 0 ? baseScore * (config.keywordBoost || 1) : baseScore;

  return {
    score: boosted,
    keywords
  };
}

function matchCommitsToTasks(commits, tasks, filesByCommit, config) {
  const minScore = config.minScore || 0.15;
  const matches = [];

  for (const commit of commits) {
    const files = filesByCommit[commit.hash] || [];
    let best = null;

    for (const task of tasks) {
      if (task.status === 'done') continue; // focus on pending tasks
      const { score, keywords } = scoreCommitAgainstTask(commit, files, task, config);
      if (score >= minScore && (!best || score > best.score)) {
        best = { task, score, keywords };
      }
    }

    if (best) {
      matches.push({
        commit,
        task: best.task,
        score: Number(best.score.toFixed(2)),
        keywords: best.keywords
      });
    }
  }

  return matches;
}

module.exports = {
  matchCommitsToTasks
};
