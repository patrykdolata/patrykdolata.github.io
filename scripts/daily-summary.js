#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const gitAnalyzer = require('./git-analyzer');
const taskMatcher = require('./task-matcher');

/**
 * Daily Summary
 * Analyzes git commits and matches them to TODO tasks
 */

const projectRoot = path.join(__dirname, '..');
const configPath = path.join(projectRoot, '.project-config.json');
const schedulePath = path.join(projectRoot, '.todo-schedule.json');
const statePath = path.join(projectRoot, '.daily-summary-state.json');

function main() {
  console.log('📦 ANALYZING REPOSITORIES...\n');

  // Load configurations
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

  // Determine since timestamp (from last summary or null)
  const sinceTimestamp = state.lastSummaryDate || null;
  const sinceDisplay = sinceTimestamp
    ? new Date(sinceTimestamp).toISOString().replace('T', ' ').substring(0, 16)
    : 'beginning';

  // Analyze each repository
  const allCommits = [];

  for (const repo of config.repositories) {
    if (!repo.enabled) continue;

    // Resolve repo path cross-OS (macOS/Ubuntu)
    const resolvedPath = gitAnalyzer.resolveRepoPath(repo.name) ||
                         gitAnalyzer.resolveRepoPath(repo.path) ||
                         repo.path;

    const validation = gitAnalyzer.validateRepo(resolvedPath);

    if (!validation.valid) {
      console.log(`⚠️  ${repo.name}: ${validation.reason}`);
      continue;
    }

    const commits = gitAnalyzer.getCommitsSince(resolvedPath, sinceTimestamp);

    if (commits.length === 0) {
      console.log(`✓ ${repo.name}: 0 commits since ${sinceDisplay}`);
    } else {
      console.log(`✓ ${repo.name}: ${commits.length} commit(s) since ${sinceDisplay}`);
      commits.forEach(c => {
        c.repo = repo.name;
        c.repoPath = resolvedPath;
      });
      allCommits.push(...commits);
    }
  }

  if (allCommits.length === 0) {
    console.log('\n📊 No new commits found. Nothing to summarize.\n');
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📊 COMMITS SUMMARY (${allCommits.length} total):\n`);

  // Group commits by repo
  const commitsByRepo = {};
  for (const commit of allCommits) {
    if (!commitsByRepo[commit.repo]) {
      commitsByRepo[commit.repo] = [];
    }
    commitsByRepo[commit.repo].push(commit);
  }

  // Display commits
  for (const [repoName, commits] of Object.entries(commitsByRepo)) {
    console.log(`${repoName}:`);
    for (const commit of commits) {
      const timeAgo = getTimeAgo(new Date(commit.timestamp));
      console.log(`  ${commit.hash.substring(0, 7)} "${commit.message}" (${timeAgo})`);

      // Get diff stats
      const prevCommit = `${commit.hash}^`;
      const diffStats = gitAnalyzer.getChangedFiles(commit.repoPath, prevCommit, commit.hash);

      for (const file of diffStats.slice(0, 3)) {
        console.log(`    ${file.file} (+${file.insertions}, -${file.deletions})`);
      }
      if (diffStats.length > 3) {
        console.log(`    ... and ${diffStats.length - 3} more files`);
      }
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 MATCHING TASKS...\n');

  // Get pending tasks
  const pendingTasks = scheduleData.schedule.filter(t => t.status === 'pending');

  // Match commits to tasks
  const matches = {
    high: [],
    medium: [],
    low: []
  };

  const unmatchedCommits = [];

  for (const commit of allCommits) {
    const taskMatches = taskMatcher.findMatchingTasks(
      commit,
      pendingTasks,
      config.matching
    );

    if (taskMatches.length === 0) {
      unmatchedCommits.push(commit);
    } else {
      const bestMatch = taskMatches[0];
      const matchData = {
        commit,
        task: bestMatch.task,
        score: bestMatch.score,
        confidence: bestMatch.confidence,
        breakdown: bestMatch.breakdown
      };

      matches[bestMatch.confidence].push(matchData);
    }
  }

  // Display high confidence matches
  if (matches.high.length > 0) {
    console.log('✅ HIGH CONFIDENCE MATCHES (auto-suggest):\n');

    for (let i = 0; i < matches.high.length; i++) {
      const match = matches.high[i];
      console.log(`${i + 1}. ${match.task.task} [${match.task.estimate}]`);
      console.log(`   └─ Commit ${match.commit.hash.substring(0, 7)}: "${match.commit.message}"`);

      if (match.breakdown.filepath.matchedFiles.length > 0) {
        console.log(`      Files: ${match.breakdown.filepath.matchedFiles.slice(0, 2).join(', ')} ✓`);
      }

      if (match.breakdown.keyword.matchedKeywords.length > 0) {
        console.log(`      Keywords: ${match.breakdown.keyword.matchedKeywords.slice(0, 3).join(', ')} ✓`);
      }

      console.log(`      Score: ${(match.score * 100).toFixed(0)}% (keyword: ${(match.breakdown.keyword.score * 100).toFixed(0)}%, filepath: ${(match.breakdown.filepath.score * 100).toFixed(0)}%)\n`);
    }
  }

  // Display medium confidence matches
  if (matches.medium.length > 0) {
    console.log('⚠️  MEDIUM CONFIDENCE (need confirmation):\n');

    for (let i = 0; i < matches.medium.length; i++) {
      const match = matches.medium[i];
      console.log(`${i + 1}. ${match.task.task} [${match.task.estimate}]`);
      console.log(`   └─ Commit ${match.commit.hash.substring(0, 7)}: "${match.commit.message}"`);

      if (match.breakdown.filepath.matchedFiles.length > 0) {
        console.log(`      Files: ${match.breakdown.filepath.matchedFiles.slice(0, 2).join(', ')}`);
      }

      console.log(`      Score: ${(match.score * 100).toFixed(0)}%`);
      console.log(`   └─ Mark as complete? (requires user confirmation)\n`);
    }
  }

  // Display unmatched work
  if (unmatchedCommits.length > 0) {
    console.log('❓ UNMATCHED WORK:\n');

    for (const commit of unmatchedCommits.slice(0, 5)) {
      console.log(`  • Commit ${commit.hash.substring(0, 7)}: "${commit.message}" (${commit.repo})`);
      console.log(`    └─ No matching task found (score < ${config.matching.confidenceThreshold * 0.8})`);
      console.log(`    └─ Options: (a) match manually, (b) add as unplanned work, (c) ignore\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 PROPOSED UPDATES:\n');

  if (matches.high.length > 0) {
    console.log('Mark as COMPLETE [x]:');
    for (const match of matches.high) {
      console.log(`  ✓ ${match.task.task} [${match.task.estimate}]`);
    }
  } else {
    console.log('No automatic updates proposed.');
  }

  if (matches.medium.length > 0) {
    console.log('\nAWAITING YOUR INPUT:');
    for (const match of matches.medium) {
      console.log(`  ? ${match.task.task} [${match.task.estimate}]`);
    }
  }

  if (unmatchedCommits.length > 0) {
    console.log(`\n  ? ${unmatchedCommits.length} unmatched commit(s)`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Calculate time tracking
  const today = new Date().toISOString().split('T')[0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[new Date().getDay()];
  const plannedToday = config.schedule.workingHours[todayDayName];

  const estimatedWork = matches.high.reduce((sum, m) => sum + m.task.estimateHours, 0);

  console.log('⏱️  TIME TRACKING:');
  console.log(`  Planned for today (${todayDayName}): ${plannedToday}h`);
  console.log(`  Work detected: ~${estimatedWork.toFixed(1)}h`);

  if (estimatedWork > plannedToday) {
    console.log(`  You worked ${(estimatedWork - plannedToday).toFixed(1)}h extra today! 💪\n`);
  } else if (estimatedWork < plannedToday) {
    console.log(`  ${(plannedToday - estimatedWork).toFixed(1)}h remaining for today.\n`);
  } else {
    console.log(`  Right on track! ✓\n`);
  }

  // Progress update
  const currentCompleted = scheduleData.progress.completedTasks;
  const newCompleted = currentCompleted + matches.high.length;
  const totalTasks = scheduleData.progress.totalTasks;

  console.log('📊 PROGRESS UPDATE:');
  console.log(`  Before: ${currentCompleted}/${totalTasks} tasks (${scheduleData.progress.percentComplete}%)`);
  console.log(`  After: ${newCompleted}/${totalTasks} tasks (${((newCompleted / totalTasks) * 100).toFixed(1)}%)`);

  // Velocity calculation (simplified)
  const newVelocity = estimatedWork > 0 ? (estimatedWork / 1).toFixed(1) : 'N/A';
  console.log(`  Velocity: ${newVelocity}h/day (target: ${scheduleData.progress.targetVelocity})`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  IMPORTANT: This is a PREVIEW only.');
  console.log('📋 To apply changes, use the Task tool to:');
  console.log('   1. Confirm which tasks to mark as complete');
  console.log('   2. Update TODO.md');
  console.log('   3. Update .todo-schedule.json');
  console.log('   4. Regenerate TODO.html');
  console.log('   5. Update .daily-summary-state.json\n');

  // Return data for AI to process
  return {
    highConfidence: matches.high,
    mediumConfidence: matches.medium,
    unmatched: unmatchedCommits,
    estimatedWork,
    plannedToday
  };
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

main();
