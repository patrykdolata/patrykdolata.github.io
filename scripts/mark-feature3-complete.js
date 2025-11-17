#!/usr/bin/env node

const path = require('path');
const { bulkUpdateTasks, regenerateTodoHtml } = require('./update-todo.js');

const projectRoot = path.join(__dirname, '..');
const todoMdPath = path.join(projectRoot, 'TODO.md');

console.log('📝 Marking Feature 3 tasks as complete...\n');

// List of tasks to mark as complete
const tasksToComplete = [
  // Backend - Manual Participant Management
  { taskText: 'Encja EventParticipant (uproszczona)' },
  { taskText: 'Migracja V1_2__Add_event_participant_table.sql' },
  { taskText: 'EventParticipantRepository + query methods' },
  { taskText: 'POST /api/v1/events/{eventId}/participants (manual add)' },
  { taskText: 'DELETE /api/v1/events/{eventId}/participants/{userId} (remove)' },
  { taskText: 'GET /api/v1/events/{eventId}/participants (lista)' },
  { taskText: 'ParticipantService - manual management' },
  { taskText: 'Sprawdzanie uprawnień: tylko organizator wydarzenia' },

  // Flutter - Manual Participant Management UI
  { taskText: 'ParticipantsManageScreen (dla organizatora)' },
  { taskText: 'Lista uczestników - prosta' },
  { taskText: 'Dodaj uczestnika - manual' },
  { taskText: 'HTTP POST /api/v1/events/{id}/participants' },
  { taskText: 'Usuń uczestnika' },
  { taskText: 'Update UI po dodaniu/usunięciu' },
  { taskText: 'ParticipantManagementService + Notifier' }
];

// Update tasks in TODO.md
console.log('Updating TODO.md...');
const results = bulkUpdateTasks(todoMdPath, tasksToComplete);

console.log(`✅ Updated: ${results.updated} tasks`);
if (results.failed.length > 0) {
  console.log(`❌ Failed: ${results.failed.length} tasks`);
  results.failed.forEach(fail => {
    console.log(`   - ${fail.taskText}: ${fail.reason}`);
  });
}

// Regenerate TODO.html
console.log('\nRegenerating TODO.html...');
const htmlResult = regenerateTodoHtml(projectRoot);
if (htmlResult.success) {
  console.log('✅ TODO.html regenerated successfully');
} else {
  console.log(`❌ Failed to regenerate TODO.html: ${htmlResult.reason}`);
}

console.log('\n✨ Done!');
