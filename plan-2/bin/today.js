#!/usr/bin/env node

/**
 * plan-2 today view
 * - Reads plan-2/schedule.json (generates it if missing)
 * - Prints tasks scheduled for today (plannedDate == today)
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const schedulePath = path.join(projectRoot, 'schedule.json');

function ensureSchedule() {
  if (fs.existsSync(schedulePath)) return;
  console.log('ℹ️  schedule.json not found, generating...');
  require('./schedule');
}

function main() {
  ensureSchedule();
  const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
  const today = new Date().toISOString().split('T')[0];

  const todaysTasks = schedule.schedule.filter(t => t.plannedDate === today);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📅 TODAY (${today}) — plan-2`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (todaysTasks.length === 0) {
    console.log('Brak zadań zaplanowanych na dziś w schedule.json.');
    return;
  }

  todaysTasks.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.feature} / ${t.subsection}`);
    console.log(`   ${t.text}${t.estimate ? ` (${t.estimate})` : ''} — ${t.status === 'done' ? '✅' : '⬜️'}`);
  });
}

main();
