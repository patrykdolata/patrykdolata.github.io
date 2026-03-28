#!/usr/bin/env node

/**
 * Task Matcher Module
 * Matches git commits to TODO tasks using keyword and file path analysis
 */

/**
 * Extract keywords from task text
 */
function extractKeywords(taskText) {
  // Remove markdown formatting
  let text = taskText.replace(/`/g, '').replace(/\*/g, '');

  // Extract important words (filter common words)
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'czyli', 'lub', 'oraz', 'dla', 'jest'
  ]);

  const words = text
    .toLowerCase()
    .split(/[\s\-_\/\\,;.:()\[\]{}]+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  // Remove duplicates
  return [...new Set(words)];
}

/**
 * Calculate keyword match score between task and commit
 */
function matchKeywords(task, commit) {
  const taskKeywords = new Set(task.keywords || extractKeywords(task.text));
  const commitText = (commit.message + ' ' + commit.files.join(' ')).toLowerCase();

  const matchedKeywords = [];
  for (const keyword of taskKeywords) {
    if (commitText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }

  const score = taskKeywords.size > 0
    ? matchedKeywords.length / taskKeywords.size
    : 0;

  return {
    score: Math.min(score, 1.0),
    matchedKeywords,
    totalKeywords: taskKeywords.size
  };
}

/**
 * Calculate file path match score
 */
function matchFilePaths(task, commit) {
  if (!task.associatedFiles || task.associatedFiles.length === 0) {
    return { score: 0, matchedFiles: [] };
  }

  const taskFiles = new Set(
    task.associatedFiles.map(f => f.toLowerCase())
  );
  const commitFiles = new Set(
    commit.files.map(f => f.toLowerCase())
  );

  const matchedFiles = [];
  for (const taskFile of taskFiles) {
    for (const commitFile of commitFiles) {
      // Check if commit file ends with task file (handles paths)
      if (commitFile.endsWith(taskFile) || commitFile.includes(taskFile)) {
        matchedFiles.push(commitFile);
      }
    }
  }

  // Jaccard similarity: intersection / union
  const intersection = matchedFiles.length;
  const union = taskFiles.size + commitFiles.size - intersection;
  const score = union > 0 ? intersection / union : 0;

  return {
    score: Math.min(score, 1.0),
    matchedFiles: [...new Set(matchedFiles)]
  };
}

/**
 * Calculate combined match score
 */
function calculateMatchScore(task, commit, config = {}) {
  const weights = {
    keyword: config.keywordWeight || 0.3,
    filepath: config.filePathWeight || 0.4,
    semantic: config.semanticWeight || 0.3
  };

  const keywordMatch = matchKeywords(task, commit);
  const fileMatch = matchFilePaths(task, commit);

  // Combined score (semantic not implemented yet, so redistribute weight)
  const totalWeight = weights.keyword + weights.filepath;
  const normalizedKeywordWeight = weights.keyword / totalWeight;
  const normalizedFileWeight = weights.filepath / totalWeight;

  const finalScore =
    keywordMatch.score * normalizedKeywordWeight +
    fileMatch.score * normalizedFileWeight;

  // Determine confidence level
  let confidence = 'low';
  if (finalScore >= 0.85) {
    confidence = 'high';
  } else if (finalScore >= 0.65) {
    confidence = 'medium';
  }

  return {
    score: finalScore,
    confidence,
    breakdown: {
      keyword: keywordMatch,
      filepath: fileMatch
    }
  };
}

/**
 * Find best matching tasks for a commit
 */
function findMatchingTasks(commit, pendingTasks, config = {}) {
  const matches = [];
  const threshold = config.confidenceThreshold || 0.65;

  for (const task of pendingTasks) {
    const matchResult = calculateMatchScore(task, commit, config);

    if (matchResult.score >= threshold * 0.8) { // Lower threshold slightly to catch more
      matches.push({
        task,
        ...matchResult
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * Group matches by confidence level
 */
function groupMatchesByConfidence(matches) {
  return {
    high: matches.filter(m => m.confidence === 'high'),
    medium: matches.filter(m => m.confidence === 'medium'),
    low: matches.filter(m => m.confidence === 'low')
  };
}

module.exports = {
  extractKeywords,
  matchKeywords,
  matchFilePaths,
  calculateMatchScore,
  findMatchingTasks,
  groupMatchesByConfidence
};
