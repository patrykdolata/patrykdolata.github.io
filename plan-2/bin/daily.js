#!/usr/bin/env node

/**
 * plan-2 daily dashboard
 *
 * - Parses plan-2/TODO.md
 * - Reads plan-2/config.json + plan-2/state.json
 * - Scans each repo for commits since last run (or last 2 days if never run)
 * - Matches commits to TODO tasks by keyword overlap
 * - Prints a concise dashboard and updates state.json
 */

const fs = require('fs');
const path = require('path');
const { parseTodo, summarize, pendingTop } = require('../lib/parse-todo');
const { getCommitsSince, getCommitFiles, currentHead } = require('../lib/git-utils');
const { matchCommitsToTasks } = require('../lib/task-matcher');
const render = require('./render');
const scheduleGen = require('./schedule');

const projectRoot = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(projectRoot, 'config.json'), 'utf8'));
const statePath = path.join(projectRoot, 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

function nowIso() {
  return new Date().toISOString();
}

function formatDate(ts) {
  return new Date(ts).toISOString().replace('T', ' ').slice(0, 16);
}

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📅 DAILY CHECK (plan-2)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const todoPath = path.join(projectRoot, config.taskFile);
  const tasks = parseTodo(todoPath);
  const summary = summarize(tasks);

  console.log(`Tasks: ${summary.done}/${summary.total} done (${summary.percent}%)`);
  console.log(`Pending: ${summary.pending}, Maybe: ${summary.maybe}`);
  console.log(`Start date: ${config.schedule.startDate} | Weekly hours: ${config.schedule.weeklyHours} | Today capacity: ${config.schedule.todayHours}h\n`);

  const since = state.lastRunAt;
  const filesByCommit = {};
  const allCommits = [];

  for (const repo of config.repositories) {
    if (!repo.enabled) continue;
    const repoPath = repo.path;
    let commits = [];
    try {
      commits = getCommitsSince(repoPath, since);
    } catch (e) {
      console.log(`⚠️  ${repo.name}: ${e.message}`);
      continue;
    }

    if (commits.length === 0) {
      console.log(`✓ ${repo.name}: no commits since ${since || 'last 2 days'}`);
    } else {
      console.log(`✓ ${repo.name}: ${commits.length} commit(s) since ${since || 'last 2 days'}`);
      for (const commit of commits) {
        filesByCommit[commit.hash] = getCommitFiles(repoPath, commit.hash);
        commit.repo = repo.name;
      }
      allCommits.push(...commits);
    }

    // update head in memory
    if (!state.repos[repo.name]) state.repos[repo.name] = {};
    state.repos[repo.name].lastHead = currentHead(repoPath);
  }

  if (allCommits.length === 0) {
    console.log('\n📊 No new commits. Nothing to match.\n');
  } else {
    const matches = matchCommitsToTasks(allCommits, tasks, filesByCommit, config.matching);

    console.log('\n🎯 MATCHED COMMITS → TASKS\n');
    if (matches.length === 0) {
      console.log('No matches above threshold.');
    } else {
      matches.slice(0, 15).forEach((m, idx) => {
        const ago = formatDate(m.commit.timestamp);
        console.log(`${idx + 1}. ${m.task.feature} / ${m.task.subsection}`);
        console.log(`   Task: ${m.task.text}`);
        console.log(`   Commit: ${m.commit.hash.slice(0, 7)} "${m.commit.message}" @ ${ago} (${m.commit.repo})`);
        if (m.keywords.length > 0) {
          console.log(`   Keywords: ${m.keywords.join(', ')} | Score: ${m.score}`);
        } else {
          console.log(`   Score: ${m.score}`);
        }
        const files = filesByCommit[m.commit.hash] || [];
        if (files.length > 0) {
          console.log(`   Files: ${files.slice(0, 3).join(', ')}${files.length > 3 ? ' …' : ''}`);
        }
        console.log('');
      });
    }
  }

  const nextUp = pendingTop(tasks, 5);
  console.log('🚀 NEXT 5 PENDING TASKS');
  nextUp.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.feature} / ${t.subsection} – ${t.text}`);
  });

  // Save state
  state.lastRunAt = nowIso();
  state.stats.completed = summary.done;
  state.stats.pending = summary.pending;
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');

  // Regenerate HTML dashboard
  try {
    render.main ? render.main() : require('./render'); // render.js also executes when required
    console.log('🖨️  TODO.html regenerated in plan-2/');
  } catch (e) {
    console.log(`⚠️  Failed to regenerate TODO.html: ${e.message}`);
  }

  // Regenerate schedule snapshot
  try {
    scheduleGen.main ? scheduleGen.main() : require('./schedule');
    console.log('📅 schedule.json regenerated in plan-2/');
  } catch (e) {
    console.log(`⚠️  Failed to regenerate schedule.json: ${e.message}`);
  }

  console.log('\n💾 State saved to plan-2/state.json');
  console.log('Done.\n');
}

main();
