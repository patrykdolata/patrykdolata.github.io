#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const schedulePath = path.join(__dirname, '..', '.todo-schedule.json');
const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

console.log('📅 Completing remaining Feature 3 tasks...\n');

const remainingTasks = [
  'Sprawdzanie uprawnień: tylko organizator wydarzenia',
  'Lista uczestników - prosta',
  'Dodaj uczestnika - manual',
  'Usuń uczestnika',
  'Update UI po dodaniu/usunięciu'
];

const completionDate = '2025-11-17';
let updatedCount = 0;

schedule.schedule.forEach(task => {
  if (task.feature === 'Feature 3: Zarządzanie Uczestnikami - MANUAL' &&
      remainingTasks.includes(task.task) &&
      task.status !== 'completed') {
    task.status = 'completed';
    task.completedDate = completionDate;
    updatedCount++;
    console.log(`✅ Marked as complete: ${task.task}`);
  }
});

fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2), 'utf8');

console.log(`\n✅ Updated ${updatedCount} remaining tasks`);
console.log('✨ Done!');
