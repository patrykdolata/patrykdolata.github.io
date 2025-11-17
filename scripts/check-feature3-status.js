#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const schedulePath = path.join(__dirname, '..', '.todo-schedule.json');
const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

console.log('📊 Feature 3 tasks status:\n');

const feature3Tasks = schedule.schedule.filter(task =>
  task.feature === 'Feature 3: Zarządzanie Uczestnikami - MANUAL'
);

feature3Tasks.forEach((task, index) => {
  const status = task.status === 'completed' ? '✅' : '❌';
  console.log(`${status} [${task.status}] ${task.task}`);
});

const completed = feature3Tasks.filter(t => t.status === 'completed').length;
const total = feature3Tasks.length;

console.log(`\n📈 Progress: ${completed}/${total} tasks completed`);
