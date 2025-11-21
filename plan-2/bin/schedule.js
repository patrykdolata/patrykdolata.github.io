#!/usr/bin/env node

/**
 * plan-2 schedule generator
 * - Builds a simple day-by-day schedule from plan-2/TODO.md
 * - Uses working hours from plan-2/config.json
 * - Writes plan-2/schedule.json
 */

const fs = require('fs');
const path = require('path');
const { parseTodo } = require('../lib/parse-todo');
const { scheduleTasks, stats } = require('../lib/scheduler');

const projectRoot = path.join(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(projectRoot, 'config.json'), 'utf8'));
const todoPath = path.join(projectRoot, 'TODO.md');
const outPath = path.join(projectRoot, 'schedule.json');

function main() {
  console.log('📅 Generating plan-2 schedule...');
  const tasks = parseTodo(todoPath);
  const scheduled = scheduleTasks(tasks, config);
  const summary = stats(scheduled);

  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      startDate: config.schedule.startDate,
      weeklyHours: config.schedule.weeklyHours,
      estimatedEndDate: summary.estimatedEndDate
    },
    schedule: scheduled,
    progress: summary
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`✅ Saved ${outPath}`);
  console.log(`   Progress: ${summary.percentComplete}% | End: ${summary.estimatedEndDate || 'n/a'}`);
}

main();
