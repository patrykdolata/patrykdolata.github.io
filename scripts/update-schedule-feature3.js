#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const schedulePath = path.join(projectRoot, '.todo-schedule.json');

console.log('📅 Updating .todo-schedule.json for Feature 3 completion...\n');

// Read schedule
const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

// Task IDs from Feature 3 (based on grep results)
const feature3TaskIds = [
  'encja-eventparticipant-uproszczona-67',
  'migracja-v1-2-add-event-participant-table-sql-68',
  'eventparticipantrepository-query-methods-69',
  'post-api-v1-events-eventid-participants-manual-add-70',
  'delete-api-v1-events-eventid-participants-userid-r-71',
  'get-api-v1-events-eventid-participants-lista-72',
  'participantservice-manual-management-73',
  // Task 74 - sprawdzanie uprawnień
  'participantsmanagescreen-dla-organizatora-75',
  // Task 76 - lista uczestników
  // Task 77 - dodaj uczestnika
  'http-post-api-v1-events-id-participants-78',
  // Task 79 - usuń uczestnika
  // Task 80 - update UI
  'participantmanagementservice-notifier-81'
];

const completionDate = '2025-11-17';
let updatedCount = 0;

// Update tasks in schedule
schedule.schedule.forEach(task => {
  // Check if task ID matches or if task text matches Feature 3 tasks
  const matchesId = feature3TaskIds.some(id => task.id.includes(id.split('-').slice(0, -1).join('-')));

  // Also check by task text content
  const feature3Keywords = [
    'EventParticipant',
    'participant',
    'Participant',
    'ParticipantService',
    'ParticipantsManageScreen',
    'ParticipantManagementService'
  ];

  const matchesKeyword = feature3Keywords.some(keyword =>
    task.task && task.task.includes(keyword)
  ) && task.feature === 'Feature 3: Zarządzanie Uczestnikami - MANUAL';

  if ((matchesId || matchesKeyword) && task.status !== 'completed') {
    task.status = 'completed';
    task.completedDate = completionDate;
    updatedCount++;
    console.log(`✅ Marked as complete: ${task.task}`);
  }
});

// Write updated schedule
fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2), 'utf8');

console.log(`\n✅ Updated ${updatedCount} tasks in schedule`);
console.log('✨ Done!');
