#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Today's Plan Display
 * Shows what tasks are planned for today
 */

const projectRoot = path.join(__dirname, '..');
const schedulePath = path.join(projectRoot, '.todo-schedule.json');

function main() {
  if (!fs.existsSync(schedulePath)) {
    console.log('⚠️  No schedule found. Run /plan-schedule first.');
    return;
  }

  const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date(today);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesShort = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
  const dayName = dayNames[todayDate.getDay()];
  const dayNameShort = dayNamesShort[todayDate.getDay()];

  // Get available hours today
  const config = JSON.parse(
    fs.readFileSync(path.join(projectRoot, '.project-config.json'), 'utf8')
  );
  const hoursToday = config.schedule.workingHours[dayName];

  // Find tasks planned for today
  const todayTasks = scheduleData.schedule.filter(
    t => t.plannedDate === today && t.status === 'pending'
  );

  // Find overdue tasks
  const overdueTasks = scheduleData.schedule.filter(
    t => t.plannedDate < today && t.status === 'pending'
  );

  // Display
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📅 TODAY: ${today} (${dayNameShort})`);
  console.log(`⏰ AVAILABLE TIME: ${hoursToday}h`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (todayTasks.length === 0) {
    console.log('🎉 No tasks planned for today!\n');
  } else {
    const totalHoursPlanned = todayTasks.reduce((sum, t) => sum + t.estimateHours, 0);
    console.log(`🎯 PLANNED FOR TODAY (${totalHoursPlanned}h):\n`);

    let currentFeature = null;
    for (const task of todayTasks) {
      if (task.feature !== currentFeature) {
        console.log(`\n${task.feature}`);
        console.log('┌' + '─'.repeat(60) + '┐');
        currentFeature = task.feature;
      }

      const taskDisplay = task.task.length > 50
        ? task.task.substring(0, 47) + '...'
        : task.task;

      console.log(`│ [ ] ${taskDisplay.padEnd(50)} [${task.estimate}] │`);

      if (task.associatedFiles.length > 0) {
        const files = task.associatedFiles.slice(0, 2).join(', ');
        console.log(`│     Files: ${files.substring(0, 48).padEnd(48)} │`);
      }
    }
    console.log('└' + '─'.repeat(60) + '┘\n');
  }

  // Show overdue tasks
  if (overdueTasks.length > 0) {
    const overdueHours = overdueTasks.reduce((sum, t) => sum + t.estimateHours, 0);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⚠️  OVERDUE TASKS (${overdueTasks.length} tasks, ${overdueHours}h):\n`);

    for (const task of overdueTasks.slice(0, 5)) {
      const daysOverdue = Math.floor((todayDate - new Date(task.plannedDate)) / (1000 * 60 * 60 * 24));
      console.log(`  • ${task.task.substring(0, 50)} [${task.estimate}]`);
      console.log(`    Due: ${task.plannedDate} (${daysOverdue} days ago)\n`);
    }

    if (overdueTasks.length > 5) {
      console.log(`  ... and ${overdueTasks.length - 5} more\n`);
    }
    console.log('💡 RECOMMENDATION: Focus on overdue tasks first\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 OVERALL PROGRESS:\n');

  const progress = scheduleData.progress;
  console.log(`  ✅ Completed: ${progress.completedTasks}/${progress.totalTasks} tasks (${progress.percentComplete}%)`);

  // Calculate current week
  const startDate = new Date(scheduleData.meta.startDate);
  const daysSinceStart = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(daysSinceStart / 7) + 1;
  const currentDay = daysSinceStart + 1;

  console.log(`  🎯 Timeline:`);
  console.log(`     ├─ Start: ${scheduleData.meta.startDate}`);
  console.log(`     ├─ Today: Week ${currentWeek}, Day ${currentDay}`);
  console.log(`     ├─ Planned end: ${scheduleData.meta.estimatedEndDate} (${scheduleData.meta.estimatedWeeks} weeks)`);

  if (progress.daysAheadBehind > 0) {
    console.log(`     └─ Status: ${progress.daysAheadBehind} days AHEAD of schedule ✓`);
  } else if (progress.daysAheadBehind < 0) {
    console.log(`     └─ Status: ${Math.abs(progress.daysAheadBehind)} days BEHIND schedule ⚠️`);
  } else {
    console.log(`     └─ Status: ON TRACK ✓`);
  }

  console.log(`\n  ⏱️  Velocity:`);
  if (progress.averageVelocity) {
    console.log(`     ├─ Target: ${progress.targetVelocity}`);
    console.log(`     ├─ Actual (last 7 days): ${progress.averageVelocity}`);
    console.log(`     └─ Status: ${progress.onTrack ? 'ON TRACK ✓' : 'BEHIND ⚠️'}`);
  } else {
    console.log(`     └─ Not enough data yet (run /daily-summary to start tracking)`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 USEFUL COMMANDS:\n');
  console.log('  /daily-summary  - End of day summary');
  console.log('  /plan-schedule  - Regenerate schedule');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
